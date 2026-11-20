/**
 * MotionList: Animated `<ul>` that staggers its children in on mount.
 *
 * @param delayOffset - Extra delay (seconds) before staggering begins.
 */
"use client";
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
  delayOffset,
}: {
  children: React.ReactNode[];
  delayOffset: number;
}) {
  return (
    <motion.ul
      className="flex gap-4"
      variants={containerVariants}
      custom={delayOffset}
      initial="hidden"
      animate="visible"
    >
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
