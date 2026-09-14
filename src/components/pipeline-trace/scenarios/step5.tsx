/**
 * Step 5: software pipeline with PIPE_DEPTH=2 (K_TILES=4 shown).
 * Two SMEM stages, one tma_bar per stage, one mma_bar. The loop waits for the
 * current stage, runs the MMA, waits for it, then refills the freed stage
 * with tile k+2. phase_mma flips every chunk; phase_tma flips only when the
 * ring wraps (after stage 1).
 */
import { BARRIER_COLOR, validate, type Scenario, type Step } from "../types";

const free = ["free", "free"] as const;
const accum = (n: number, txt: string) => ({
  st: "accumulating" as const,
  filled: n,
  txt,
});

const epilogue: Step[] = [
  {
    phase: "Epilogue",
    barriers: [],
    slots: [[free, free], [["free", "empty"]]],
    bars: [{ st: "reading", filled: 4, txt: "WG0 reading" }],
    explain: (
      <>
        Epilogue as in Step 4: TMEM to registers, <code>wait.ld</code>,{" "}
        <code>cta_sync</code>.
      </>
    ),
  },
  {
    phase: "Epilogue",
    barriers: [],
    slots: [[free, free], [["loading", "fp16 rows written"]]],
    bars: [{ st: "reading", filled: 4, txt: "in registers" }],
    explain: (
      <>
        Cast, write rows into <code>Dsmem</code>, <code>fence.proxy_async</code>
        , <code>warpgroup_sync(10)</code>.
      </>
    ),
  },
  {
    phase: "Epilogue",
    barriers: [{ id: "bulk group", note: "wait_group(0) returns" }],
    slots: [[free, free], [["ready", "TMA store draining"]]],
    bars: [{ st: "free", filled: 0, txt: "done" }],
    explain: (
      <>
        TMA store, <code>commit_group</code>, <code>wait_group(0)</code>, second{" "}
        <code>warpgroup_sync(10)</code>. Note what is still serial: the threads
        issue the next load only after waiting for the previous MMA, so the two
        engines overlap by at most one tile. The full schedule needs the
        separate roles of Step 7.
      </>
    ),
  },
];

export const step5: Scenario = validate({
  id: "step5",
  title: "Software pipeline, PIPE_DEPTH=2",
  short: "Ring",
  book: {
    chapter: "Pipelining GEMM with TMA",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_async/index.html#step-5-software-pipeline-pipe-depth-2",
  },
  intro: (
    <>
      Two SMEM stages. Stop at cycle 3: the load of k=2 is in flight while the
      Tensor Core runs k=1. Two phase counters advance at different rates,{" "}
      <code>phase_mma</code> every chunk and <code>phase_tma</code> every lap of
      the ring.
    </>
  ),
  label: "Step 5, double-buffered pipeline, cycle by cycle",
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
  segments: [
    {
      lane: "wg",
      from: 0,
      to: 1,
      kind: "load",
      label: "Prefetch",
      meta: "s0, s1",
    },
    {
      lane: "wg",
      from: 1,
      to: 2,
      kind: "wait",
      label: "wait",
      meta: "tma_bar[0]",
      color: BARRIER_COLOR.tma_bar,
    },
    {
      lane: "wg",
      from: 2,
      to: 3,
      kind: "mma",
      label: "MMA k=0",
      meta: "stage 0",
    },
    {
      lane: "wg",
      from: 3,
      to: 4,
      kind: "mma",
      label: "MMA k=1",
      meta: "+load k=2",
    },
    {
      lane: "wg",
      from: 4,
      to: 5,
      kind: "mma",
      label: "MMA k=2",
      meta: "+load k=3",
    },
    {
      lane: "wg",
      from: 5,
      to: 6,
      kind: "mma",
      label: "MMA k=3",
      meta: "no refill",
    },
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

    {
      lane: "tma",
      from: 0,
      to: 1,
      kind: "load",
      label: "Load k=0",
      meta: "stage 0",
    },
    {
      lane: "tma",
      from: 1,
      to: 2,
      kind: "load",
      label: "Load k=1",
      meta: "stage 1",
    },
    { lane: "tma", from: 2, to: 3, kind: "idle", label: "idle" },
    {
      lane: "tma",
      from: 3,
      to: 4,
      kind: "load",
      label: "Load k=2",
      meta: "stage 0",
    },
    {
      lane: "tma",
      from: 4,
      to: 5,
      kind: "load",
      label: "Load k=3",
      meta: "stage 1",
    },
    { lane: "tma", from: 5, to: 8, kind: "idle", label: "idle" },
    {
      lane: "tma",
      from: 8,
      to: 9,
      kind: "store",
      label: "Store D",
      meta: "from Dsmem",
    },

    { lane: "tc", from: 0, to: 2, kind: "idle", label: "idle" },
    {
      lane: "tc",
      from: 2,
      to: 3,
      kind: "mma",
      label: "MMA k=0",
      meta: "stage 0",
    },
    {
      lane: "tc",
      from: 3,
      to: 4,
      kind: "mma",
      label: "MMA k=1",
      meta: "stage 1",
    },
    {
      lane: "tc",
      from: 4,
      to: 5,
      kind: "mma",
      label: "MMA k=2",
      meta: "stage 0",
    },
    {
      lane: "tc",
      from: 5,
      to: 6,
      kind: "mma",
      label: "MMA k=3",
      meta: "stage 1",
    },
    { lane: "tc", from: 6, to: 9, kind: "idle", label: "done" },
  ],
  barriers: [
    {
      id: "tma_bar",
      color: BARRIER_COLOR.tma_bar,
      desc: "One per stage. A stage's barrier starts a new round only when the ring returns to it, so phase_tma flips after stage 1",
    },
    {
      id: "mma_bar",
      color: BARRIER_COLOR.mma_bar,
      desc: "One barrier for the single accumulator; phase_mma flips every chunk",
    },
    {
      id: "bulk group",
      color: BARRIER_COLOR.bulk,
      desc: "TMA store: commit_group then wait_group(0)",
    },
  ],
  legend: [
    { name: "TMA load / issue", color: "var(--tma)" },
    { name: "MMA", color: "var(--mma)" },
    { name: "Epilogue", color: "var(--read)" },
    { name: "TMA store", color: "var(--store)" },
    { name: "Blocked on a barrier", color: "var(--ink-2)", wait: true },
  ],
  smem: {
    title: "SMEM ring",
    desc: "Asmem and Bsmem gain a leading PIPE_DEPTH axis: two stages, each its own A and B tile pair, plus Dsmem for the store.",
    groups: [
      { label: "Ring", slots: ["Stage 0", "Stage 1"] },
      { label: "Epilogue", slots: ["Dsmem"] },
    ],
  },
  tmem: {
    title: "TMEM accumulator",
    desc: "Still one 128 x 128 fp32 slot; only the operand side got a second buffer.",
    bars: [{ label: "tmem[:, 0:128]", segs: ["k0", "k1", "k2", "k3"] }],
  },
  steps: [
    {
      phase: "Prologue",
      barriers: [],
      slots: [
        [
          ["loading", "k=0, TMA"],
          ["free", "empty"],
        ],
        [["free", "empty"]],
      ],
      bars: [{ st: "free", filled: 0, txt: "empty" }],
      explain: (
        <>
          Before the loop, <code>tid == 0</code> issues the loads for k=0 into
          stage 0 and k=1 into stage 1, each with its own <code>expect_tx</code>{" "}
          on <code>tma_bar[stage]</code>. Two tiles are in flight before any MMA
          exists.
        </>
      ),
    },
    {
      phase: "Prologue",
      barriers: [{ id: "tma_bar", tag: "[0] ph0", note: "k=0 landed" }],
      slots: [
        [
          ["ready", "k=0 ready"],
          ["loading", "k=1, TMA"],
        ],
        [["free", "empty"]],
      ],
      bars: [{ st: "free", filled: 0, txt: "empty" }],
      explain: (
        <>
          Iteration k=0, <code>stage = 0</code>: wait on <code>tma_bar[0]</code>{" "}
          with <code>phase_tma=0</code> while k=1 is still landing in stage 1.
        </>
      ),
    },
    {
      phase: "K-loop",
      barriers: [
        { id: "tma_bar", tag: "[1] ph0", note: "k=1 landed" },
        { id: "mma_bar", tag: "ph0", note: "phase_mma ^= 1" },
      ],
      slots: [
        [
          ["reading", "k=0, MMA"],
          ["ready", "k=1 ready"],
        ],
        [["free", "empty"]],
      ],
      bars: [accum(1, "accum k=0")],
      explain: (
        <>
          MMA on stage 0, wait on <code>mma_bar</code>, flip{" "}
          <code>phase_mma</code>. Stage 0 is now free; the loop immediately
          refills it with tile <code>k + PIPE_DEPTH</code>.
        </>
      ),
    },
    {
      phase: "K-loop",
      barriers: [
        {
          id: "mma_bar",
          tag: "ph1",
          note: "then load k=3; stage 1 done, phase_tma = 1",
        },
      ],
      slots: [
        [
          ["loading", "k=2, TMA"],
          ["reading", "k=1, MMA"],
        ],
        [["free", "empty"]],
      ],
      bars: [accum(2, "accum k=0,1")],
      explain: (
        <>
          The payoff of the second stage. The threads issue the load of k=2 into
          freed stage 0, and the wait on <code>tma_bar[1]</code> passes at once
          because k=1 was prefetched. So while the Tensor Core runs k=1, the TMA
          engine is already moving k=2. The threads themselves still go issue,
          wait, issue, wait; the two engines overlap because both operations are
          asynchronous.
        </>
      ),
    },
    {
      phase: "K-loop",
      barriers: [
        { id: "tma_bar", tag: "[0] ph1", note: "k=2 landed, second round" },
        { id: "mma_bar", tag: "ph0" },
      ],
      slots: [
        [
          ["reading", "k=2, MMA"],
          ["loading", "k=3, TMA"],
        ],
        [["free", "empty"]],
      ],
      bars: [accum(3, "accum k=0..2")],
      explain: (
        <>
          Load k=3 into stage 1, MMA k=2 from stage 0. The previous iteration
          ended the ring's first lap (<code>stage == PIPE_DEPTH - 1</code>), so{" "}
          <code>phase_tma</code> is now 1: this wait on stage 0 has to see the
          barrier leave phase 1, not the phase-0 completion left over from k=0.
        </>
      ),
    },
    {
      phase: "Drain",
      barriers: [
        { id: "tma_bar", tag: "[1] ph1", note: "k=3 landed" },
        {
          id: "mma_bar",
          tag: "ph1",
          note: "stage 1 again: phase_tma back to 0",
        },
      ],
      slots: [
        [
          ["free", "free"],
          ["reading", "k=3, MMA"],
        ],
        [["free", "empty"]],
      ],
      bars: [accum(4, "accum k=0..3")],
      explain: (
        <>
          k=3 from stage 1. <code>k + PIPE_DEPTH</code> is past the end, so
          nothing is prefetched. Stage 1 closes the second lap and{" "}
          <code>phase_tma</code> returns to 0, which is what lets Step 6 reuse
          the same barriers for the next tile.
        </>
      ),
    },
    ...epilogue,
  ],
});
