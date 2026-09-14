/**
 * Step 9: multi-consumer warp specialization on the two-CTA cluster.
 * PIPE_DEPTH=4, K_TILES=4, NUM_CONSUMER=2, EPI_N=64. Every stage holds two A
 * blocks and one B block per CTA. CTA 0's warps 0 and 1 each issue a
 * cooperative MMA against the shared B; writeback WG0 and WG1 drain TMEM
 * columns 0:256 and 256:512 in four 64-column chunks (shown here as two
 * 128-column halves so the trace keeps the same 9 cycles as Steps 7 and 8).
 * mma2tma expects two arrivals per stage; mma2ld and ld2mma are indexed by
 * consumer.
 */
import {
  BARRIER_COLOR,
  validate,
  type Scenario,
  type SlotState,
} from "../types";

type Slot = readonly [SlotState, string];

/** Both CTAs run the same load schedule; each stage carries A0, A1 and B. */
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
    ["reading", "k=0, 2 MMAs"],
    ["ready", "k=1 ready"],
    ["loading", "loading k=2"],
    ["free", "empty"],
  ],
  [
    ["free", "free"],
    ["reading", "k=1, 2 MMAs"],
    ["ready", "k=2 ready"],
    ["loading", "loading k=3"],
  ],
  [
    ["free", "free"],
    ["free", "free"],
    ["reading", "k=2, 2 MMAs"],
    ["ready", "k=3 ready"],
  ],
  [
    ["free", "free"],
    ["free", "free"],
    ["free", "free"],
    ["reading", "k=3, 2 MMAs"],
  ],
];
const allFree: Slot[] = [
  ["free", "free"],
  ["free", "free"],
  ["free", "free"],
  ["free", "free"],
];

const acc = (n: number, txt: string) => ({
  st: "accumulating" as const,
  filled: n,
  txt,
});
const both = <T,>(x: T): [T, T] => [x, x];
const halfLabel = (i: number) => `cols ${i * 128}:${(i + 1) * 128}`;

export const step9: Scenario = validate({
  id: "step9",
  title: "Multi-consumer warp specialization",
  short: "2 consumers",
  book: {
    chapter: "Scaling GEMM with Warp Specialization and Clusters",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_advanced/index.html#step-9-multi-consumer-warp-specialization",
  },
  intro: (
    <>
      A second MMA issue warp shares the staged B tile, so <code>mma2tma</code>{" "}
      needs two arrivals before a stage is refilled. Writeback splits per
      consumer, each with its own <code>mma2ld</code> and <code>ld2mma</code>{" "}
      slot and its own named barrier.
    </>
  ),
  label: "Step 9, two MMA consumers, cycle by cycle",
  cycles: 9,
  lanes: [
    {
      id: "tma",
      name: "TMA producer",
      sub: "each CTA, WG2 warp\u00a03",
      color: "var(--tma)",
    },
    {
      id: "mma0",
      name: "MMA issue 0",
      sub: "CTA 0, WG2 warp\u00a00",
      color: "var(--mma)",
    },
    {
      id: "mma1",
      name: "MMA issue 1",
      sub: "CTA 0, WG2 warp\u00a01",
      color: "var(--mma)",
    },
    {
      id: "wb0",
      name: "Writeback 0",
      sub: "each CTA, WG0",
      color: "var(--read)",
    },
    {
      id: "wb1",
      name: "Writeback 1",
      sub: "each CTA, WG1",
      color: "var(--read)",
    },
  ],
  segments: [
    {
      lane: "tma",
      from: 0,
      to: 1,
      kind: "load",
      label: "Load k=0",
      meta: "A0 A1 B",
    },
    {
      lane: "tma",
      from: 1,
      to: 2,
      kind: "load",
      label: "Load k=1",
      meta: "A0 A1 B",
    },
    {
      lane: "tma",
      from: 2,
      to: 3,
      kind: "load",
      label: "Load k=2",
      meta: "A0 A1 B",
    },
    {
      lane: "tma",
      from: 3,
      to: 4,
      kind: "load",
      label: "Load k=3",
      meta: "A0 A1 B",
    },
    {
      lane: "tma",
      from: 4,
      to: 9,
      kind: "idle",
      label: "done",
      meta: "next tile",
    },

    ...(["mma0", "mma1"] as const).flatMap((lane, c) => [
      {
        lane,
        from: 0,
        to: 2,
        kind: "wait" as const,
        label: "wait",
        meta: "tma2mma",
        color: BARRIER_COLOR.tma2mma,
      },
      {
        lane,
        from: 2,
        to: 3,
        kind: "mma" as const,
        label: "MMA k=0",
        meta: `A${c} + B`,
      },
      {
        lane,
        from: 3,
        to: 4,
        kind: "mma" as const,
        label: "MMA k=1",
        meta: `A${c} + B`,
      },
      {
        lane,
        from: 4,
        to: 5,
        kind: "mma" as const,
        label: "MMA k=2",
        meta: `A${c} + B`,
      },
      {
        lane,
        from: 5,
        to: 6,
        kind: "mma" as const,
        label: "MMA k=3",
        meta: `A${c} + B`,
      },
      {
        lane,
        from: 6,
        to: 7,
        kind: "signal" as const,
        label: "arrive",
        meta: `mma2ld[${c}]`,
      },
      { lane, from: 7, to: 9, kind: "idle" as const, label: "idle" },
    ]),

    ...(["wb0", "wb1"] as const).flatMap((lane, c) => [
      {
        lane,
        from: 0,
        to: 7,
        kind: "wait" as const,
        label: "wait",
        meta: `mma2ld[${c}]`,
        color: BARRIER_COLOR.mma2ld,
      },
      {
        lane,
        from: 7,
        to: 8,
        kind: "epi" as const,
        label: halfLabel(0),
        meta: "2 chunks",
      },
      {
        lane,
        from: 8,
        to: 9,
        kind: "epi" as const,
        label: halfLabel(1),
        meta: `ld2mma[${c}]`,
      },
    ]),
  ],
  barriers: [
    {
      id: "tma2mma",
      color: BARRIER_COLOR.tma2mma,
      desc: "Six blocks landed in CTA 0's barrier; both MMA warps wait on it",
    },
    {
      id: "mma2tma",
      color: BARRIER_COLOR.mma2tma,
      desc: "Needs 2 arrivals: a stage is reusable only after both consumers read it",
    },
    {
      id: "mma2ld",
      color: BARRIER_COLOR.mma2ld,
      desc: "Indexed by consumer; wakes the matching writeback warpgroup in both CTAs",
    },
    {
      id: "ld2mma",
      color: BARRIER_COLOR.ld2mma,
      desc: "Indexed by consumer; 256 arrivals free that consumer's TMEM range",
    },
  ],
  legend: [
    { name: "TMA load (per CTA)", color: "var(--tma)" },
    { name: "Cooperative MMA", color: "var(--mma)" },
    { name: "Epilogue chunk", color: "var(--read)" },
    { name: "Blocked on a barrier", color: "var(--ink-2)", wait: true },
  ],
  smem: {
    title: "SMEM stages (each CTA)",
    desc: "Asmem gains a consumer axis: every stage holds A block 0, A block 1 and one B block. B is loaded once and read by both MMAs.",
    groups: [{ slots: ["Stage 0", "Stage 1", "Stage 2", "Stage 3"] }],
  },
  tmem: {
    title: "TMEM accumulators (each CTA)",
    desc: "Two 128 x 256 ranges, one per consumer. WG0 drains the first, WG1 the second.",
    bars: [
      { label: "cols 0:256, consumer 0", segs: ["k0", "k1", "k2", "k3"] },
      { label: "cols 256:512, consumer 1", segs: ["k0", "k1", "k2", "k3"] },
    ],
  },
  tile: {
    title: "Cluster tile, 512 x 256",
    desc: "Consumer 0 owns the top 256 rows, consumer 1 the bottom 256; inside each, CTA 0 and CTA 1 hold 128 rows apiece. Both consumers multiply against the same two B slices, so one staged B tile feeds two MMAs.",
    rows: [
      { label: "A0, CTA 0", sub: "rows 0:128" },
      { label: "A0, CTA 1", sub: "rows 128:256" },
      { label: "A1, CTA 0", sub: "rows 256:384" },
      { label: "A1, CTA 1", sub: "rows 384:512" },
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
      slots: [stages[0]],
      bars: both({ st: "free", filled: 0, txt: "empty" }),
      tile: { a: "loading", b: "loading", d: "free" },
      explain: (
        <>
          Each CTA's producer now issues three loads per stage: A block 0
          (consumer 0's rows), A block 1 (consumer 1's rows, 256 rows further
          down) and one B block. Bsmem keeps its old shape because both
          consumers will read the same B. CTA 0 posts the byte count for 2 CTAs
          x (2 A + B) on <code>tma2mma[0]</code>.
        </>
      ),
    },
    {
      phase: "Prologue",
      barriers: [{ id: "tma2mma", tag: "[0]", note: "6 blocks across 2 CTAs" }],
      slots: [stages[1]],
      bars: both({ st: "free", filled: 0, txt: "empty" }),
      tile: { a: "loading", b: "loading", d: "free" },
      explain: (
        <>
          <code>tma2mma[0]</code> fires once all six blocks have landed. Both
          MMA issue warps wait on this same barrier, so one load feeds two MMAs.
        </>
      ),
    },
    {
      phase: "First MMAs",
      barriers: [
        { id: "tma2mma", tag: "[1]" },
        { id: "mma2tma", tag: "[0]", note: "2 arrivals, cta_mask=3" },
      ],
      slots: [stages[2]],
      bars: both(acc(1, "accum k=0")),
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          Warp 0 and warp 1 in CTA 0 each issue a cooperative MMA with{" "}
          <code>cta_group=2</code>: warp 0 pairs A block 0 with B and
          accumulates into TMEM columns 0:256, warp 1 pairs A block 1 with the
          same B into columns 256:512. <code>mma2tma[0]</code> was initialised
          for 2 arrivals, so the stage is released only after both consumers
          have read it.
        </>
      ),
    },
    {
      phase: "Steady state",
      barriers: [
        { id: "tma2mma", tag: "[2]" },
        { id: "mma2tma", tag: "[1]", note: "2 arrivals, cta_mask=3" },
      ],
      slots: [stages[3]],
      bars: both(acc(2, "accum k=0,1")),
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          k=1 for both consumers while k=3 is still loading. The B block in each
          stage is read twice but loaded once: that is the whole point of the
          second consumer.
        </>
      ),
    },
    {
      phase: "Steady state",
      barriers: [
        { id: "tma2mma", tag: "[3]" },
        { id: "mma2tma", tag: "[2]", note: "2 arrivals, cta_mask=3" },
      ],
      slots: [stages[4]],
      bars: both(acc(3, "accum k=0..2")),
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          Producers are done for this tile. Both consumers compute k=2 from
          stage 2.
        </>
      ),
    },
    {
      phase: "Drain",
      barriers: [{ id: "mma2tma", tag: "[3]", note: "2 arrivals, cta_mask=3" }],
      slots: [stages[5]],
      bars: both(acc(4, "accum k=0..3")),
      tile: { a: "reading", b: "reading", d: "accum" },
      explain: (
        <>
          Last K-tile. Each CTA's TMEM now holds two finished 128 x 256
          accumulators, one per consumer.
        </>
      ),
    },
    {
      phase: "K-loop done",
      barriers: [
        { id: "mma2ld", tag: "[0] [1]", note: "cta_mask=3, both CTAs" },
      ],
      slots: [allFree],
      bars: both({ st: "ready", filled: 4, txt: "result ready" }),
      tile: { a: "idle", b: "idle", d: "ready" },
      explain: (
        <>
          Each issue warp arrives on its own slot: warp 0 on{" "}
          <code>mma2ld[0]</code>, which wakes WG0, and warp 1 on{" "}
          <code>mma2ld[1]</code>, which wakes WG1, in both CTAs. The two
          consumers hand off independently from here on.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [],
      slots: [allFree],
      bars: both({ st: "reading", filled: 4, txt: halfLabel(0) }),
      tile: { a: "idle", b: "idle", d: "writing", chunk: 0 },
      explain: (
        <>
          Writeback runs per consumer: WG0 drains TMEM columns 0:256 and WG1
          columns 256:512, in 64-column chunks (<code>EPI_N=64</code>) so a
          thread holds only 64 fp32 at a time; two chunks are shown per cycle
          here. Each warpgroup syncs on its own named barrier,{" "}
          <code>warpgroup_sync(10 + wg_id)</code>, so their arrivals are never
          counted together.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [
        { id: "ld2mma", tag: "[0] [1]", note: "256 arrivals each, at CTA 0" },
      ],
      slots: [allFree],
      bars: both({ st: "reading", filled: 4, txt: halfLabel(1) }),
      tile: { a: "idle", b: "idle", d: "writing", chunk: 1 },
      explain: (
        <>
          Second half of each consumer's columns, staged through{" "}
          <code>Dsmem[wg_id]</code> with one TMA store per chunk. Then every
          writeback thread arrives on CTA 0's <code>ld2mma[wg_id]</code>, 256
          arrivals per slot. The two TMEM ranges are recycled independently:
          each MMA warp waits only on its own slot before starting the next
          tile.
        </>
      ),
    },
  ],
});
