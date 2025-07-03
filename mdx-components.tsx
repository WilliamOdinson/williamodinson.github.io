import type { MDXComponents } from "mdx/types";
import Mermaid from "@/components/mermaid";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Mermaid,
    ...components,
  };
}
