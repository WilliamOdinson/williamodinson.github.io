/**
 * mdx-to-html: Lightweight MDX-to-HTML converter for the RSS feed.
 *
 * Strips ESM import/export nodes (which are MDX-specific) and converts
 * the remaining Markdown+JSX content to plain HTML via remark/rehype.
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Node } from "unist";

interface MdxTree extends Node {
  children: { type: string }[];
}

/**
 * Convert raw MDX source to an HTML string.
 * MDX ESM nodes (`import`, `export`) are removed before conversion.
 */
export async function mdxToHtml(raw: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    // Remove ESM import/export statements that would break HTML output
    .use(() => (tree: Node) => {
      const root = tree as MdxTree;
      root.children = root.children.filter((n) => n.type !== "mdxjsEsm");
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(raw);

  return String(file);
}
