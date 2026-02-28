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

export default function GiscusComments() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  /* Inject the Giscus script once on first mount */
  useEffect(() => {
    if (!container.current) return;

    const initialTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

    // Avoid re-injecting if already present
    if (container.current.querySelector("script[data-giscus]")) return;

    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.setAttribute("crossorigin", "anonymous");
    s.setAttribute("data-giscus", "");

    // Repository mapping
    s.setAttribute("data-repo", "WilliamOdinson/williamodinson.github.io");
    s.setAttribute("data-repo-id", "R_kgDOPGBcbA");
    s.setAttribute("data-category", "Announcements");
    s.setAttribute("data-category-id", "DIC_kwDOPGBcbM4CteGj");

    // Behaviour
    s.setAttribute("data-mapping", "pathname");
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "bottom");
    s.setAttribute("data-loading", "lazy");
    s.setAttribute("data-theme", initialTheme);
    s.setAttribute("data-lang", "en");

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
