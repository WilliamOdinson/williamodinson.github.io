/**
 * ThemeProvider: React context that holds the light/dark theme.
 *
 * The inline script in `app/layout.tsx` sets the `.dark` class on `<html>`
 * before first paint, from `localStorage("theme")` or the OS preference. The
 * provider adopts that class on mount; `toggle` flips the class and saves the
 * choice. Styling should use Tailwind's `dark:` variant where it can, since
 * `theme` is "light" until the provider has mounted.
 */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Matches the prerendered HTML, which cannot know the visitor's theme.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setTheme("dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
