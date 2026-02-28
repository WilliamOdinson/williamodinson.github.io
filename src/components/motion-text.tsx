/**
 * MotionText: Per-grapheme spring animation for a text string.
 * Each character slides up independently with a small staggered delay,
 * creating a typewriter-like reveal effect.
 */
"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";

/** Shared segmenter instance (hoisted to avoid re-creation on every render). */
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

export default function MotionText({
  children,
  delayOffset = 0,
}: {
  children: string;
  /** Base delay (seconds) added before the per-character stagger begins. */
  delayOffset: number;
}) {
  /** Split the text into grapheme clusters (emoji-safe). */
  const letters = useMemo(
    () =>
      Array.from(segmenter.segment(children), (s) => s.segment).map((ch) =>
        ch === " " ? "\u00A0" : ch,
      ),
    [children],
  );

  return (
    <motion.div>
      {letters.map((letter, index) => (
        <motion.span
          className="inline-flex"
          key={index}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: index * 0.03 + delayOffset,
            type: "spring",
            damping: 15,
            stiffness: 400,
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}
