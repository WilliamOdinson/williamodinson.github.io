/**
 * mdx-to-html: converts a post's MDX source to HTML for the RSS feed.
 *
 * Front matter and ESM `import`/`export` statements are dropped. JSX
 * components become empty `<div>`s, since feed readers cannot run them.
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Node } from "unist";

interface MdxTree extends Node {
  children: { type: string }[];
}

export async function mdxToHtml(raw: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkMdx)
    // remark-rehype would emit ESM nodes as plain text.
    .use(() => (tree: Node) => {
      const root = tree as MdxTree;
      root.children = root.children.filter((n) => n.type !== "mdxjsEsm");
    })
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(raw);

  return String(file);
}
