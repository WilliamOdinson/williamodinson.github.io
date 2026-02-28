/**
 * MDX Component Overrides: Registers custom components for all MDX content.
 *
 * - `Mermaid`: Renders Mermaid diagrams from `<Mermaid chart="..." />`.
 * - `pre` to `CodeBlock`: Syntax-highlighted code fences with copy button.
 * - `img` to `MdxImage`: Clickable images that open in a full-screen lightbox.
 */
import type { MDXComponents } from "mdx/types";

import Mermaid from "@/components/mermaid";
import CodeBlock from "@/components/code-block";
import MdxImage from "@/components/mdx-image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Mermaid,
    pre: CodeBlock,
    img: MdxImage,
    ...components,
  };
}
