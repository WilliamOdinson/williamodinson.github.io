/**
 * remark-json-ld
 *
 * A remark plugin that reads YAML front-matter from MDX pages and injects
 * a `<JsonLd json="…" />` element into the page body, producing structured
 * data that search engines consume for rich results.
 *
 * Generated schemas:
 *  - BlogPosting         — for pages under /blog/
 *  - SoftwareSourceCode  — for pages under /projects/
 *
 * Must run AFTER `remark-frontmatter` (which creates the YAML AST node).
 * Uses `gray-matter` for YAML parsing (already a project dependency).
 */
import matter from "gray-matter";
import { author, site } from "./site.config.mjs";

const BASE_URL = site.url;

const AUTHOR = {
  "@type": "Person",
  name: author.name,
  url: BASE_URL,
};

/**
 * Resolve the URL pathname and content section from the source VFile.
 */
function resolveFile(vfile) {
  const filePath = vfile.path || vfile.history?.[0] || "";
  const match = filePath.match(
    /src[\\/]app[\\/]((blog|projects)[\\/][^\\/]+)[\\/]/,
  );
  if (!match) return { urlPath: "", section: "" };
  return {
    urlPath: `/${match[1].replace(/\\/g, "/")}`,
    section: match[2], // "blog" | "projects"
  };
}

/**
 * Build a schema.org BlogPosting object.
 */
function blogPosting(data, url) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.title,
    description: data.summary || "",
    author: AUTHOR,
    url,
  };
  if (data.date) {
    ld.datePublished = new Date(data.date).toISOString().slice(0, 10);
  }
  const tags = Array.isArray(data.tags) ? data.tags : [];
  if (tags.length) ld.keywords = tags;
  return ld;
}

/**
 * Build a schema.org SoftwareSourceCode object.
 */
function softwareSourceCode(data, url) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: data.repo || data.title || "",
    description: data.description || "",
    author: AUTHOR,
    url,
  };
  if (data.repo) {
    ld.codeRepository = `https://github.com/${data.repo}`;
  }
  if (data.cover) {
    ld.image = data.cover.startsWith("http")
      ? data.cover
      : `${BASE_URL}${data.cover}`;
  }
  const tags = Array.isArray(data.tags) ? data.tags : [];
  if (tags.length) ld.keywords = tags;
  if (data.language) ld.programmingLanguage = data.language;
  return ld;
}

export default function remarkJsonLd() {
  return (tree, vfile) => {
    /* ---- locate the YAML node created by remark-frontmatter ---- */
    const yamlNode = tree.children.find((n) => n.type === "yaml");
    if (!yamlNode) return;

    /* ---- parse front-matter via gray-matter ---- */
    const { data } = matter(`---\n${yamlNode.value}\n---`);
    if (!data || typeof data !== "object") return;

    const { urlPath, section } = resolveFile(vfile);
    if (!section) return;

    const fullUrl = `${BASE_URL}${urlPath}`;

    /* ---- select the appropriate schema ---- */
    let ld;
    if (section === "blog") {
      ld = blogPosting(data, fullUrl);
    } else if (section === "projects") {
      ld = softwareSourceCode(data, fullUrl);
    } else {
      return;
    }

    /* ---- inject <JsonLd json="…" /> as an MDX JSX element ---- */
    tree.children.push({
      type: "mdxJsxFlowElement",
      name: "JsonLd",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "json",
          value: JSON.stringify(ld),
        },
      ],
      children: [],
    });
  };
}
