/**
 * Mermaid: Renders a Mermaid diagram from a chart definition string.
 * Re-renders on theme change so the diagram inherits the correct palette.
 */
"use client";

import mermaid from "mermaid";
import { useEffect, useId, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

interface MermaidProps {
  /** The Mermaid diagram definition (e.g. "graph TD; A-->B"). */
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = `mermaid${useId()}`;
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    // mermaid.render() reuses `id` for the new SVG, so drop the old one first.
    // Renders run one at a time in mermaid's own queue.
    el.innerHTML = "";
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });
    mermaid.render(id, chart).then(({ svg }) => {
      if (!cancelled) el.innerHTML = svg;
    });

    return () => {
      cancelled = true;
    };
  }, [chart, theme, id]);

  return <div ref={ref} />;
}
