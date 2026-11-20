/**
 * Mermaid: Renders a Mermaid diagram from a chart definition string.
 * Re-renders on theme change so the diagram inherits the correct palette.
 * The mermaid library is imported on mount, so pages without a diagram never
 * download it.
 */
"use client";

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

    import("mermaid").then(async ({ default: mermaid }) => {
      if (cancelled) return;
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dark" ? "dark" : "default",
      });
      // render() reuses `id` for the new SVG, so the old one goes first.
      // Renders run one at a time in mermaid's own queue.
      el.innerHTML = "";
      const { svg } = await mermaid.render(id, chart);
      if (!cancelled) el.innerHTML = svg;
    });

    return () => {
      cancelled = true;
    };
  }, [chart, theme, id]);

  return <div ref={ref} />;
}
