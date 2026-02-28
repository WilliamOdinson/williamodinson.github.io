/**
 * ThemeToggle: Sun/moon toggle switch for dark mode.
 * Uses a hidden checkbox + CSS-only animation to morph between states.
 */
"use client";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <label className="focus-ring relative inline-flex h-[32px] w-[60px] cursor-pointer items-center">
      <input
        type="checkbox"
        checked={isLight}
        onChange={toggle}
        aria-label="Toggle dark mode"
        className="peer sr-only"
      />

      {/* Track */}
      <span
        className="
          absolute inset-0 rounded-full border-2 border-[#383838] bg-[#383838]
          transition-colors duration-300
          peer-checked:bg-white
        "
      />

      {/* Thumb: crescent moon in dark mode, solid sun circle in light */}
      <span
        className="
          absolute left-[6px] top-[5px] h-[22px] w-[22px] rounded-full
          bg-[#383838] shadow-[inset_-8px_-4px_0_#ffffff]
          transition-transform duration-300
          peer-checked:translate-x-[26px]
          peer-checked:bg-orange-400
          peer-checked:shadow-none
        "
      />
    </label>
  );
}
