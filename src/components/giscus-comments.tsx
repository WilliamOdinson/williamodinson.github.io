/**
 * GiscusComments: Embeds the Giscus comment widget (GitHub Discussions-backed).
 *
 * Workflow:
 *  1. On mount, injects the Giscus `<script>` tag once.
 *  2. On theme change, sends a postMessage to the Giscus iframe to toggle its theme.
 */
"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

/** Giscus configuration attributes (keys map directly to `data-*` attributes). */
const GISCUS_CONFIG: Record<string, string> = {
  repo: "WilliamOdinson/williamodinson.github.io",
  "repo-id": "R_kgDOPGBcbA",
  category: "Announcements",
  "category-id": "DIC_kwDOPGBcbM4CteGj",
  mapping: "pathname",
  strict: "0",
  "reactions-enabled": "1",
  "emit-metadata": "0",
  "input-position": "bottom",
  loading: "lazy",
  lang: "en",
};

export default function GiscusComments() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  /* Inject the Giscus script once on first mount */
  useEffect(() => {
    if (!container.current) return;

    // Avoid re-injecting if already present
    if (container.current.querySelector("script[data-giscus]")) return;

    const initialTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.setAttribute("crossorigin", "anonymous");
    s.setAttribute("data-giscus", "");
    s.setAttribute("data-theme", initialTheme);

    for (const [key, value] of Object.entries(GISCUS_CONFIG)) {
      s.setAttribute(`data-${key}`, value);
    }

    container.current.appendChild(s);
  }, []);

  /* Sync the Giscus iframe theme whenever our app theme changes */
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    if (!iframe) return;

    iframe.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            theme: theme === "dark" ? "dark" : "light",
          },
        },
      },
      "https://giscus.app",
    );
  }, [theme]);

  return <div ref={container} />;
}
