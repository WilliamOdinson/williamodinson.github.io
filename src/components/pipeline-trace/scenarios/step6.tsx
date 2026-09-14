/**
 * Step 6: persistent kernel + tile scheduler (M=N=K=4096, so 64 K-tiles per
 * output tile). One of 148 persistent CTAs is shown processing two tiles; the
 * 64-iteration K-loop is compressed into two cycles per tile. Setup happens
 * once, and the phase counters restart at 0 for every tile because each
 * barrier ran an even number of rounds.
 */
import { BARRIER_COLOR, validate, type Scenario, type Step } from "../types";

const free = ["free", "free"] as const;
const SEGS = ["k0..15", "k16..31", "k32..47", "k48..63"];

const tile = (t: number, name: string): Step[] => [
  {
    phase: `Tile ${name}`,
    barriers: [],
    slots: [
      [
        ["loading", "k=0, TMA"],
        ["loading", "k=1, TMA"],
      ],
      [["free", "empty"]],
    ],
    bars: [{ st: "free", filled: 0, txt: "empty" }],
    explain:
      t === 0 ? (
        <>
          <code>tile_scheduler.valid()</code> is true, so the CTA reads{" "}
          <code>m_idx</code> and <code>n_idx</code> from the scheduler;{" "}
          <code>m_st</code> and <code>n_st</code> now come from there instead of
          from <code>cta_id</code>. Inside the tile the Step 5 pipeline runs
          unchanged, starting with the two-stage prefetch.
        </>
      ) : (
        <>
          Second tile on the same CTA, no relaunch and no re-initialisation.{" "}
          <code>phase_tma</code> and <code>phase_mma</code> are simply set back
          to 0. That is only legal because every barrier completed an even
          number of rounds during the previous tile: <code>mma_bar</code> 64
          times, each <code>tma_bar</code> 32 times, so all of them are back at
          their initial parity. The wrapper's assert on{" "}
          <code>K_TILES % (2 * PIPE_DEPTH)</code> guards exactly this.
        </>
      ),
  },
  {
    phase: `Tile ${name}`,
    barriers: [
      { id: "tma_bar", tag: "[0] [1]", note: "rounds 1..16 per stage" },
      { id: "mma_bar", note: "rounds 1..32" },
    ],
    slots: [
      [
        ["reading", "ring streaming"],
        ["reading", "ring streaming"],
      ],
      [["free", "empty"]],
    ],
    bars: [{ st: "accumulating", filled: 2, txt: "accum k=0..31" }],
    explain:
      t === 0 ? (
        <>
          64 K-tiles through the double-buffered loop: wait for the stage, MMA,
          wait, refill the freed stage with <code>k + 2</code>. With K=4096 this
          is the bulk of the tile's time; the trace compresses it into two
          cycles.
        </>
      ) : (
        <>
          Same loop for the second tile. The A and B slices are different, but
          every barrier, SMEM stage and TMEM slot is the one allocated at setup.
        </>
      ),
  },
  {
    phase: `Tile ${name}`,
    barriers: [
      {
        id: "tma_bar",
        tag: "[0] [1]",
        note: "rounds 17..32, parity back to 0",
      },
      { id: "mma_bar", note: "rounds 33..64, parity back to 0" },
    ],
    slots: [
      [
        ["reading", "ring streaming"],
        ["reading", "ring streaming"],
      ],
      [["free", "empty"]],
    ],
    bars: [{ st: "accumulating", filled: 4, txt: "accum k=0..63" }],
    explain: (
      <>
        Second half of the K-loop. Each stage's <code>tma_bar</code> completes
        its 32nd round and <code>mma_bar</code> its 64th, both even, which is
        what the next tile's phase reset relies on.
      </>
    ),
  },
  {
    phase: `Tile ${name}`,
    barriers: [{ id: "bulk group", note: "wait_group(0) returns" }],
    slots: [[free, free], [["ready", "TMA store draining"]]],
    bars: [{ st: "reading", filled: 4, txt: "drained to Dsmem" }],
    explain:
      t === 0 ? (
        <>
          Writeback as in Step 5, then <code>cta_sync</code> and{" "}
          <code>tile_scheduler.next_tile()</code>. The scheduler hands out tiles
          in an L2-friendly order: with <code>l2_group_size=8</code>,
          consecutive tile ids run down eight rows of the same N column, so
          nearby tiles share a B tile and cycle through the same eight A tiles.
        </>
      ) : (
        <>
          Writeback, <code>next_tile()</code>. When <code>valid()</code> finally
          returns false the CTA syncs and deallocates TMEM. Two things are still
          serial: one warpgroup issues everything, and each tile's writeback
          stalls the next tile's loads. Step 7 fixes both with separate warp
          roles.
        </>
      ),
  },
];

export const step6: Scenario = validate({
  id: "step6",
  title: "Persistent kernel and tile scheduler",
  short: "Persistent",
  book: {
    chapter: "Pipelining GEMM with TMA",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_async/index.html#step-6-persistent-kernel-tile-scheduler",
  },
  intro: (
    <>
      148 persistent CTAs, set up once, tiles pulled from the scheduler. The
      trace follows one CTA through two tiles and the reason its phase counters
      may restart at 0. The map underneath is the order in which the scheduler
      numbers tiles.
    </>
  ),
  label: "Step 6, persistent kernel with a tile scheduler, cycle by cycle",
  cycles: 9,
  lanes: [
    {
      id: "wg",
      name: "Warpgroup 0",
      sub: "persistent CTA, 1 of 148",
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
      kind: "setup",
      label: "Setup once",
      meta: "TMEM, bars",
    },
    {
      lane: "wg",
      from: 1,
      to: 2,
      kind: "load",
      label: "Prefetch",
      meta: "tile A",
    },
    {
      lane: "wg",
      from: 2,
      to: 4,
      kind: "mma",
      label: "K-loop, 64 MMAs",
      meta: "tile A",
    },
    {
      lane: "wg",
      from: 4,
      to: 5,
      kind: "epi",
      label: "Epilogue",
      meta: "next_tile",
    },
    {
      lane: "wg",
      from: 5,
      to: 6,
      kind: "load",
      label: "Prefetch",
      meta: "tile B, ph=0",
    },
    {
      lane: "wg",
      from: 6,
      to: 8,
      kind: "mma",
      label: "K-loop, 64 MMAs",
      meta: "tile B",
    },
    {
      lane: "wg",
      from: 8,
      to: 9,
      kind: "epi",
      label: "Epilogue",
      meta: "next_tile",
    },

    { lane: "tma", from: 0, to: 1, kind: "idle", label: "idle" },
    {
      lane: "tma",
      from: 1,
      to: 2,
      kind: "load",
      label: "Load k=0,1",
      meta: "tile A",
    },
    {
      lane: "tma",
      from: 2,
      to: 4,
      kind: "load",
      label: "Load k=2..63",
      meta: "ring reuse",
    },
    {
      lane: "tma",
      from: 4,
      to: 5,
      kind: "store",
      label: "Store A",
      meta: "from Dsmem",
    },
    {
      lane: "tma",
      from: 5,
      to: 6,
      kind: "load",
      label: "Load k=0,1",
      meta: "tile B",
    },
    {
      lane: "tma",
      from: 6,
      to: 8,
      kind: "load",
      label: "Load k=2..63",
      meta: "ring reuse",
    },
    {
      lane: "tma",
      from: 8,
      to: 9,
      kind: "store",
      label: "Store B",
      meta: "from Dsmem",
    },

    { lane: "tc", from: 0, to: 2, kind: "idle", label: "idle" },
    {
      lane: "tc",
      from: 2,
      to: 4,
      kind: "mma",
      label: "MMA x64",
      meta: "tile A",
    },
    {
      lane: "tc",
      from: 4,
      to: 6,
      kind: "idle",
      label: "idle",
      meta: "epilogue",
    },
    {
      lane: "tc",
      from: 6,
      to: 8,
      kind: "mma",
      label: "MMA x64",
      meta: "tile B",
    },
    { lane: "tc", from: 8, to: 9, kind: "idle", label: "idle" },
  ],
  barriers: [
    {
      id: "tma_bar",
      color: BARRIER_COLOR.tma_bar,
      desc: "Reused across tiles: 32 rounds per stage per tile, even, so parity returns to 0",
    },
    {
      id: "mma_bar",
      color: BARRIER_COLOR.mma_bar,
      desc: "Reused across tiles: 64 rounds per tile, even",
    },
    {
      id: "bulk group",
      color: BARRIER_COLOR.bulk,
      desc: "TMA store per tile: commit_group then wait_group(0)",
    },
  ],
  legend: [
    { name: "TMA load / issue", color: "var(--tma)" },
    { name: "MMA", color: "var(--mma)" },
    { name: "Epilogue", color: "var(--read)" },
    { name: "TMA store", color: "var(--store)" },
    { name: "Setup", color: "var(--ink-2)" },
  ],
  smem: {
    title: "SMEM ring",
    desc: "Allocated once per CTA and reused for every tile it processes.",
    groups: [
      { label: "Ring", slots: ["Stage 0", "Stage 1"] },
      { label: "Epilogue", slots: ["Dsmem"] },
    ],
  },
  tmem: {
    title: "TMEM accumulator",
    desc: "One 128 x 128 fp32 slot, allocated once and reused tile after tile; each segment is 16 K-tiles.",
    bars: [{ label: "tmem[:, 0:128]", segs: SEGS }],
  },
  steps: [
    {
      phase: "Setup",
      barriers: [],
      slots: [[free, free], [["free", "empty"]]],
      bars: [{ st: "free", filled: 0, txt: "allocated" }],
      explain: (
        <>
          The grid is one-dimensional: <code>SM_COUNT=148</code> CTAs, not one
          per output tile. Each CTA does its setup once, TMEM allocation,
          barrier init, <code>ClusterPersistentScheduler2D.init(bx)</code>, and
          keeps everything until it has run out of tiles. A 4096 x 4096 output
          has 1024 tiles, so roughly seven per CTA.
        </>
      ),
    },
    ...tile(0, "A"),
    ...tile(1, "B"),
  ],
});
