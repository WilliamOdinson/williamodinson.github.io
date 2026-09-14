/**
 * Step 4: TMA async load and store (three K chunks shown).
 * One thread issues each TMA load and posts the expected byte count on
 * tma_bar; the TMA engine counts the bytes down with complete_tx. The loop is
 * still sequential: load, wait, MMA, wait. The epilogue stages D through SMEM
 * and drains the TMA store with commit_group / wait_group(0).
 */
import {
  BARRIER_COLOR,
  validate,
  type Scenario,
  type Segment,
  type Step,
} from "../types";

const K_TILES = 3;
const BYTES = "32768 B";

const loadCycle = (k: number): Step => {
  const ph = k % 2;
  return {
    phase: k === 0 ? "Prologue" : "K-loop",
    barriers: [
      { id: "tma_bar", tag: `ph${ph}`, note: "complete_tx reaches 0" },
    ],
    slots: [
      [
        ["loading", `A k=${k}, TMA`],
        ["loading", `B k=${k}, TMA`],
      ],
      [["free", "empty"]],
    ],
    bars: [
      k === 0
        ? { st: "free", filled: 0, txt: "empty" }
        : { st: "accumulating", filled: k, txt: `holds k=0..${k - 1}` },
    ],
    explain:
      k === 0 ? (
        <>
          <code>tid == 0</code> issues both{" "}
          <code>Tx.copy_async(..., dispatch="tma_auto")</code> calls and{" "}
          <code>mbarrier.arrive.expect_tx(tma_bar, 32768)</code>: that counts
          the one expected arrival and registers the bytes still in flight, so
          the barrier stays incomplete. All 128 threads then{" "}
          <code>try_wait</code>. The TMA engine generates the addresses, moves
          the two 16 KB tiles, and <code>complete_tx</code>-es each landing byte
          off the count; at zero the phase completes and the wait returns.
        </>
      ) : (
        <>
          Chunk k={k}, same protocol, <code>phase_tma={ph}</code>. The load is
          issued only after the previous MMA has been waited for, so the TMA
          engine and the Tensor Core still take turns. What changed is who does
          the work: the 128 threads' address arithmetic and copy instructions
          became one instruction plus a barrier.
        </>
      ),
  };
};

const mmaCycle = (k: number): Step => {
  const ph = k % 2;
  return {
    phase: "K-loop",
    barriers: [
      { id: "mma_bar", tag: `ph${ph}`, note: "both phases flip after this" },
    ],
    slots: [
      [
        ["reading", `k=${k}, MMA`],
        ["reading", `k=${k}, MMA`],
      ],
      [["free", "empty"]],
    ],
    bars: [
      {
        st: "accumulating",
        filled: k + 1,
        txt: k === 0 ? "accum k=0" : `accum k=0..${k}`,
      },
    ],
    explain:
      k === 0 ? (
        <>
          The mbarrier release already carries SMEM visibility to the MMA, so
          there is no extra fence. <code>tid == 0</code> issues the MMA and
          commit exactly as in Step 3; everyone waits on <code>mma_bar</code>,
          then <code>phase_tma</code> and <code>phase_mma</code> both flip.
        </>
      ) : (
        <>
          MMA k={k} with <code>accum=True</code>, wait on phase {ph}, flip both
          phases.
          {k === K_TILES - 1 && " Last chunk; the accumulator is complete."}
        </>
      ),
  };
};

const laneSegments: Segment[] = [
  ...Array.from({ length: K_TILES }, (_, k): Segment[] => [
    {
      lane: "wg",
      from: 2 * k,
      to: 2 * k + 1,
      kind: "load",
      label: `Issue k=${k}`,
      meta: "then wait",
    },
    {
      lane: "wg",
      from: 2 * k + 1,
      to: 2 * k + 2,
      kind: "mma",
      label: `MMA k=${k}`,
      meta: `wait ph${k % 2}`,
    },
    {
      lane: "tma",
      from: 2 * k,
      to: 2 * k + 1,
      kind: "load",
      label: `Load k=${k}`,
      meta: BYTES,
    },
    {
      lane: "tma",
      from: 2 * k + 1,
      to: 2 * k + 2,
      kind: "idle",
      label: "idle",
    },
    { lane: "tc", from: 2 * k, to: 2 * k + 1, kind: "idle", label: "idle" },
    {
      lane: "tc",
      from: 2 * k + 1,
      to: 2 * k + 2,
      kind: "mma",
      label: `MMA k=${k}`,
      meta: "128x128x64",
    },
  ]).flat(),
  {
    lane: "wg",
    from: 6,
    to: 7,
    kind: "read",
    label: "TMEM read",
    meta: "wait.ld",
  },
  {
    lane: "wg",
    from: 7,
    to: 8,
    kind: "epi",
    label: "to Dsmem",
    meta: "fence+sync",
  },
  {
    lane: "wg",
    from: 8,
    to: 9,
    kind: "store",
    label: "TMA store",
    meta: "wait_group",
  },
  { lane: "tma", from: 6, to: 8, kind: "idle", label: "idle" },
  {
    lane: "tma",
    from: 8,
    to: 9,
    kind: "store",
    label: "Store D",
    meta: "from Dsmem",
  },
  { lane: "tc", from: 6, to: 9, kind: "idle", label: "done" },
];

export const step4: Scenario = validate({
  id: "step4",
  title: "TMA async load",
  short: "TMA",
  book: {
    chapter: "Pipelining GEMM with TMA",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_async/index.html#step-4-tma-async-load",
  },
  intro: (
    <>
      One thread issues the TMA loads and posts <code>expect_tx</code>; the
      engine counts the bytes down. The loop is still load, wait, MMA, wait, so
      the new TMA engine lane and the Tensor Core lane never overlap. The
      epilogue gains a proxy fence, a named barrier, and a bulk-group drain for
      the TMA store.
    </>
  ),
  label: "Step 4, TMA async load, cycle by cycle",
  cycles: 9,
  lanes: [
    {
      id: "wg",
      name: "Warpgroup 0",
      sub: "tid 0 issues",
      color: "var(--ink-2)",
    },
    { id: "tma", name: "TMA engine", sub: "async proxy", color: "var(--tma)" },
    { id: "tc", name: "Tensor Core", sub: "tcgen05.mma", color: "var(--mma)" },
  ],
  segments: laneSegments,
  barriers: [
    {
      id: "tma_bar",
      color: BARRIER_COLOR.tma_bar,
      desc: "arrive.expect_tx posts 32768 bytes; the engine's complete_tx counts them down to zero",
    },
    {
      id: "mma_bar",
      color: BARRIER_COLOR.mma_bar,
      desc: "tcgen05.commit arrives when the MMA finishes; both phase values flip every chunk",
    },
    {
      id: "bulk group",
      color: BARRIER_COLOR.bulk,
      desc: "TMA store: commit_group collects it, wait_group(0) returns once it has drained",
    },
  ],
  legend: [
    { name: "TMA load / issue", color: "var(--tma)" },
    { name: "MMA", color: "var(--mma)" },
    { name: "Epilogue", color: "var(--read)" },
    { name: "TMA store", color: "var(--store)" },
  ],
  smem: {
    title: "SMEM",
    desc: "A and B tiles now written by the TMA engine, plus a 128 x 128 fp16 Dsmem staging tile for the TMA store.",
    groups: [
      { label: "Operands", slots: ["Asmem", "Bsmem"] },
      { label: "Epilogue", slots: ["Dsmem"] },
    ],
  },
  tmem: {
    title: "TMEM accumulator",
    desc: "Unchanged: one 128 x 128 fp32 slot, three chunks accumulated here.",
    bars: [{ label: "tmem[:, 0:128]", segs: ["k0", "k1", "k2"] }],
  },
  steps: [
    ...Array.from({ length: K_TILES }, (_, k) => [
      loadCycle(k),
      mmaCycle(k),
    ]).flat(),
    {
      phase: "Epilogue",
      barriers: [],
      slots: [
        [
          ["free", "idle"],
          ["free", "idle"],
        ],
        [["free", "empty"]],
      ],
      bars: [{ st: "reading", filled: 3, txt: "WG0 reading" }],
      explain: (
        <>
          TMEM to registers through the warpgroup view,{" "}
          <code>tcgen05.wait.ld()</code>, then a <code>cta_sync</code> so every
          thread's load has landed before the epilogue moves on.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [],
      slots: [
        [
          ["free", "idle"],
          ["free", "idle"],
        ],
        [["loading", "fp16 rows written"]],
      ],
      bars: [{ st: "reading", filled: 3, txt: "in registers" }],
      explain: (
        <>
          Each thread casts its row and writes it into <code>Dsmem</code>.{" "}
          <code>fence.proxy_async</code> makes those generic-proxy SMEM writes
          visible to the async proxy, and <code>warpgroup_sync(10)</code> (
          <code>bar.sync 10, 128</code>, a named barrier, not an mbarrier) makes
          sure all 128 rows are in before one thread starts the store.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [{ id: "bulk group", note: "wait_group(0) returns" }],
      slots: [
        [
          ["free", "idle"],
          ["free", "idle"],
        ],
        [["ready", "TMA store draining"]],
      ],
      bars: [{ st: "free", filled: 0, txt: "done" }],
      explain: (
        <>
          <code>tid == 0</code> issues the TMA store from <code>Dsmem</code> to
          D, <code>cp_async.bulk.commit_group()</code>, then{" "}
          <code>wait_group(0)</code>. The second <code>warpgroup_sync(10)</code>{" "}
          holds the other 127 threads until that returns, so nobody reuses{" "}
          <code>Dsmem</code> while the engine is still reading it.
        </>
      ),
    },
  ],
});
