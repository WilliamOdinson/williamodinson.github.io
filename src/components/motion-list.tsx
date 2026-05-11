/**
 * MotionList: Animated `<ul>` that staggers its children into view.
 *
 * @param delayOffset   - Extra delay (seconds) before staggering begins.
 * @param showWhenInView - If true (default), waits until the list scrolls into view.
 *                         Set to false to animate immediately on mount.
 */
"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delayOffset: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.3 + delayOffset,
      staggerChildren: 0.1,
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
  /* Shared props for both modes. */
  const shared = {
    className: cn("flex gap-4", className),
    variants: containerVariants,
    custom: delayOffset,
    initial: "hidden" as const,
  };

  /*
   * When showWhenInView is true, use whileInView so the animation triggers
   * only when the element enters the viewport.  Otherwise animate on mount.
   */
  const animationProps = showWhenInView
    ? { whileInView: "visible" as const, viewport: { once: true } }
    : { animate: "visible" as const };

  return (
    <motion.ul {...shared} {...animationProps}>
      {children.map((child, i) => (
        <motion.li
          key={i}
          variants={itemVariants}
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
