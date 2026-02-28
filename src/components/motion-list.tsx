/**
 * MotionList: Animated `<ul>` that staggers its children into view.
 *
 * @param delayOffset   - Extra delay (seconds) before staggering begins.
 * @param showWhenInView - If true (default), waits until the list scrolls into view.
 *                         Set to false to animate immediately on mount.
 */
"use client";
import { cn } from "@/lib/utils";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export default function MotionList({
  children,
  className,
  delayOffset = 0,
  showWhenInView = true,
}: {
  children: React.ReactNode[];
  className?: string;
  delayOffset?: number;
  showWhenInView?: boolean;
}) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  /* Animate immediately when scroll-gating is disabled. */
  useEffect(() => {
    if (!showWhenInView) {
      controls.start("visible");
    }
  }, [controls, showWhenInView]);

  /* Animate once the element enters the viewport. */
  useEffect(() => {
    if (isInView && showWhenInView) {
      controls.start("visible");
    }
  }, [isInView, controls, showWhenInView]);

  return (
    <motion.ul
      ref={ref}
      className={cn("flex gap-4", className)}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            delayChildren: 0.3 + delayOffset,
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children.map((child, i) => (
        <motion.li
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100,
          }}
        >
          {child}
        </motion.li>
      ))}
    </motion.ul>
  );
}
