/**
 * PipelineTrace: interactive cycle-by-cycle trace of the nine GEMM kernels from
 * the "GEMM: Tiled to SOTA" chapters. One component, nine scenarios
 * (`step={1 | ... | 9}`); see ./scenarios.
 *
 * Usage in MDX:
 *   import PipelineTrace from "@/components/pipeline-trace";
 *   <PipelineTrace step={8} />
 *
 * - One column per cycle; the ruler doubles as a scrubber (click or drag).
 * - Keyboard shortcuts are scoped to the widget: they only fire while focus is
 *   inside it, so Space and the arrow keys keep scrolling the post otherwise.
 * - Theme-aware through the site's shadcn tokens (see the CSS module).
 */
"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack } from "lucide-react";

import { cn } from "@/lib/utils";
import styles from "./pipeline-trace.module.css";
import TileMap from "./tile-map";
import { SCENARIOS, type StepNumber } from "./scenarios";
import { BAR_COLOR, KIND_COLOR, SLOT_COLOR, type Segment } from "./types";

const BASE_MS = 1400;
const SPEEDS = [0.5, 1, 2] as const;

type BlockState = "future" | "active" | "done";

function blockState(seg: Segment, cycle: number): BlockState {
  if (cycle < seg.from) return "future";
  if (cycle >= seg.to) return "done";
  return "active";
}

export default function PipelineTrace({
  step,
  className,
}: {
  step: StepNumber;
  /** Replaces the default vertical margin (my-8) when embedded in another widget. */
  className?: string;
}) {
  const scenario = SCENARIOS[step];
  const last = scenario.cycles - 1;

  const [cycle, setCycle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);

  const gridRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const rulerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cycleRef = useRef(0);
  const measuredOnce = useRef(false);

  const current = scenario.steps[cycle];
  const fired = new Map(current.barriers.map((b) => [b.id, b]));

  /* ---- playback ---- */

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setCycle((c) => Math.min(last, c + 1));
    }, BASE_MS / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, last]);

  useEffect(() => {
    if (cycle === last) setPlaying(false);
  }, [cycle, last]);

  const jump = useCallback(
    (c: number) => {
      setPlaying(false);
      setCycle(Math.max(0, Math.min(last, c)));
    },
    [last],
  );

  const toggle = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (cycle === last) setCycle(0);
    setPlaying(true);
  }, [playing, cycle, last]);

  const reset = useCallback(() => jump(0), [jump]);

  /* ---- playhead geometry ---- */

  /** Reads the cycle from a ref so the callback stays stable for the ResizeObserver. */
  const positionPlayhead = useCallback(() => {
    const cell = rulerRefs.current[cycleRef.current];
    const playhead = playheadRef.current;
    if (!cell || !playhead) return;

    // Skip the slide-in on first paint; only later moves animate.
    if (!measuredOnce.current) {
      measuredOnce.current = true;
      playhead.classList.remove(styles.animated);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => playhead.classList.add(styles.animated));
      });
    }
    playhead.style.width = `${cell.offsetWidth}px`;
    playhead.style.transform = `translateX(${cell.offsetLeft}px)`;
  }, []);

  useEffect(() => {
    cycleRef.current = cycle;
    positionPlayhead();

    // Keep the current column in view when the grid scrolls horizontally.
    const cell = rulerRefs.current[cycle];
    const grid = gridRef.current;
    const scroll = scrollRef.current;
    if (!cell || !grid || !scroll) return;
    const x = grid.offsetLeft + cell.offsetLeft;
    const viewL = scroll.scrollLeft;
    const viewR = viewL + scroll.clientWidth;
    if (x < viewL || x + cell.offsetWidth > viewR) {
      scroll.scrollTo({ left: Math.max(0, x - 8), behavior: "smooth" });
    }
  }, [cycle, positionPlayhead]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(() => positionPlayhead());
    observer.observe(grid);
    document.fonts?.ready.then(positionPlayhead).catch(() => {});
    return () => observer.disconnect();
  }, [positionPlayhead]);

  /* ---- input ---- */

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onButton = e.target instanceof Element && e.target.closest("button");
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        jump(cycle + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        jump(cycle - 1);
        break;
      case "Home":
        e.preventDefault();
        jump(0);
        break;
      case "End":
        e.preventDefault();
        jump(last);
        break;
      case " ":
        if (onButton) return; // let the focused button handle its own click
        e.preventDefault();
        toggle();
        break;
      case "r":
      case "R":
        reset();
        break;
      default:
        break;
    }
  }

  /** Drag-scrub: entering a ruler cell with the primary button held jumps to it. */
  function onRulerEnter(e: PointerEvent<HTMLButtonElement>, c: number) {
    if (e.buttons & 1) jump(c);
  }

  /* ---- render ---- */

  return (
    <div
      className={cn(
        "not-prose",
        className ?? "my-8",
        styles.tokens,
        styles.root,
      )}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      aria-label={scenario.label}
    >
      <div className={styles.bar}>
        <div className={styles.transport}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={reset}
            aria-label="Back to cycle 0"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => jump(cycle - 1)}
            disabled={cycle === 0}
            aria-label="Previous cycle"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(styles.iconBtn, styles.play)}
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => jump(cycle + 1)}
            disabled={cycle === last}
            aria-label="Next cycle"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className={styles.readout}>
          <span>
            Cycle <b>{cycle}</b> <span className={styles.of}>of {last}</span>
          </span>
          <span className={styles.phase}>{current.phase}</span>
        </div>

        <div className={styles.speed} role="group" aria-label="Playback speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === speed}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className={styles.keys} aria-hidden="true">
          <kbd>Left</kbd>
          <kbd>Right</kbd>
          <span>step</span>
          <kbd>Space</kbd>
          <span>play</span>
          <kbd>R</kbd>
          <span>reset</span>
        </div>
      </div>

      <div className={styles.scroll} ref={scrollRef}>
        <div
          className={styles.grid}
          ref={gridRef}
          style={
            {
              "--n": scenario.cycles,
              "--rows": scenario.lanes.length,
            } as CSSProperties
          }
        >
          <div
            className={cn(styles.playhead, styles.animated)}
            ref={playheadRef}
            aria-hidden="true"
          />
          <div className={styles.corner}>cycle</div>

          {Array.from({ length: scenario.cycles }, (_, c) => (
            <button
              key={c}
              type="button"
              className={styles.ruler}
              style={{ gridColumn: c + 2 }}
              ref={(el) => {
                rulerRefs.current[c] = el;
              }}
              aria-label={`Go to cycle ${c}`}
              aria-current={c === cycle}
              onClick={() => jump(c)}
              onPointerEnter={(e) => onRulerEnter(e, c)}
            >
              {c}
            </button>
          ))}

          {scenario.lanes.map((lane, i) => {
            const row = i + 2;
            return (
              <Fragment key={lane.id}>
                <div
                  className={styles.lane}
                  style={{ gridRow: row, "--c": lane.color } as CSSProperties}
                >
                  <b>{lane.name}</b>
                  <span>{lane.sub}</span>
                </div>
                <div className={styles.track} style={{ gridRow: row }} />
                {scenario.segments
                  .filter((seg) => seg.lane === lane.id)
                  .map((seg) => {
                    const span = seg.to - seg.from;
                    const range =
                      span > 1
                        ? `cycles ${seg.from} to ${seg.to - 1}`
                        : `cycle ${seg.from}`;
                    return (
                      <div
                        key={`${seg.lane}-${seg.from}`}
                        className={styles.block}
                        data-kind={seg.kind}
                        data-state={blockState(seg, cycle)}
                        style={
                          {
                            gridRow: row,
                            gridColumn: `${seg.from + 2} / ${seg.to + 2}`,
                            "--c": seg.color ?? KIND_COLOR[seg.kind],
                          } as CSSProperties
                        }
                        title={`${lane.name} (${lane.sub}): ${seg.label}${seg.meta ? ` (${seg.meta})` : ""}, ${range}`}
                      >
                        <b>{seg.label}</b>
                        {seg.meta && <span>{seg.meta}</span>}
                      </div>
                    );
                  })}
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles.events}>
        <div className={styles.sectionTitle}>Barriers fired this cycle</div>
        <div className={styles.chips}>
          {scenario.barriers.map((b) => {
            const hit = fired.get(b.id);
            const active = hit !== undefined;
            return (
              <div
                key={b.id}
                className={styles.chip}
                data-active={active}
                style={{ "--c": b.color } as CSSProperties}
              >
                {/* Keyed on the cycle so the ping replays when a barrier fires on consecutive cycles. */}
                <span
                  key={active ? cycle : -1}
                  className={cn(styles.dot, active && styles.fire)}
                />
                <span className={styles.chipBody}>
                  <span className={styles.chipName}>
                    {b.id}
                    {hit?.tag && (
                      <i>{hit.tag.startsWith("[") ? hit.tag : ` ${hit.tag}`}</i>
                    )}
                    {hit?.note && <em>{hit.note}</em>}
                  </span>
                  <span className={styles.chipDesc}>{b.desc}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.legend}>
        {scenario.legend.map((item) => (
          <div
            key={item.name}
            className={styles.legendItem}
            style={{ "--c": item.color } as CSSProperties}
          >
            <span className={cn(styles.swatch, item.wait && styles.wait)} />
            {item.name}
          </div>
        ))}
      </div>

      <div className={styles.state}>
        <section
          className={styles.stateSection}
          aria-label={scenario.smem.title}
        >
          <div className={styles.sectionTitle}>{scenario.smem.title}</div>
          <p>{scenario.smem.desc}</p>
          {scenario.smem.groups.map((group, gi) => (
            <div key={gi} className={styles.slotGroup}>
              {group.label && (
                <div className={styles.groupLabel}>{group.label}</div>
              )}
              <div className={styles.slots}>
                {group.slots.map((name, si) => {
                  const [st, txt] = current.slots[gi][si];
                  return (
                    <div
                      key={name}
                      className={styles.slot}
                      data-state={st}
                      style={{ "--c": SLOT_COLOR[st] } as CSSProperties}
                    >
                      <div className={styles.slotName}>{name}</div>
                      <div className={styles.slotStatus}>{txt}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section
          className={styles.stateSection}
          aria-label={scenario.tmem.title}
        >
          <div className={styles.sectionTitle}>{scenario.tmem.title}</div>
          <p>{scenario.tmem.desc}</p>
          {scenario.tmem.bars.map((bar, bi) => {
            const state = current.bars[bi];
            return (
              <div
                key={bar.label}
                className={styles.tmem}
                data-state={state.st}
                style={{ "--c": BAR_COLOR[state.st] } as CSSProperties}
              >
                <div className={styles.groupLabel}>{bar.label}</div>
                <div
                  className={styles.tmemBar}
                  style={{ "--segs": bar.segs.length } as CSSProperties}
                >
                  {bar.segs.map((seg, k) => (
                    <div
                      key={seg}
                      className={styles.tmemSeg}
                      data-on={k < state.filled}
                      title={seg}
                    />
                  ))}
                </div>
                <div
                  className={styles.tmemK}
                  style={{ "--segs": bar.segs.length } as CSSProperties}
                >
                  {bar.segs.map((seg) => (
                    <span key={seg}>{seg}</span>
                  ))}
                </div>
                <div className={styles.tmemText}>
                  <span>{state.txt}</span>
                  <span>{state.st}</span>
                </div>
              </div>
            );
          })}
        </section>

        {scenario.tile && current.tile && (
          <section
            className={cn(styles.stateSection, styles.tileSection)}
            aria-label={scenario.tile.title}
          >
            <div className={styles.sectionTitle}>{scenario.tile.title}</div>
            <p>{scenario.tile.desc}</p>
            <div className={styles.tileWrap}>
              <TileMap spec={scenario.tile} frame={current.tile} />
              <div className={styles.tileLegend}>
                <span className={styles.tileKey} data-kind="load">
                  operand loading
                </span>
                <span className={styles.tileKey} data-kind="mma">
                  operand read by MMA / accumulating
                </span>
                <span className={styles.tileKey} data-kind="epi">
                  column chunk being written
                </span>
              </div>
            </div>
          </section>
        )}

        <section
          className={cn(styles.stateSection, styles.narration)}
          aria-live="polite"
        >
          <div className={styles.sectionTitle}>
            Cycle {cycle}:{" "}
            {current.phase.charAt(0).toLowerCase() + current.phase.slice(1)}
          </div>
          <p key={cycle} className={styles.fade}>
            {current.explain}
          </p>
        </section>
      </div>
    </div>
  );
}
