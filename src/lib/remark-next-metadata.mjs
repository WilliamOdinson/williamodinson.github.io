/**
 * remark-next-metadata
 *
 * A remark plugin that reads the YAML front-matter of a blog post
 * (`src/app/blog/<slug>/page.mdx`) and injects a Next.js
 * `export const metadata = { … }` declaration.
 *
 * Must run AFTER `remark-frontmatter` (which parses the YAML block into the AST).
 *
 * Generated fields:
 *  - title, description, keywords
 *  - openGraph  (title, description, type, siteName, url, publishedTime, tags, images)
 *  - alternates (canonical)
 *  - robots     (noindex, nofollow) when the front-matter has `hidden: true`
 */
import matter from "gray-matter";
import { author, site } from "./site.config.mjs";

/**
 * ESTree for a JSON-like value. Object properties set to `undefined` are
 * omitted, which is how optional front-matter fields drop out.
 */
function valueToEstree(value) {
  if (Array.isArray(value)) {
    return { type: "ArrayExpression", elements: value.map(valueToEstree) };
  }
  if (typeof value === "object") {
    return {
      type: "ObjectExpression",
      properties: Object.entries(value)
        .filter(([, val]) => val !== undefined)
        .map(([key, val]) => ({
          type: "Property",
          method: false,
          shorthand: false,
          computed: false,
          key: { type: "Identifier", name: key },
          value: valueToEstree(val),
          kind: "init",
        })),
    };
  }
  return { type: "Literal", value };
}

/** Build a Next.js Metadata object from a post's front-matter. */
function buildMetadata(data, url) {
  const { title, summary: description, tags } = data;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: author.name,
      url,
      publishedTime: new Date(data.date).toISOString(),
      tags,
      // A page-level openGraph replaces the root layout's entirely, so every
      // post sets its own image: the cover if given, else the portrait.
      images: data.cover
        ? [{ url: data.cover, alt: title }]
        : [
            {
              url: author.image.src,
              alt: author.image.alt,
              width: author.image.width,
              height: author.image.height,
            },
          ],
    },
    alternates: { canonical: url },
    // Hidden pages are unlisted everywhere else; keep them out of search results too.
    robots: data.hidden ? { index: false, follow: false } : undefined,
    keywords: tags,
  };
}

export default function remarkNextMetadata() {
  return (tree, vfile) => {
    const slug = vfile.path.match(/src[\\/]app[\\/]blog[\\/]([^\\/]+)[\\/]/)?.[1];
    const yamlIndex = tree.children.findIndex((node) => node.type === "yaml");
    if (!slug || yamlIndex === -1) return;

    const { data } = matter(`---\n${tree.children[yamlIndex].value}\n---`);
    const metadata = buildMetadata(data, `${site.url}/blog/${slug}`);

    /* export const metadata = { … }; right after the YAML node. */
    tree.children.splice(yamlIndex + 1, 0, {
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              source: null,
              specifiers: [],
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "metadata" },
                    init: valueToEstree(metadata),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}
