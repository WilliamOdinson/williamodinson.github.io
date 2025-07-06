import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

/**
 * Converts MDX content to HTML.
 */
export async function mdxToHtml(raw: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(() => (tree: any) => {
      tree.children = tree.children.filter((n: any) => n.type !== "mdxjsEsm");
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(raw);

  return String(file);
}
