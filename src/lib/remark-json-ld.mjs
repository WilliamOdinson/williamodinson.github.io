/**
 * remark-json-ld
 *
 * A remark plugin that reads the YAML front-matter of a blog post
 * (`src/app/blog/<slug>/page.mdx`) and appends a `<JsonLd json="…" />`
 * element to the page body: a schema.org BlogPosting that search engines
 * consume for rich results.
 *
 * Must run AFTER `remark-frontmatter` (which creates the YAML AST node).
 */
import matter from "gray-matter";
import { author, site } from "./site.config.mjs";

export default function remarkJsonLd() {
  return (tree, vfile) => {
    const slug = vfile.path.match(/src[\\/]app[\\/]blog[\\/]([^\\/]+)[\\/]/)?.[1];
    const yamlNode = tree.children.find((n) => n.type === "yaml");
    if (!slug || !yamlNode) return;

    const { data } = matter(`---\n${yamlNode.value}\n---`);

    /* Hidden pages are noindex; structured data would only invite rich results. */
    if (data.hidden) return;

    // Google's Article rich results require `image`; fall back to the portrait.
    const image = data.cover || author.image.src;
    const ld = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: data.title,
      description: data.summary,
      author: { "@type": "Person", name: author.name, url: site.url },
      url: `${site.url}/blog/${slug}`,
      datePublished: new Date(data.date).toISOString().slice(0, 10),
      image: image.startsWith("http") ? image : `${site.url}${image}`,
      keywords: data.tags,
    };

    tree.children.push({
      type: "mdxJsxFlowElement",
      name: "JsonLd",
      attributes: [
        { type: "mdxJsxAttribute", name: "json", value: JSON.stringify(ld) },
      ],
      children: [],
    });
  };
}
