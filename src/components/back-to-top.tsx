/**
 * BackToTop: Floating button that scrolls the page to the top.
 * Appears after the user scrolls past 100 px, animates in/out via Framer Motion.
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Slide-up / slide-down animation states. */
const variants = {
  hidden: { x: 0, y: 100, opacity: 0 },
  visible: { x: 0, y: 0, opacity: 1 },
};

export default function BackToTop() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const show = scrollY > 100;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          className="fixed bottom-5 right-5"
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="h-11 w-11 rounded-full p-0"
                  aria-label="Press to return to top"
                >
                  <ChevronUp />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                <p>Return</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
