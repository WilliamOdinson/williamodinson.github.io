/**
 * CodeBlock: Custom `<pre>` override for MDX code fences.
 *
 * Features:
 *  - Syntax highlighting via react-syntax-highlighter (Prism).
 *  - Theme-aware: switches between one-dark / one-light.
 *  - Copy-to-clipboard button (styles in globals.css `.copy-btn`).
 */
"use client";

import { ReactElement, useState } from "react";
import { useTheme } from "@/components/theme-provider";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

export default function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  // MDX wraps fenced code in <pre><code className="language-X">…</code></pre>
  const child = props.children as ReactElement<{
    className?: string;
    children: string;
  }>;

  /** The raw source code string. */
  const rawCode =
    typeof child?.props?.children === "string"
      ? child.props.children.trimEnd()
      : "";

  /** Extract the language identifier (e.g. "tsx") from the className. */
  const langMatch = /language-(\w+)/.exec(child?.props.className ?? "");
  const language = langMatch ? langMatch[1] : "";

  const [copied, setCopied] = useState(false);

  /** Write code to the system clipboard and flash a "Copied!" state. */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Clipboard write failed:", err);
    }
  }

  const { theme } = useTheme();
  const prismTheme = theme === "dark" ? oneDark : oneLight;

  return (
    <div className="relative my-4">
      <SyntaxHighlighter
        language={language}
        style={prismTheme}
        showLineNumbers={false}
        wrapLines
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          border: "1px solid hsl(var(--border))",
          padding: "1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          background: "transparent",
        }}
        codeTagProps={{
          style: { fontFamily: "Menlo, Roboto Mono, monospace" },
        }}
      >
        {rawCode}
      </SyntaxHighlighter>

      {/* Copy button: styles live in globals.css (.copy-btn) */}
      <button
        type="button"
        className="copy-btn"
        onClick={handleCopy}
        data-copied={copied}
        aria-label={copied ? "Copied!" : "Copy to clipboard"}
      >
        <span
          className="copy-tooltip"
          data-text-initial="Copy to clipboard"
          data-text-end="Copied!"
        />
        <span>
          {/* Clipboard icon (shown by default) */}
          <svg
            className="clipboard"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 6.35 6.35"
            width="20"
            height="20"
          >
            <path
              fill="currentColor"
              d="M2.43.265c-.3 0-.548.236-.573.53h-.328a.74.74 0 0 0-.735.734v3.822a.74.74 0 0 0 .735.734H4.82a.74.74 0 0 0 .735-.734V1.529a.74.74 0 0 0-.735-.735h-.328a.58.58 0 0 0-.573-.53zm0 .529h1.49c.032 0 .049.017.049.049v.431c0 .032-.017.049-.049.049H2.43c-.032 0-.05-.017-.05-.049V.843c0-.032.018-.05.05-.05zm-.901.53h.328c.026.292.274.528.573.528h1.49a.58.58 0 0 0 .573-.529h.328a.2.2 0 0 1 .206.206v3.822a.2.2 0 0 1-.206.205H1.53a.2.2 0 0 1-.206-.205V1.529a.2.2 0 0 1 .206-.206z"
            />
          </svg>

          {/* Checkmark icon (shown after copy) */}
          <svg
            className="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              fill="currentColor"
              d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
