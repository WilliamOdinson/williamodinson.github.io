/**
 * Step 8: two-CTA cluster.
 * PIPE_DEPTH=4, K_TILES=4. Each CTA loads a 128-row A slice and a 128-row
 * stored-B slice; CTA 0's warp 0 issues one cooperative MMA (cta_group=2)
 * that reads both CTAs' SMEM and fills a 128 x 256 accumulator in each CTA.
 * tma2mma and ld2mma live in CTA 0 (remote_view); mma2tma and mma2ld are
 * updated in both CTAs through cta_mask=3.
 */
import {
  BARRIER_COLOR,
  validate,
  type Scenario,
  type SlotState,
} from "../types";

type Slot = readonly [SlotState, string];

/** Both CTAs run the same load schedule, so one table serves both slot groups. */
const stages: Slot[][] = [
  [
    ["loading", "loading k=0"],
    ["free", "empty"],
    ["free", "empty"],
    ["free", "empty"],
  ],
  [
    ["ready", "k=0 ready"],
    ["loading", "loading k=1"],
    ["free", "empty"],
    ["free", "empty"],
  ],
  [
    ["reading", "k=0, MMA"],
    ["ready", "k=1 ready"],
    ["loading", "loading k=2"],
    ["free", "empty"],
  ],
  [
    ["free", "free"],
    ["reading", "k=1, MMA"],
    ["ready", "k=2 ready"],
    ["loading", "loading k=3"],
  ],
  [
    ["free", "free"],
    ["free", "free"],
    ["reading", "k=2, MMA"],
    ["ready", "k=3 ready"],
  ],
  [
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
    ["reading", "k=3, MMA"],
  ],
  [
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
  ],
  [
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
  ],
  [
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
  ],
];

const acc = (n: number, txt: string) => ({
  st: "accumulating" as const,
  filled: n,
  txt,
});

export const step8: Scenario = validate({
  id: "step8",
  title: "Two-CTA cluster",
  short: "Cluster",
  book: {
    chapter: "Scaling GEMM with Warp Specialization and Clusters",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_advanced/index.html#step-8-two-cta-cluster",
  },
  intro: (
    <>
      A 256 x 256 tile across two CTAs, computed by one cooperative MMA issued
      from CTA 0 that reads both CTAs' SMEM. Two barriers move to CTA 0 through{" "}
      <code>remote_view(0)</code>; the other two are updated in both CTAs at
      once with <code>cta_mask=3</code>.
    </>
  ),
  label: "Step 8, two-CTA cluster, cycle by cycle",
  cycles: 9,
  lanes: [
    {
      id: "tma0",
      name: "TMA producer",
      sub: "CTA 0, WG1 warp\u00a03",
      color: "var(--tma)",
    },
    {
      id: "tma1",
      name: "TMA producer",
      sub: "CTA 1, WG1 warp\u00a03",
      color: "var(--tma)",
    },
    {
      id: "mma",
      name: "MMA issue",
      sub: "CTA 0 only, WG1 warp\u00a00",
      color: "var(--mma)",
    },
    { id: "wb0", name: "Writeback", sub: "CTA 0, WG0", color: "var(--read)" },
    { id: "wb1", name: "Writeback", sub: "CTA 1, WG0", color: "var(--read)" },
  ],
  segments: [
    ...(["tma0", "tma1"] as const).flatMap((lane) => [
      {
        lane,
        from: 0,
        to: 1,
        kind: "load" as const,
        label: "Load k=0",
        meta: "stage 0",
      },
      {
        lane,
        from: 1,
        to: 2,
        kind: "load" as const,
        label: "Load k=1",
        meta: "stage 1",
      },
      {
        lane,
        from: 2,
        to: 3,
        kind: "load" as const,
        label: "Load k=2",
        meta: "stage 2",
      },
      {
        lane,
        from: 3,
        to: 4,
        kind: "load" as const,
        label: "Load k=3",
        meta: "stage 3",
      },
      {
        lane,
        from: 4,
        to: 9,
        kind: "idle" as const,
        label: "done",
        meta: "next tile",
      },
    ]),

    {
      lane: "mma",
      from: 0,
      to: 2,
      kind: "wait",
      label: "wait",
      meta: "tma2mma",
      color: BARRIER_COLOR.tma2mma,
    },
    {
      lane: "mma",
      from: 2,
      to: 3,
      kind: "mma",
      label: "MMA k=0",
      meta: "2-CTA MMA",
    },
    {
      lane: "mma",
      from: 3,
      to: 4,
      kind: "mma",
      label: "MMA k=1",
      meta: "2-CTA MMA",
    },
    {
      lane: "mma",
      from: 4,
      to: 5,
      kind: "mma",
      label: "MMA k=2",
      meta: "2-CTA MMA",
    },
    {
      lane: "mma",
      from: 5,
      to: 6,
      kind: "mma",
      label: "MMA k=3",
      meta: "2-CTA MMA",
    },
    {
      lane: "mma",
      from: 6,
      to: 7,
      kind: "signal",
      label: "arrive",
      meta: "mma2ld",
    },
    { lane: "mma", from: 7, to: 9, kind: "idle", label: "idle" },

    ...(["wb0", "wb1"] as const).flatMap((lane) => [
      {
        lane,
        from: 0,
        to: 7,
        kind: "wait" as const,
        label: "wait",
        meta: "mma2ld",
        color: BARRIER_COLOR.mma2ld,
      },
      {
        lane,
        from: 7,
        to: 8,
        kind: "epi" as const,
        label: "cols 0:128",
        meta: "epilogue",
      },
      {
        lane,
        from: 8,
        to: 9,
        kind: "epi" as const,
        label: "cols 128:256",
        meta: "ld2mma",
      },
    ]),
  ],
  barriers: [
    {
      id: "tma2mma",
      color: BARRIER_COLOR.tma2mma,
      desc: "Lives in CTA 0; counts bytes from both CTAs' loads",
    },
    {
      id: "mma2tma",
      color: BARRIER_COLOR.mma2tma,
      desc: "MMA done with a stage; cta_mask=3 releases it in both CTAs",
    },
    {
      id: "mma2ld",
      color: BARRIER_COLOR.mma2ld,
      desc: "K-loop done; cta_mask=3 wakes writeback in both CTAs",
    },
    {
      id: "ld2mma",
      color: BARRIER_COLOR.ld2mma,
      desc: "Lives in CTA 0; expects 128 arrivals from each CTA",
    },
  ],
  legend: [
    { name: "TMA load (per CTA)", color: "var(--tma)" },
    { name: "Cooperative MMA", color: "var(--mma)" },
    { name: "Epilogue chunk", color: "var(--read)" },
    { name: "Blocked on a barrier", color: "var(--ink-2)", wait: true },
  ],
  smem: {
    title: "SMEM stages",
    desc: "Four stages per CTA. Each holds that CTA's A slice and stored-B slice for one K-tile.",
    groups: [
      { label: "CTA 0", slots: ["Stage 0", "Stage 1", "Stage 2", "Stage 3"] },
      { label: "CTA 1", slots: ["Stage 0", "Stage 1", "Stage 2", "Stage 3"] },
    ],
  },
  tmem: {
    title: "TMEM accumulators",
    desc: "Each CTA keeps 128 rows x 256 columns of the 256 x 256 cluster tile.",
    bars: [
      { label: "CTA 0, rows 0:128", segs: ["k0", "k1", "k2", "k3"] },
      { label: "CTA 1, rows 128:256", segs: ["k0", "k1", "k2", "k3"] },
    ],
  },
  tile: {
    title: "Cluster tile, 256 x 256",
    desc: "Rows come from the A slice each CTA loaded; columns from the stored-B slices. The cooperative MMA reads all four operand blocks across both CTAs' SMEM.",
    rows: [
      { label: "A, CTA 0", sub: "rows 0:128" },
      { label: "A, CTA 1", sub: "rows 128:256" },
    ],
    cols: [
      { label: "B, CTA 0", sub: "cols 0:128" },
      { label: "B, CTA 1", sub: "cols 128:256" },
    ],
    chunks: 2,
  },
  steps: [
    {
      phase: "Prologue",
      barriers: [],
      slots: [stages[0], stages[0]],
      bars: [
        { st: "free", filled: 0, txt: "empty" },
        { st: "free", filled: 0, txt: "empty" },
      ],
      tile: { a: "loading", b: "loading", d: "free" },
      explain: (
        <>
          Each CTA's producer issues TMA loads for k=0 into its own stage 0: CTA
          0 fetches A rows 0:128 and stored-B rows 0:128 of the cluster tile,
          CTA 1 the next 128 of each. Both loads report to CTA 0's{" "}
          <code>tma2mma[0]</code> through <code>remote_view(0)</code>, and only
          CTA 0's producer posts the expected byte count, sized for both CTAs'
          slices.
        </>
      ),
    },
    {
      phase: "Prologue",
      barriers: [
        { id: "tma2mma", tag: "[0]", note: "both CTAs' bytes landed" },
      ],
      slots: [stages[1], stages[1]],
      bars: [
        { st: "free", filled: 0, txt: "empty" },
        { st: "free", filled: 0, txt: "empty" },
      ],
      tile: { a: "loading", b: "loading", d: "free" },
      explain: (
        <>
          <code>tma2mma[0]</code> completes only when both CTAs' bytes have
          arrived, so the MMA can never see a half-loaded stage. The producers
          move on to k=1; with <code>PIPE_DEPTH=4</code> they can run four loads
          ahead before <code>mma2tma</code> ever blocks them.
        </>
      ),
    },
    {
      phase: "First MMA",
      barriers: [
        { id: "tma2mma", tag: "[1]" },
        { id: "mma2tma", tag: "[0]", note: "cta_mask=3, both CTAs" },
      ],
      slots: [stages[2], stages[2]],
      bars: [acc(1, "accum k=0"), acc(1, "accum k=0")],
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          One elected thread in CTA 0's warp 0 issues a single cooperative MMA
          with <code>cta_group=2</code>; CTA 1's warp 0 skips this path
          entirely. The hardware reads stage 0 of A and B from both CTAs' SMEM
          and writes each CTA's 128 x 256 partial result into that CTA's own
          TMEM. The <code>mma2tma[0]</code> arrive uses <code>cta_mask=3</code>,
          so both CTAs' copies of the barrier flip.
        </>
      ),
    },
    {
      phase: "Steady state",
      barriers: [
        { id: "tma2mma", tag: "[2]" },
        { id: "mma2tma", tag: "[1]", note: "cta_mask=3" },
      ],
      slots: [stages[3], stages[3]],
      bars: [acc(2, "accum k=0,1"), acc(2, "accum k=0,1")],
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          k=1 computes while k=3 is still in flight. Each producer only ever
          waits on its local <code>mma2tma</code>, which the masked arrive keeps
          in step with CTA 0's.
        </>
      ),
    },
    {
      phase: "Steady state",
      barriers: [
        { id: "tma2mma", tag: "[3]" },
        { id: "mma2tma", tag: "[2]", note: "cta_mask=3" },
      ],
      slots: [stages[4], stages[4]],
      bars: [acc(3, "accum k=0..2"), acc(3, "accum k=0..2")],
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          Producers are done for this tile. k=2 computes from stage 2; stages 0
          and 1 are already free for the next tile's first loads.
        </>
      ),
    },
    {
      phase: "Drain",
      barriers: [{ id: "mma2tma", tag: "[3]", note: "cta_mask=3" }],
      slots: [stages[5], stages[5]],
      bars: [acc(4, "accum k=0..3"), acc(4, "accum k=0..3")],
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          Last K-tile. Both TMEM accumulators now hold a full 128 x 256 fp32
          result for their CTA's rows.
        </>
      ),
    },
    {
      phase: "K-loop done",
      barriers: [{ id: "mma2ld", note: "cta_mask=3, both CTAs" }],
      slots: [stages[6], stages[6]],
      bars: [
        { st: "ready", filled: 4, txt: "result ready" },
        { st: "ready", filled: 4, txt: "result ready" },
      ],
      tile: { a: "idle", b: "idle", d: "ready" },
      explain: (
        <>
          The issue thread arrives on <code>mma2ld</code> with{" "}
          <code>cta_mask=3</code>. One arrive wakes the writeback warpgroup in
          CTA 0 and in CTA 1 at the same time.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [],
      slots: [stages[7], stages[7]],
      bars: [
        { st: "reading", filled: 4, txt: "cols 0:128" },
        { st: "reading", filled: 4, txt: "cols 0:128" },
      ],
      tile: { a: "idle", b: "idle", d: "writing", chunk: 0 },
      explain: (
        <>
          Each CTA's WG0 drains its own 128 rows in two 128-column chunks, so a
          thread never holds 256 fp32 values at once. Chunk 0: TMEM columns
          0:128 to registers, cast, Dsmem, <code>warpgroup_sync(10)</code>, TMA
          store.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [{ id: "ld2mma", note: "256 arrivals at CTA 0" }],
      slots: [stages[8], stages[8]],
      bars: [
        { st: "reading", filled: 4, txt: "cols 128:256" },
        { st: "reading", filled: 4, txt: "cols 128:256" },
      ],
      tile: { a: "idle", b: "idle", d: "writing", chunk: 1 },
      explain: (
        <>
          Chunk 1, columns 128:256. Afterwards all 128 writeback threads in each
          CTA arrive on CTA 0's <code>ld2mma</code> via{" "}
          <code>remote_view(0)</code>; it was initialised for 256 arrivals, so
          the next tile's MMA cannot touch either TMEM until both CTAs have
          finished reading.
        </>
      ),
    },
  ],
});
