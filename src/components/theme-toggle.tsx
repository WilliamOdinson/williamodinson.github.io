/**
 * ThemeToggle: Sun/moon switch for dark mode.
 * A visually hidden checkbox carries the state for keyboards and screen
 * readers. The track and thumb are styled from the `.dark` class on `<html>`,
 * so the switch is in the right position from first paint.
 */
"use client";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <label
      className="
        relative inline-flex h-[32px] w-[60px] cursor-pointer items-center rounded-full
        has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring
        has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background
      "
    >
      <input
        type="checkbox"
        checked={theme === "light"}
        onChange={toggle}
        aria-label="Toggle dark mode"
        className="sr-only"
      />

      {/* Track */}
      <span
        className="
          absolute inset-0 rounded-full border-2 border-[#383838] bg-white
          transition-colors duration-300
          dark:bg-[#383838]
        "
      />

      {/* Thumb: solid sun circle in light mode, crescent moon in dark */}
      <span
        className="
          absolute left-[6px] top-[5px] h-[22px] w-[22px] translate-x-[26px] rounded-full
          bg-orange-400
          transition-transform duration-300
          dark:translate-x-0
          dark:bg-[#383838]
          dark:shadow-[inset_-8px_-4px_0_#ffffff]
        "
      />
    </label>
  );
}
