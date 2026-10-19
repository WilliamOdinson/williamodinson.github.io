/**
 * MDX Component Overrides: Registers custom components for all MDX content.
 *
 * - `Mermaid`: Renders Mermaid diagrams from `<Mermaid chart="..." />`.
 * - `SaleItemPage`: Listing template that `remark-sale-item` wraps around
 *   every page under `src/app/sale/<slug>/`.
 * - `pre` to `CodeBlock`: Syntax-highlighted code fences with copy button.
 * - `img` to `MdxImage`: Clickable images that open in a full-screen lightbox.
 */
import type { MDXComponents } from "mdx/types";

import Mermaid from "@/components/mermaid";
import CodeBlock from "@/components/code-block";
import MdxImage from "@/components/mdx-image";
import JsonLd from "@/components/json-ld";
import SaleItemPage from "@/components/sale/sale-item-page";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Mermaid,
    JsonLd,
    SaleItemPage,
    pre: CodeBlock,
    img: MdxImage,
    ...components,
  };
}
