/**
 * StepSwitcher: one widget for the whole GEMM series. A tab per step selects
 * which trace is shown; the header links to the matching section of the book
 * and says what to look at. The selected step is mirrored into the URL hash
 * (#step-5) so the book, or a reader, can link straight to a trace.
 *
 * Usage in MDX:
 *   import StepSwitcher from "@/components/pipeline-trace/step-switcher";
 *   <StepSwitcher />
 */
"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ExternalLink } from "lucide-react";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

import { cn } from "@/lib/utils";
import PipelineTrace from "./index";
import styles from "./pipeline-trace.module.css";
import { SCENARIOS, type StepNumber } from "./scenarios";
import TileScheduleMap from "./tile-schedule-map";

const STEPS: StepNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** The wrapper's height tweens between the old and new panel so nothing below jumps. */
const heightTransition = { duration: 0.26, ease: "easeInOut" } as const;
const pillTransition = { type: "spring", stiffness: 560, damping: 40 } as const;

function stepFromHash(hash: string): StepNumber | null {
  const m = /^#step-([1-9])$/.exec(hash);
  return m ? (Number(m[1]) as StepNumber) : null;
}

export default function StepSwitcher({
  initialStep = 1,
}: {
  initialStep?: StepNumber;
}) {
  const [step, setStep] = useState<StepNumber>(initialStep);
  const scenario = SCENARIOS[step];
  // The clip wrapper is pinned to the measured height of the current panel and
  // tweens to the new height on every change, so content below never jumps.
  const contentRef = useRef<HTMLDivElement>(null);
  const heightMv = useMotionValue(0);
  const [measured, setMeasured] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    let first = true;
    const observer = new ResizeObserver(() => {
      const h = el.offsetHeight;
      if (first || reduceMotion) {
        heightMv.set(h);
        first = false;
        setMeasured(true);
        return;
      }
      animate(heightMv, h, heightTransition);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [heightMv, reduceMotion]);

  // Pick up #step-N on load and on back/forward; runs only on the client.
  useEffect(() => {
    const apply = () => {
      const s = stepFromHash(window.location.hash);
      if (s !== null) setStep(s);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  function select(s: StepNumber) {
    setStep(s);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#step-${s}`);
    }
  }

  /** Left/Right move between tabs, as in a WAI-ARIA tablist. */
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, s: StepNumber) {
    const i = STEPS.indexOf(s);
    let next: StepNumber | null = null;
    if (e.key === "ArrowRight") next = STEPS[(i + 1) % STEPS.length];
    if (e.key === "ArrowLeft")
      next = STEPS[(i - 1 + STEPS.length) % STEPS.length];
    if (e.key === "Home") next = STEPS[0];
    if (e.key === "End") next = STEPS[STEPS.length - 1];
    if (next === null) return;
    e.preventDefault();
    select(next);
    document.getElementById(`step-tab-${next}`)?.focus();
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("not-prose my-8", styles.tokens, styles.switcher)}>
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="GEMM optimisation steps"
        >
          {STEPS.map((s) => (
            <button
              key={s}
              id={`step-tab-${s}`}
              type="button"
              role="tab"
              className={styles.tab}
              aria-selected={s === step}
              aria-controls={`step-panel-${s}`}
              tabIndex={s === step ? 0 : -1}
              onClick={() => select(s)}
              onKeyDown={(e) => onTabKey(e, s)}
            >
              {s === step && (
                <motion.span
                  className={styles.tabPill}
                  layoutId="step-tab-pill"
                  transition={pillTransition}
                  aria-hidden="true"
                />
              )}
              <b>{s}</b>
              <span>{SCENARIOS[s].short}</span>
            </button>
          ))}
        </div>

        <motion.div
          className={styles.panelClip}
          style={{ height: measured ? heightMv : "auto" }}
        >
          <div ref={contentRef} className={styles.panelInner}>
            <div
              key={step}
              id={`step-panel-${step}`}
              role="tabpanel"
              aria-labelledby={`step-tab-${step}`}
            >
              <div className={styles.stepHead}>
                <div className={styles.stepTitle}>
                  Step {step}: {scenario.title}
                </div>
                <a
                  className={styles.stepBook}
                  href={scenario.book.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  In the book: {scenario.book.chapter}
                  <ExternalLink aria-hidden="true" />
                </a>
                <p className={styles.stepIntro}>{scenario.intro}</p>
              </div>

              {/* Keyed on the step so a switch remounts the trace at cycle 0. */}
              <PipelineTrace key={step} step={step} className="mt-3" />

              {step === 6 && (
                <TileScheduleMap
                  mTiles={16}
                  nTiles={8}
                  groupSize={8}
                  className="mt-5"
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
