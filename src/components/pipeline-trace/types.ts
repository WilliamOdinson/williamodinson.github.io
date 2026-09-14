/**
 * Types shared by the PipelineTrace component and its scenario files.
 *
 * A scenario is a fully declarative description of one kernel's execution:
 * lanes (warp roles), segments (what each role does over a cycle range),
 * barriers, memory resources, and the per-cycle state shown in the panels.
 * Colours are CSS custom properties from `pipeline-trace.module.css`.
 */
import type { ReactNode } from "react";

export type Kind =
  | "setup"
  | "load"
  | "mma"
  | "read"
  | "store"
  | "epi"
  | "signal"
  | "wait"
  | "idle";
export type SlotState = "free" | "loading" | "ready" | "reading";
export type BarState = "free" | "accumulating" | "ready" | "reading";
export type BandState = "idle" | "loading" | "reading";
export type TileState = "free" | "accum" | "ready" | "writing";

export interface Lane {
  id: string;
  name: string;
  sub: string;
  color: string;
}

export interface Segment {
  lane: string;
  /** First cycle (inclusive). */
  from: number;
  /** Last cycle (exclusive). */
  to: number;
  kind: Kind;
  label: string;
  meta?: string;
  /** Overrides the kind colour; wait blocks use the colour of the barrier they block on. */
  color?: string;
}

export interface Barrier {
  id: string;
  color: string;
  desc: string;
}

export interface FiredBarrier {
  id: string;
  /** Instance shown after the name, e.g. "[0]" or "[0] [1]". */
  tag?: string;
  /** Short qualifier, e.g. "cta_mask=3, both CTAs". */
  note?: string;
}

export interface LegendItem {
  name: string;
  color: string;
  wait?: boolean;
}

export interface SlotGroup {
  /** Optional row label, e.g. "CTA 0". */
  label?: string;
  slots: string[];
}

export interface SlotSection {
  title: string;
  desc: string;
  groups: SlotGroup[];
}

export interface BarSpec {
  label: string;
  segs: string[];
}

export interface BarSection {
  title: string;
  desc: string;
  bars: BarSpec[];
}

export interface TileBand {
  label: string;
  sub: string;
}

export interface TileMapSpec {
  title: string;
  desc: string;
  /** A slices, top to bottom; each becomes one band of output rows. */
  rows: TileBand[];
  /** Stored-B slices, left to right; each becomes one band of output columns. */
  cols: TileBand[];
  /** Number of column chunks the epilogue writes per row band. */
  chunks: number;
}

export interface TileFrame {
  a: BandState;
  b: BandState;
  d: TileState;
  /** Chunk index being written when `d` is "writing". */
  chunk?: number;
}

export interface Step {
  phase: string;
  barriers: FiredBarrier[];
  /** Per slot group, per slot. */
  slots: ReadonlyArray<ReadonlyArray<readonly [SlotState, string]>>;
  /** Per bar, in `BarSection.bars` order. */
  bars: ReadonlyArray<{ st: BarState; filled: number; txt: string }>;
  tile?: TileFrame;
  explain: ReactNode;
}

export interface Scenario {
  id: string;
  /** Accessible name of the trace, e.g. "Step 4, TMA async load, cycle by cycle". */
  label: string;
  /** Heading shown above the trace. */
  title: string;
  /** Two-or-three-word tab label. */
  short: string;
  /** Section of the book this trace accompanies. */
  book: { chapter: string; url: string };
  /** What to look at, two or three sentences. */
  intro: ReactNode;
  cycles: number;
  lanes: Lane[];
  segments: Segment[];
  barriers: Barrier[];
  legend: LegendItem[];
  smem: SlotSection;
  tmem: BarSection;
  tile?: TileMapSpec;
  steps: Step[];
}

export const KIND_COLOR: Record<Kind, string> = {
  setup: "var(--ink-2)",
  load: "var(--tma)",
  mma: "var(--mma)",
  read: "var(--read)",
  store: "var(--store)",
  epi: "var(--read)",
  signal: "var(--bar-mma2ld)",
  wait: "var(--ink-3)",
  idle: "var(--ink-3)",
};

export const SLOT_COLOR: Record<SlotState, string> = {
  loading: "var(--tma)",
  ready: "var(--ink)",
  reading: "var(--mma)",
  free: "var(--ink-3)",
};

export const BAR_COLOR: Record<BarState, string> = {
  accumulating: "var(--mma)",
  ready: "var(--ink)",
  reading: "var(--read)",
  free: "var(--ink-3)",
};

/** Colours shared by every scenario's four barriers. */
export const BARRIER_COLOR = {
  tma2mma: "var(--bar-tma2mma)",
  mma2tma: "var(--bar-mma2tma)",
  mma2ld: "var(--bar-mma2ld)",
  ld2mma: "var(--bar-ld2mma)",
  /* Steps 1 to 6: plain mbarriers and the TMA store's bulk async group. */
  tma_bar: "var(--tma)",
  mma_bar: "var(--mma)",
  bulk: "var(--store)",
} as const;

/** Throws at module load if a scenario's per-cycle tables are inconsistent. */
export function validate(s: Scenario): Scenario {
  const groups = s.smem.groups.length;
  const bars = s.tmem.bars.length;
  if (s.steps.length !== s.cycles) {
    throw new Error(`${s.id}: ${s.steps.length} steps for ${s.cycles} cycles`);
  }
  s.steps.forEach((step, c) => {
    if (step.slots.length !== groups)
      throw new Error(`${s.id} cycle ${c}: slot groups`);
    step.slots.forEach((g, i) => {
      if (g.length !== s.smem.groups[i].slots.length) {
        throw new Error(`${s.id} cycle ${c}: slots in group ${i}`);
      }
    });
    if (step.bars.length !== bars) throw new Error(`${s.id} cycle ${c}: bars`);
    if (Boolean(step.tile) !== Boolean(s.tile))
      throw new Error(`${s.id} cycle ${c}: tile`);
  });
  const laneIds = new Set(s.lanes.map((l) => l.id));
  for (const seg of s.segments) {
    if (!laneIds.has(seg.lane))
      throw new Error(`${s.id}: unknown lane ${seg.lane}`);
    if (seg.from < 0 || seg.to > s.cycles || seg.from >= seg.to) {
      throw new Error(`${s.id}: bad range on ${seg.lane} ${seg.label}`);
    }
  }
  return s;
}
