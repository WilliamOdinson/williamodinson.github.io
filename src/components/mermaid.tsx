"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // "light" | "dark"

  useEffect(() => {
    /* Initialize with the right Mermaid theme on every change */
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "default",
    });

    (async () => {
      if (!ref.current) return;

      // Clear previous SVG
      ref.current.innerHTML = "";

      try {
        const { svg } = await mermaid.render(
          `mermaid-${Date.now().toString(36)}`,
          chart,
        );
        ref.current.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid render error:", err);
        ref.current.innerHTML =
          '<pre style="color:red;">Mermaid render error</pre>';
      }
    })();
  }, [chart, theme]);

  return <div ref={ref} />;
}
