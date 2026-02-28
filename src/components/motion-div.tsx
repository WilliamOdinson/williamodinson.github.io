/**
 * MotionDiv: Generic scroll-triggered fade-and-slide-up wrapper.
 * Animates its children from y:100 to y:0 once visible in the viewport.
 *
 * @param delayOffset - Extra delay (seconds) before the animation starts.
 */
"use client";
import { cn } from "@/lib/utils";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export default function MotionDiv({
  children,
  delayOffset,
  className,
}: {
  children: React.ReactNode;
  delayOffset?: number;
  className?: string;
}) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start({ y: 0, opacity: 1 });
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative flex items-center justify-center", className)}
      initial={{ y: 100, opacity: 0 }}
      animate={controls}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 200,
        delay: delayOffset,
      }}
    >
      {children}
    </motion.div>
  );
}
