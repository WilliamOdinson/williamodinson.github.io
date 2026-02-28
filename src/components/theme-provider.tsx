/**
 * ThemeProvider: React context that manages and persists the light/dark theme.
 *
 * Initialization priority:
 *  1. `localStorage("theme")`: user's explicit choice.
 *  2. `prefers-color-scheme` media query: OS-level preference.
 *  3. Fallback to "light".
 *
 * The provider toggles the `.dark` class on `<html>` so Tailwind's dark mode works.
 */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light"); // SSR-safe default

  /* Read the persisted or system theme once on mount. */
  useEffect(() => {
    let initial: Theme = "light";

    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      initial = stored;
    } else {
      try {
        initial = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } catch {
        /* Keep "light" on failure */
      }
    }

    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  /** Toggle between light and dark, persisting the choice to localStorage. */
  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook to access the current theme and toggle function. */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
};
