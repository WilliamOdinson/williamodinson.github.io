/**
 * Step 3: spatial tiling (M=N=256, K=256 shown: a 2 x 2 grid of CTAs, four
 * K chunks each). Every CTA runs the Step 2 loop unchanged on its own
 * 128 x 128 tile; bx picks the A rows, by picks the stored-B rows.
 */
import {
  BARRIER_COLOR,
  validate,
  type Scenario,
  type Segment,
  type Step,
  type TileFrame,
} from "../types";

const K_TILES = 4;

const CTAS = [
  { id: "c00", bx: 0, by: 0 },
  { id: "c01", bx: 0, by: 1 },
  { id: "c10", bx: 1, by: 0 },
  { id: "c11", bx: 1, by: 1 },
] as const;

const rows = (b: number) => `${b * 128}:${b * 128 + 128}`;

const ctaSegments = ({ id }: (typeof CTAS)[number]): Segment[] => [
  ...Array.from({ length: K_TILES }, (_, k): Segment[] => [
    {
      lane: id,
      from: 2 * k,
      to: 2 * k + 1,
      kind: "load",
      label: `Copy k=${k}`,
      meta: "A, B, sync",
    },
    {
      lane: id,
      from: 2 * k + 1,
      to: 2 * k + 2,
      kind: "mma",
      label: `MMA k=${k}`,
      meta: `wait ph${k % 2}`,
    },
  ]).flat(),
  {
    lane: id,
    from: 8,
    to: 9,
    kind: "read",
    label: "Epilogue",
    meta: "own D tile",
  },
];

const loadingFrame: TileFrame = { a: "loading", b: "loading", d: "free" };
const computeFrame: TileFrame = { a: "reading", b: "reading", d: "accum" };

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
  tile: k === 0 ? loadingFrame : { ...loadingFrame, d: "accum" },
  explain:
    k === 0 ? (
      <>
        The grid is <code>[M / 128, N / 128]</code>, here 2 x 2. CTA{" "}
        <code>(bx, by)</code> computes{" "}
        <code>D[bx*128 : +128, by*128 : +128]</code>, so its loop reads A rows{" "}
        <code>bx*128 : +128</code> and stored-B rows <code>by*128 : +128</code>.
        Watch the overlap: CTAs (0,0) and (0,1) both load A rows 0:128, and
        (0,0) and (1,0) both load B rows 0:128. Nothing is shared between CTAs
        yet.
      </>
    ) : (
      <>
        Chunk k={k}: every CTA copies its own 128 x 64 slices of A and B. Four
        SMs move four times the data of Step 2, and the redundant A and B reads
        only get filtered by L2.
      </>
    ),
});

const mma = (k: number): Step => ({
  phase: "K-loop",
  barriers: [
    { id: "mma_bar", tag: `ph${k % 2}`, note: "each CTA's own barrier" },
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
  tile: computeFrame,
  explain:
    k === 0 ? (
      <>
        Every CTA runs the Step 2 loop on its own SM with its own SMEM, TMEM and{" "}
        <code>mma_bar</code>, so four MMAs run in parallel on four Tensor Cores.
        Inside a CTA nothing changed: one elected thread issues, everyone waits
        on the right phase.
      </>
    ) : (
      <>
        MMA k={k} on all four CTAs, <code>accum=True</code>, wait on phase{" "}
        {k % 2}. The CTAs are drawn in lockstep, but the hardware gives no such
        guarantee; each one only synchronises with itself.
      </>
    ),
});

export const step3: Scenario = validate({
  id: "step3",
  title: "Spatial tiling, multi-CTA",
  short: "Grid",
  book: {
    chapter: "Building a Tiled GEMM",
    url: "https://mlc.ai/modern-gpu-programming-for-mlsys/chapter_gemm_basics/index.html#step-3-spatial-tiling-multi-cta",
  },
  intro: (
    <>
      A 2 x 2 grid of CTAs, each running the Step 2 loop on its own tile. The
      tile map shows <code>bx</code> picking A rows and <code>by</code> picking
      stored-B rows, and how many CTAs load the same slice without sharing it.
    </>
  ),
  label: "Step 3, multi-CTA spatial tiling, cycle by cycle",
  cycles: 9,
  lanes: CTAS.map(({ id, bx, by }) => ({
    id,
    name: `CTA (${bx}, ${by})`,
    sub: `A ${rows(bx)}, B ${rows(by)}`,
    color: "var(--ink-2)",
  })),
  segments: CTAS.flatMap(ctaSegments),
  barriers: [
    {
      id: "mma_bar",
      color: BARRIER_COLOR.mma_bar,
      desc: "Per CTA. Same reuse and phase flip as Step 2; CTAs never wait on each other",
    },
  ],
  legend: [
    { name: "Thread copy", color: "var(--tma)" },
    { name: "MMA", color: "var(--mma)" },
    { name: "Writeback", color: "var(--read)" },
  ],
  smem: {
    title: "SMEM (each CTA)",
    desc: "Every CTA has its own A and B tile pair; the state below is the same in all four.",
    groups: [{ slots: ["Asmem", "Bsmem"] }],
  },
  tmem: {
    title: "TMEM (each CTA)",
    desc: "One 128 x 128 fp32 accumulator per CTA, one output tile each.",
    bars: [{ label: "tmem[:, 0:128]", segs: ["k0", "k1", "k2", "k3"] }],
  },
  tile: {
    title: "Output 256 x 256, four CTAs",
    desc: "bx selects the A rows and therefore the D rows; by selects the stored-B rows, which become D columns after B.T. Each cell is one CTA's tile.",
    rows: [
      { label: "A 0:128", sub: "bx = 0" },
      { label: "A 128:256", sub: "bx = 1" },
    ],
    cols: [
      { label: "B 0:128", sub: "by = 0" },
      { label: "B 128:256", sub: "by = 1" },
    ],
    chunks: 1,
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
      tile: { a: "idle", b: "idle", d: "writing", chunk: 0 },
      explain: (
        <>
          Each CTA writes its own 128 x 128 tile with <code>m_st</code> and{" "}
          <code>n_st</code> offsets; together they cover the 256 x 256 output.
          For M=N=4096 this grid is 32 x 32 = 1024 CTAs, every one loading its A
          and B slices independently. That redundancy and the per-tile launch
          cost are what Steps 4 to 6 go after.
        </>
      ),
    },
  ],
});
