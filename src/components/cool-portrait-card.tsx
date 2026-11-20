/**
 * CoolPortraitCard: 3D tilt that follows the pointer and lifts the content
 * 50px toward the viewer while hovered.
 * Used on the About section portrait image (desktop only).
 */
"use client";

import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Rotate the card toward the pointer, 1deg per 25px from its center. */
function tilt(e: MouseEvent<HTMLDivElement>) {
  const card = e.currentTarget;
  const { left, top, width, height } = card.getBoundingClientRect();
  const x = (e.clientX - left - width / 2) / 25;
  const y = (e.clientY - top - height / 2) / 25;
  card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
}

function untilt(e: MouseEvent<HTMLDivElement>) {
  e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg)";
}

export default function CoolPortraitCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div style={{ perspective: "1000px" }}>
      <div
        onMouseMove={tilt}
        onMouseLeave={untilt}
        className={cn(
          "group relative flex items-center justify-center transition-all duration-200 ease-linear",
          className,
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]">
          <div className="w-fit transition duration-200 ease-linear group-hover:[transform:translateZ(50px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
