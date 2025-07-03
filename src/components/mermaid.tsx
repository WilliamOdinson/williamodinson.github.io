"use client";

import mermaid from "mermaid";
import { useEffect, useRef } from "react";

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "default" });

    (async () => {
      if (!ref.current) return;

      ref.current.innerHTML = "";

      try {
        const { svg } = await mermaid.render(
          `mermaid-${Date.now().toString(36)}`,
          chart,
        );
        ref.current.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid render error:", err);
        ref.current.innerHTML = `<pre style="color:red;">Mermaid render error</pre>`;
      }
    })();
  }, [chart]);

  return <div ref={ref} />;
}
