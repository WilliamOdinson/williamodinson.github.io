/**
 * Lightbox: Full-screen overlay for viewing images.
 * Opens with a scale-in animation; closes on backdrop click or Escape key.
 *
 * Pass `onPrev` / `onNext` to turn it into a gallery viewer: arrow buttons
 * appear on both sides, the Left and Right keys step through, and `counter`
 * ("2 / 5") is shown under the image next to the caption.
 */
"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightboxProps {
  src: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
  /** Step to the previous image; enables the arrow buttons and keys. */
  onPrev?: () => void;
  /** Step to the next image; enables the arrow buttons and keys. */
  onNext?: () => void;
  /** Position label such as "2 / 5", shown when navigating a gallery. */
  counter?: string;
}

const navButton = cn(
  "absolute top-1/2 z-[101] flex h-11 w-11 -translate-y-1/2 items-center justify-center",
  "rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
);

export default function Lightbox({
  src,
  alt,
  open,
  onClose,
  onPrev,
  onNext,
  counter,
}: LightboxProps) {
  /** Escape closes; Left and Right step through a gallery. */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
      else if (e.key === "ArrowRight" && onNext) onNext();
    },
    [onClose, onPrev, onNext],
  );

  /* Bind/unbind keyboard listener and lock body scroll while open. */
  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  const hasNav = Boolean(onPrev || onNext);
  const hasCaption = Boolean(alt || counter);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Image"}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="absolute right-4 top-4 z-[101] flex h-10 w-10 items-center justify-center
                       rounded-full bg-white/10 text-white transition-colors hover:bg-white/20
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Gallery arrows, stopping propagation so a click does not close the overlay */}
          {onPrev && (
            <button
              type="button"
              aria-label="Previous image"
              className={cn(navButton, "left-3 md:left-6")}
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
          {onNext && (
            <button
              type="button"
              aria-label="Next image"
              className={cn(navButton, "right-3 md:right-6")}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          {/* The full-size image */}
          <motion.img
            src={src}
            alt={alt || ""}
            className={cn(
              "relative z-[101] rounded-lg object-contain shadow-2xl",
              /* Leave room for the caption below and the arrows beside it */
              hasCaption ? "max-h-[84vh]" : "max-h-[90vh]",
              hasNav ? "max-w-[80vw] md:max-w-[85vw]" : "max-w-[90vw]",
            )}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Optional alt-text caption and gallery position */}
          {(alt || counter) && (
            <motion.p
              className="absolute bottom-6 z-[101] flex max-w-lg flex-col items-center gap-1 text-center text-sm text-white/70"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              {alt && <span>{alt}</span>}
              {counter && (
                <span className="tabular-nums text-white/50" aria-live="polite">
                  {counter}
                </span>
              )}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
