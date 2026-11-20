/**
 * MotionText: Per-grapheme spring animation for a text string.
 * Each character slides up independently with a small staggered delay,
 * creating a typewriter-like reveal effect.
 */
"use client";
import { motion } from "framer-motion";

/** Shared segmenter instance (hoisted to avoid re-creation on every render). */
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

export default function MotionText({ children }: { children: string }) {
  /* Grapheme clusters (emoji-safe). Spaces become NBSP because a lone space
     in an inline-flex span collapses to zero width. */
  const letters = Array.from(segmenter.segment(children), ({ segment }) =>
    segment === " " ? " " : segment,
  );

  return (
    <div>
      {letters.map((letter, index) => (
        <motion.span
          className="inline-flex"
          key={index}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: index * 0.02,
            type: "spring",
            damping: 15,
            stiffness: 400,
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
