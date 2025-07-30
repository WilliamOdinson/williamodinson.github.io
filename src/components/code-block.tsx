"use client";

import { ReactElement, useState } from "react";
import { useTheme } from "@/components/theme-provider";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";

export default function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const child = props.children as ReactElement<{
    className?: string;
    children: string;
  }>;

  /* MDX always passes the literal code as a string in child.props.children */
  const rawCode =
    typeof child?.props?.children === "string"
      ? child.props.children.trimEnd()
      : "";

  const langMatch = /language-(\w+)/.exec(child?.props.className ?? "");
  const language = langMatch ? langMatch[1] : "";

  const [copied, setCopied] = useState(false);

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
      {/* Syntax‑highlighted code */}
      <SyntaxHighlighter
        /* important: passing the language enables color! */
        language={language}
        /* built‑in inline styles theme */
        style={prismTheme}
        /* personal tweaks */
        showLineNumbers={false}
        wrapLines
        useInlineStyles /* default, but explicit for clarity */
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
          style: {
            fontFamily: "Menlo, Roboto Mono, monospace",
          },
        }}
      >
        {rawCode}
      </SyntaxHighlighter>

      {/* copy button */}
      <button
        type="button"
        className="copy"
        onClick={handleCopy}
        data-copied={copied}
        aria-label={copied ? "Copied!" : "Copy to clipboard"}
      >
        <span
          className="tooltip"
          data-text-initial="Copy to clipboard"
          data-text-end="Copied!"
        />
        <span>
          {/* clipboard icon */}
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

          {/* checkmark icon */}
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

      {/* CSS for the button & tooltip */}
      <style jsx global>{`
        .copy {
          --bg: hsl(var(--secondary));
          --bg-hover: hsl(var(--secondary) / 0.85);
          --icon: hsl(var(--secondary-foreground));
          --icon-hover: hsl(var(--primary));

          --tooltip-bg: hsl(var(--popover));
          --tooltip-text: hsl(var(--popover-foreground));

          --radius: 10px;
          --d: 36px;
          --pad: 7px;
          --offset: 8px;
          --font: 12px Menlo, "Roboto Mono", monospace;
        }

        .copy {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: var(--d);
          height: var(--d);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius);
          background: var(--bg);
          color: var(--icon);
          border: none;
          cursor: pointer;
        }
        .copy svg {
          pointer-events: none;
        }
        .checkmark {
          display: none;
        }
        .copy[data-copied="true"] .clipboard {
          display: none;
        }
        .copy[data-copied="true"] .checkmark {
          display: block;
        }

        /* interactions */
        .copy:hover,
        .copy:focus-visible {
          background: var(--bg-hover);
        }

        .copy:hover svg,
        .copy:focus-visible svg {
          color: var(--icon-hover);
        }

        /* tooltip */
        .tooltip {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          visibility: hidden;
          font: var(--font);
          color: var(--tooltip-text);
          background: var(--tooltip-bg);
          white-space: nowrap;
          padding: var(--pad) var(--pad);
          border-radius: 4px;
          pointer-events: none;
        }
        .tooltip::after {
          content: "";
          position: absolute;
          bottom: calc(var(--pad) * -0.5);
          left: 50%;
          width: var(--pad);
          height: var(--pad);
          background: inherit;
          transform: translateX(-50%) rotate(45deg);
        }
        .tooltip::before {
          content: attr(data-text-initial);
        }
        .copy[data-copied="true"] .tooltip::before {
          content: attr(data-text-end);
        }

        /* show tooltip on hover / focus */
        .copy:hover .tooltip,
        .copy:focus-visible .tooltip {
          opacity: 1;
          visibility: visible;
          top: calc((100% + var(--offset)) * -1);
        }
      `}</style>
    </div>
  );
}
