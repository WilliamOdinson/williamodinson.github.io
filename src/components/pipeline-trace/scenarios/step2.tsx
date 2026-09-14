/**
 * Step 2: K-loop accumulation (M=N=128, K=256 shown, so K_TILES=4).
 * The same SMEM tile pair and the same TMEM accumulator are reused every
 * chunk; the reused mma_bar must be waited on with the right phase, which
 * flips after every completed MMA.
 */
import { BARRIER_COLOR, validate, type Scenario, type Step } from "../types";

const K_TILES = 4;

const copy = (k: number): Step => ({
  phase: k === 0 ? "Prologue" : "K-loop",
  barriers: [],
  slots: [
    [
      ["loading", `A k=${k}`],
      ["loading", `B k=${k}`],
    ],
  ],
  bars: [
    k === 0
      ? { st: "free", filled: 0, txt: "empty" }
      : { st: "accumulating", filled: k, txt: `holds k=0..${k - 1}` },
  ],
  explain:
    k === 0 ? (
      <>
        Same buffers as Step 1, but K=256 is now four 64-wide chunks. All
        threads copy <code>A[:, 0:64]</code> and <code>B[:, 0:64]</code> into
        the single SMEM tile pair, then <code>cta_sync</code>.
      </>
    ) : k === 1 ? (
      <>
        The SMEM tiles are overwritten with chunk k=1. Nothing guards this
        except program order: the previous MMA has already been waited for, so
        the Tensor Core cannot still be reading these buffers.
      </>
    ) : (
      <>
        Chunk k={k} replaces the operands in SMEM while the partial sum for
        k=0..{k - 1} stays in TMEM.
      </>
    ),
});

const mma = (k: number): Step => {
  const phase = k % 2;
  return {
    phase: "K-loop",
    barriers: [
      {
        id: "mma_bar",
        tag: `ph${phase}`,
        note: `try_wait(${phase}) returns, phase_mma ^= 1`,
      },
    ],
    slots: [
      [
        ["reading", `k=${k}, MMA`],
        ["reading", `k=${k}, MMA`],
      ],
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
          The elected thread issues the first MMA with <code>accum=False</code>,
          so the accumulator starts from this product, and commits it to{" "}
          <code>mma_bar</code>. Everyone waits with <code>phase_mma=0</code>.
          When the MMA lands the barrier completes phase 0; the kernel then
          flips <code>phase_mma</code> to 1.
        </>
      ) : k === 1 ? (
        <>
          <code>accum=True</code> adds this chunk's product to the running sum
          in TMEM. The wait passes <code>phase_mma=1</code>: the barrier has
          been in phase 1 since the first completion, and this wait returns only
          when it leaves phase 1. Without the flip it would have returned at
          once on the stale phase-0 completion and the epilogue could read a
          half-updated accumulator.
        </>
      ) : (
        <>
          Same again with <code>phase_mma={phase}</code>: the local value
          alternates 0, 1, 0, 1 in step with the barrier's own phase.
          {k === K_TILES - 1 && " Last chunk; the accumulator is complete."}
        </>
      ),
  };
};

export const step2: Scenario = validate({
  id: "step2",
  title: "K-loop accumulation",
  short: "K-loop",
  book: {
    chapter: "Building a Tiled GEMM",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_basics/index.html#step-2-k-loop-accumulation",
  },
  intro: (
    <>
      Same buffers, K in four chunks, one TMEM accumulator with{" "}
      <code>accum=True</code> after the first. Watch the barrier chip:{" "}
      <code>mma_bar</code> is reused every chunk, its phase flips at each
      completion, and <code>phase_mma ^= 1</code> keeps the wait in step with
      it.
    </>
  ),
  label: "Step 2, K-loop accumulation, cycle by cycle",
  cycles: 9,
  lanes: [
    {
      id: "wg",
      name: "Warpgroup 0",
      sub: "128 threads",
      color: "var(--ink-2)",
    },
    {
      id: "tc",
      name: "Tensor Core",
      sub: "tcgen05.mma, async",
      color: "var(--mma)",
    },
  ],
  segments: [
    ...Array.from({ length: K_TILES }, (_, k) => [
      {
        lane: "wg",
        from: 2 * k,
        to: 2 * k + 1,
        kind: "load" as const,
        label: `Copy k=${k}`,
        meta: "A, B, sync",
      },
      {
        lane: "wg",
        from: 2 * k + 1,
        to: 2 * k + 2,
        kind: "mma" as const,
        label: `MMA k=${k}`,
        meta: k === 0 ? "acc=false" : `wait ph${k % 2}`,
      },
      {
        lane: "tc",
        from: 2 * k,
        to: 2 * k + 1,
        kind: "idle" as const,
        label: "idle",
      },
      {
        lane: "tc",
        from: 2 * k + 1,
        to: 2 * k + 2,
        kind: "mma" as const,
        label: `MMA k=${k}`,
        meta: "128x128x64",
      },
    ]).flat(),
    {
      lane: "wg",
      from: 8,
      to: 9,
      kind: "read",
      label: "Epilogue",
      meta: "read, store",
    },
    { lane: "tc", from: 8, to: 9, kind: "idle", label: "done" },
  ],
  barriers: [
    {
      id: "mma_bar",
      color: BARRIER_COLOR.mma_bar,
      desc: "One barrier, reused every chunk. Its phase flips at each completion, so phase_mma must flip too",
    },
  ],
  legend: [
    { name: "Thread copy", color: "var(--tma)" },
    { name: "MMA", color: "var(--mma)" },
    { name: "Writeback", color: "var(--read)" },
  ],
  smem: {
    title: "SMEM",
    desc: "Still a single A and B tile pair. Each chunk overwrites it after the previous MMA has been waited for.",
    groups: [{ slots: ["Asmem", "Bsmem"] }],
  },
  tmem: {
    title: "TMEM accumulator",
    desc: "One 128 x 128 fp32 slot receives all four partial products; accum=True after the first chunk.",
    bars: [{ label: "tmem[:, 0:128]", segs: ["k0", "k1", "k2", "k3"] }],
  },
  steps: [
    ...Array.from({ length: K_TILES }, (_, k) => [copy(k), mma(k)]).flat(),
    {
      phase: "Writeback",
      barriers: [],
      slots: [
        [
          ["free", "idle"],
          ["free", "idle"],
        ],
      ],
      bars: [{ st: "reading", filled: 4, txt: "WG0 reading" }],
      explain: (
        <>
          Epilogue unchanged from Step 1: TMEM to registers, cast, one row per
          thread to GMEM. Load and compute still strictly alternate; the Tensor
          Core idles during every copy and the threads idle during every MMA.
        </>
      ),
    },
  ],
});
