/**
 * Step 7: warp specialization in one CTA.
 * PIPE_DEPTH=2, K_TILES=4, BLK_M=BLK_N=128. One TMA producer warp, one MMA
 * consumer warp, one writeback warpgroup, four barriers.
 */
import { BARRIER_COLOR, validate, type Scenario } from "../types";

const free = [
  ["free", "free"],
  ["free", "free"],
] as const;

export const step7: Scenario = validate({
  id: "step7",
  title: "Warp specialization",
  short: "Roles",
  book: {
    chapter: "Scaling GEMM with Warp Specialization and Clusters",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_advanced/index.html#step-7-warp-specialization",
  },
  intro: (
    <>
      A TMA producer warp, an MMA consumer warp and a writeback warpgroup,
      connected by four barriers. With <code>PIPE_DEPTH=2</code> the producer
      runs one stage ahead; the hatched blocks are where a role is parked on a
      barrier.
    </>
  ),
  label: "Step 7, warp specialization, cycle by cycle",
  cycles: 9,
  lanes: [
    {
      id: "tma",
      name: "TMA producer",
      sub: "WG1 warp\u00a03",
      color: "var(--tma)",
    },
    {
      id: "mma",
      name: "MMA consumer",
      sub: "WG1 warp\u00a00",
      color: "var(--mma)",
    },
    {
      id: "wb",
      name: "Writeback",
      sub: "WG0, 128 threads",
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
    {
      lane: "tma",
      from: 2,
      to: 3,
      kind: "wait",
      label: "wait",
      meta: "mma2tma",
      color: BARRIER_COLOR.mma2tma,
    },
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
    {
      lane: "tma",
      from: 5,
      to: 9,
      kind: "idle",
      label: "done",
      meta: "next tile",
    },

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
      meta: "stage 0, acc=false",
    },
    {
      lane: "mma",
      from: 3,
      to: 4,
      kind: "mma",
      label: "MMA k=1",
      meta: "stage 1",
    },
    {
      lane: "mma",
      from: 4,
      to: 5,
      kind: "mma",
      label: "MMA k=2",
      meta: "stage 0",
    },
    {
      lane: "mma",
      from: 5,
      to: 6,
      kind: "mma",
      label: "MMA k=3",
      meta: "stage 1",
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

    {
      lane: "wb",
      from: 0,
      to: 7,
      kind: "wait",
      label: "wait",
      meta: "mma2ld",
      color: BARRIER_COLOR.mma2ld,
    },
    {
      lane: "wb",
      from: 7,
      to: 8,
      kind: "read",
      label: "TMEM read",
      meta: "fence, warpgroup copy",
    },
    {
      lane: "wb",
      from: 8,
      to: 9,
      kind: "store",
      label: "TMA store",
      meta: "fp16 via Dsmem",
    },
  ],
  barriers: [
    {
      id: "tma2mma",
      color: BARRIER_COLOR.tma2mma,
      desc: "TMA load landed, SMEM stage ready for MMA",
    },
    {
      id: "mma2tma",
      color: BARRIER_COLOR.mma2tma,
      desc: "MMA finished reading, stage reusable by TMA",
    },
    {
      id: "mma2ld",
      color: BARRIER_COLOR.mma2ld,
      desc: "K-loop done, TMEM result ready for writeback",
    },
    {
      id: "ld2mma",
      color: BARRIER_COLOR.ld2mma,
      desc: "Writeback finished reading, TMEM free for the next tile",
    },
  ],
  legend: [
    { name: "TMA load", color: "var(--tma)" },
    { name: "MMA compute", color: "var(--mma)" },
    { name: "TMEM read", color: "var(--read)" },
    { name: "TMA store", color: "var(--store)" },
    { name: "Blocked on a barrier", color: "var(--ink-2)", wait: true },
  ],
  smem: {
    title: "SMEM ring buffer",
    desc: "Two stages of A and B tiles. TMA fills one stage while MMA reads the other.",
    groups: [{ slots: ["Stage 0", "Stage 1"] }],
  },
  tmem: {
    title: "TMEM accumulator",
    desc: "128 x 128 fp32. MMA accumulates one K-tile per cycle; writeback reads it once.",
    bars: [{ label: "tmem[:, 0:128]", segs: ["k0", "k1", "k2", "k3"] }],
  },
  steps: [
    {
      phase: "Prologue",
      barriers: [],
      slots: [
        [
          ["loading", "loading k=0"],
          ["free", "empty"],
        ],
      ],
      bars: [{ st: "free", filled: 0, txt: "empty" }],
      explain: (
        <>
          TMA producer loads A and B for K-tile 0 into SMEM stage 0. MMA
          consumer is blocked on <code>tma2mma[0]</code>. First tile, so{" "}
          <code>ld2mma</code> passes immediately (the consumer starts with{" "}
          <code>phase=1</code>).
        </>
      ),
    },
    {
      phase: "Prologue",
      barriers: [{ id: "tma2mma", tag: "[0]" }],
      slots: [
        [
          ["ready", "k=0 ready"],
          ["loading", "loading k=1"],
        ],
      ],
      bars: [{ st: "free", filled: 0, txt: "empty" }],
      explain: (
        <>
          TMA finishes stage 0 and signals <code>tma2mma[0]</code>, then
          immediately starts loading k=1 into stage 1. MMA can now unblock.
        </>
      ),
    },
    {
      phase: "First MMA",
      barriers: [
        { id: "tma2mma", tag: "[1]" },
        { id: "mma2tma", tag: "[0]" },
      ],
      slots: [
        [
          ["reading", "k=0, MMA reading"],
          ["ready", "k=1 ready"],
        ],
      ],
      bars: [{ st: "accumulating", filled: 1, txt: "accum k=0" }],
      explain: (
        <>
          MMA reads A and B from stage 0 and issues <code>gemm_async</code> with{" "}
          <code>accum=false</code>. It signals <code>mma2tma[0]</code> to
          release stage 0; TMA is parked on that barrier before it can reload
          stage 0.
        </>
      ),
    },
    {
      phase: "Steady state",
      barriers: [
        { id: "tma2mma", tag: "[0]" },
        { id: "mma2tma", tag: "[1]" },
      ],
      slots: [
        [
          ["loading", "loading k=2"],
          ["reading", "k=1, MMA reading"],
        ],
      ],
      bars: [{ st: "accumulating", filled: 2, txt: "accum k=0,1" }],
      explain: (
        <>
          Key overlap: TMA loads k=2 into stage 0 while MMA computes k=1 from
          stage 1. Different SMEM stages, fully concurrent. MMA signals{" "}
          <code>mma2tma[1]</code>.
        </>
      ),
    },
    {
      phase: "Steady state",
      barriers: [
        { id: "tma2mma", tag: "[1]" },
        { id: "mma2tma", tag: "[0]" },
      ],
      slots: [
        [
          ["reading", "k=2, MMA reading"],
          ["loading", "loading k=3"],
        ],
      ],
      bars: [{ st: "accumulating", filled: 3, txt: "accum k=0..2" }],
      explain: (
        <>
          Same pattern with the stages swapped: TMA loads k=3 into stage 1, MMA
          computes k=2 from stage 0. The pipeline is fully warmed up.
        </>
      ),
    },
    {
      phase: "Drain",
      barriers: [{ id: "mma2tma", tag: "[1]" }],
      slots: [
        [
          ["free", "free"],
          ["reading", "k=3, MMA reading"],
        ],
      ],
      bars: [{ st: "accumulating", filled: 4, txt: "accum k=0..3" }],
      explain: (
        <>
          TMA producer is done (all 4 K-tiles issued). MMA computes the last
          tile k=3. Writeback is still blocked on <code>mma2ld</code>.
        </>
      ),
    },
    {
      phase: "K-loop done",
      barriers: [{ id: "mma2ld" }],
      slots: [free],
      bars: [{ st: "ready", filled: 4, txt: "result ready" }],
      explain: (
        <>
          K-loop complete. MMA arrives on <code>mma2ld</code>: the TMEM
          accumulator holds the final 128 x 128 fp32 result. Writeback unblocks.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [],
      slots: [free],
      bars: [{ st: "reading", filled: 4, txt: "WG0 reading" }],
      explain: (
        <>
          Writeback runs <code>fence.after_thread_sync()</code>, then copies
          TMEM into registers with a warpgroup copy. All 128 WG0 threads
          participate.
        </>
      ),
    },
    {
      phase: "Epilogue",
      barriers: [{ id: "ld2mma", note: "128 arrivals" }],
      slots: [free],
      bars: [{ st: "free", filled: 0, txt: "free, ld2mma sent" }],
      explain: (
        <>
          Cast fp32 to fp16 in registers, write to Dsmem, fence,{" "}
          <code>warpgroup_sync(10)</code>, then the elected thread issues the
          TMA store to GMEM. All 128 WG0 threads arrive on <code>ld2mma</code>,
          freeing TMEM for the next tile.
        </>
      ),
    },
  ],
});
