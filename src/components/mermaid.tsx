/**
 * Mermaid: Renders a Mermaid diagram from a chart definition string.
 * Re-renders on theme change so the diagram inherits the correct palette.
 */
"use client";

import mermaid from "mermaid";
import { useEffect, useId, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

/** Module-level counter to guarantee unique render IDs across hot-reloads. */
let renderCounter = 0;

interface MermaidProps {
  /** The Mermaid diagram definition (e.g. "graph TD; A-->B"). */
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stableId = useId().replace(/:/g, "-");
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });

    (async () => {
      if (!ref.current) return;
      ref.current.innerHTML = "";

      try {
        const id = `mermaid${stableId}-${++renderCounter}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (!cancelled && ref.current) {
          ref.current.innerHTML =
            '<pre style="color:red;">Mermaid render error</pre>';
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, theme, stableId]);

  return <div ref={ref} />;
}
