/**
 * Step 1: sequential single-tile GEMM (M=N=128, K=64).
 * One warpgroup does everything in order: thread copies into SMEM, one
 * elected thread issues the MMA, everyone waits on mma_bar, then each thread
 * stores its own output row. No loop, no TMA, no overlap.
 */
import { BARRIER_COLOR, validate, type Scenario } from "../types";

export const step1: Scenario = validate({
  id: "step1",
  title: "Sequential single-tile GEMM",
  short: "Single tile",
  book: {
    chapter: "Building a Tiled GEMM",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_basics/index.html#step-1-sequential-single-tile-gemm",
  },
  intro: (
    <>
      One CTA, one 128 x 128 tile, K=64. The whole GMEM to SMEM to TMEM to
      registers to GMEM path runs once, in order. Watch the Tensor Core lane:
      the MMA is asynchronous, and the <code>mma_bar</code> wait at cycle 4 is
      all that separates it from the threads reading TMEM.
    </>
  ),
  label: "Step 1, single-tile GEMM, cycle by cycle",
  cycles: 8,
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
    {
      lane: "wg",
      from: 0,
      to: 1,
      kind: "setup",
      label: "Allocate",
      meta: "SMEM+TMEM",
    },
    {
      lane: "wg",
      from: 1,
      to: 2,
      kind: "load",
      label: "Copy A",
      meta: "all threads",
    },
    {
      lane: "wg",
      from: 2,
      to: 3,
      kind: "load",
      label: "Copy B",
      meta: "cta_sync",
    },
    {
      lane: "wg",
      from: 3,
      to: 4,
      kind: "mma",
      label: "Issue MMA",
      meta: "1 thread",
    },
    {
      lane: "wg",
      from: 4,
      to: 5,
      kind: "wait",
      label: "wait",
      meta: "mma_bar ph0",
      color: BARRIER_COLOR.mma_bar,
    },
    {
      lane: "wg",
      from: 5,
      to: 6,
      kind: "read",
      label: "TMEM read",
      meta: "wait.ld",
    },
    {
      lane: "wg",
      from: 6,
      to: 7,
      kind: "store",
      label: "Store rows",
      meta: "row/thread",
    },
    {
      lane: "wg",
      from: 7,
      to: 8,
      kind: "setup",
      label: "Release",
      meta: "dealloc",
    },

    {
      lane: "tc",
      from: 0,
      to: 3,
      kind: "idle",
      label: "idle",
      meta: "no operands",
    },
    {
      lane: "tc",
      from: 3,
      to: 5,
      kind: "mma",
      label: "MMA",
      meta: "acc=false",
    },
    { lane: "tc", from: 5, to: 8, kind: "idle", label: "done" },
  ],
  barriers: [
    {
      id: "mma_bar",
      color: BARRIER_COLOR.mma_bar,
      desc: "tcgen05.commit arrives once the MMA has finished writing TMEM; the warpgroup try_waits on phase 0",
    },
  ],
  legend: [
    { name: "Thread copy", color: "var(--tma)" },
    { name: "MMA", color: "var(--mma)" },
    { name: "TMEM read", color: "var(--read)" },
    { name: "Store", color: "var(--store)" },
    { name: "Setup", color: "var(--ink-2)" },
    { name: "Blocked on a barrier", color: "var(--ink-2)", wait: true },
  ],
  smem: {
    title: "SMEM",
    desc: "One 128 x 64 fp16 tile each for A and B, 128-byte swizzled, placed from byte offset 1024; the TMEM address and mbarrier sit below.",
    groups: [{ slots: ["Asmem", "Bsmem"] }],
  },
  tmem: {
    title: "TMEM accumulator",
    desc: "128 x 128 fp32 inside the 512 columns reserved by tcgen05.alloc. One MMA, so one segment.",
    bars: [{ label: "tmem[:, 0:128]", segs: ["k0"] }],
  },
  steps: [
    {
      phase: "Setup",
      barriers: [],
      slots: [
        [
          ["free", "allocated"],
          ["free", "allocated"],
        ],
      ],
      bars: [{ st: "free", filled: 0, txt: "allocated" }],
      explain: (
        <>
          One CTA, one warpgroup. The SMEM pool hands out a 4-byte slot for the
          TMEM address and an 8-byte mbarrier, then jumps to offset 1024 for the
          A and B tiles. Warp 0 initialises <code>mma_bar</code> with an arrival
          count of 1 and allocates 512 TMEM columns; the fences and a{" "}
          <code>cta_sync</code> publish both to the whole CTA.
        </>
      ),
    },
    {
      phase: "Load",
      barriers: [],
      slots: [
        [
          ["loading", "A, cta.copy"],
          ["free", "empty"],
        ],
      ],
      bars: [{ st: "free", filled: 0, txt: "empty" }],
      explain: (
        <>
          All 128 threads copy the A tile from GMEM into SMEM with{" "}
          <code>Tx.cta.copy</code>. Every thread computes its own addresses and
          issues its own loads and stores; there is no TMA yet.
        </>
      ),
    },
    {
      phase: "Load",
      barriers: [],
      slots: [
        [
          ["ready", "A ready"],
          ["loading", "B, cta.copy"],
        ],
      ],
      bars: [{ st: "free", filled: 0, txt: "empty" }],
      explain: (
        <>
          Same for B. The <code>cta_sync</code> afterwards is what makes every
          thread's SMEM writes visible before anything reads them; the MMA has
          no other way to know the tiles are complete.
        </>
      ),
    },
    {
      phase: "Compute",
      barriers: [],
      slots: [
        [
          ["reading", "MMA reading"],
          ["reading", "MMA reading"],
        ],
      ],
      bars: [{ st: "accumulating", filled: 0, txt: "MMA in flight" }],
      explain: (
        <>
          <code>warp_id == 0</code> plus <code>elect_sync()</code> picks exactly
          one thread to issue <code>Tx.gemm_async</code> (lowered to a short run
          of <code>tcgen05.mma</code> over the 64-wide K tile) and{" "}
          <code>tcgen05.commit</code>, which ties completion to{" "}
          <code>mma_bar</code>. One issuing thread, one tile-level MMA: if all
          128 threads issued it, the hardware would run it 128 times.
        </>
      ),
    },
    {
      phase: "Compute",
      barriers: [
        { id: "mma_bar", tag: "ph0", note: "try_wait(phase=0) returns" },
      ],
      slots: [
        [
          ["reading", "MMA reading"],
          ["reading", "MMA reading"],
        ],
      ],
      bars: [{ st: "ready", filled: 1, txt: "result ready" }],
      explain: (
        <>
          The warpgroup spins in <code>mbarrier.try_wait(mma_bar, 0)</code>. The
          MMA is asynchronous, so this wait is the only thing standing between
          the Tensor Core still writing TMEM and the threads reading it.
        </>
      ),
    },
    {
      phase: "Writeback",
      barriers: [],
      slots: [
        [
          ["free", "idle"],
          ["free", "idle"],
        ],
      ],
      bars: [{ st: "reading", filled: 1, txt: "WG0 reading" }],
      explain: (
        <>
          <code>Dreg_wg</code> is a warpgroup-wide view of each thread's private{" "}
          <code>Dreg</code>: thread i owns row i. <code>Tx.wg.copy_async</code>{" "}
          lowers to <code>tcgen05.ld</code> and is asynchronous, so{" "}
          <code>tcgen05.wait.ld()</code> must complete before anyone touches the
          registers.
        </>
      ),
    },
    {
      phase: "Writeback",
      barriers: [],
      slots: [
        [
          ["free", "idle"],
          ["free", "idle"],
        ],
      ],
      bars: [{ st: "reading", filled: 1, txt: "in registers" }],
      explain: (
        <>
          Cast fp32 to fp16 in registers and store: thread{" "}
          <code>warp_id * 32 + lane_id</code> writes its own row of D straight
          to GMEM. Warp 0 covers rows 0 to 31, warp 3 rows 96 to 127.
        </>
      ),
    },
    {
      phase: "Release",
      barriers: [],
      slots: [
        [
          ["free", "idle"],
          ["free", "idle"],
        ],
      ],
      bars: [{ st: "free", filled: 0, txt: "deallocated" }],
      explain: (
        <>
          <code>cta_sync</code>, then warp 0 returns the allocation permit and
          deallocates TMEM. The kernel is correct, and also single-tile,
          single-K, synchronous, and strictly sequential; each later step
          removes one of those limits.
        </>
      ),
    },
  ],
});
