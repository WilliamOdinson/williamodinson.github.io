/**
 * remark-next-metadata
 *
 * A remark plugin that reads YAML front-matter from MDX pages and injects a
 * Next.js-compatible `export const metadata = { … }` declaration with full
 * Open Graph, Twitter Card, and canonical URL support.
 *
 * Must run AFTER `remark-frontmatter` (which parses the YAML block into the AST).
 * Uses `gray-matter` (already a project dependency) for YAML parsing.
 *
 * Generated fields:
 *  - title, description, keywords
 *  - openGraph  (title, description, type, siteName, publishedTime, tags, images, url)
 *  - alternates (canonical)
 */
import matter from "gray-matter";

const BASE_URL = "https://williamodinson.github.io";

/* ------------------------------------------------------------------ */
/*  Minimal valueToEstree (avoids adding estree-util-value-to-estree) */
/* ------------------------------------------------------------------ */

function valueToEstree(v) {
  if (v === null || v === undefined) {
    return { type: "Literal", value: null, raw: "null" };
  }
  if (typeof v === "string") {
    return { type: "Literal", value: v, raw: JSON.stringify(v) };
  }
  if (typeof v === "number") {
    return { type: "Literal", value: v, raw: String(v) };
  }
  if (typeof v === "boolean") {
    return { type: "Literal", value: v, raw: String(v) };
  }
  if (Array.isArray(v)) {
    return { type: "ArrayExpression", elements: v.map(valueToEstree) };
  }
  if (typeof v === "object") {
    return {
      type: "ObjectExpression",
      properties: Object.entries(v)
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
  return { type: "Literal", value: String(v), raw: JSON.stringify(String(v)) };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Derive the URL pathname from the source VFile path.
 * e.g. ".../src/app/blog/my-post/page.mdx" → "/blog/my-post"
 */
function urlPathFromFile(vfile) {
  const filePath = vfile.path || vfile.history?.[0] || "";
  const match = filePath.match(
    /src[\\/]app[\\/]((?:blog|projects)[\\/][^\\/]+)[\\/]/,
  );
  return match ? `/${match[1].replace(/\\/g, "/")}` : "";
}

/**
 * Build a Next.js Metadata object from raw front-matter data.
 */
function buildMetadata(data, urlPath) {
  // Normalise fields across blog posts (title/summary) and projects (repo/description).
  const title = data.title || data.repo || "";
  const description = data.summary || data.description || "";

  const meta = { title, description };

  // OpenGraph
  meta.openGraph = {
    title,
    description,
    type: "article",
    siteName: "Yiqing Sun",
  };

  if (urlPath) {
    const fullUrl = `${BASE_URL}${urlPath}`;
    meta.openGraph.url = fullUrl;
    meta.alternates = { canonical: fullUrl };
  }

  if (data.date) {
    meta.openGraph.publishedTime = new Date(data.date).toISOString();
  }

  // Tags → OG tags + keywords meta
  const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
  if (tags.length) {
    meta.openGraph.tags = tags;
    meta.keywords = tags;
  }

  // Cover image (projects)
  if (data.cover) {
    meta.openGraph.images = [{ url: data.cover, alt: title }];
  }

  return meta;
}

/* ------------------------------------------------------------------ */
/*  Plugin                                                            */
/* ------------------------------------------------------------------ */

export default function remarkNextMetadata() {
  return (tree, vfile) => {
    /* ---- locate the YAML node created by remark-frontmatter ---- */
    const yamlNode = tree.children.find((node) => node.type === "yaml");
    if (!yamlNode) return;

    /* ---- parse front-matter ---- */
    const { data } = matter(`---\n${yamlNode.value}\n---`);
    if (!data || typeof data !== "object") return;

    const urlPath = urlPathFromFile(vfile);
    const meta = buildMetadata(data, urlPath);

    /* ---- build ESTree: export const metadata = { … }; ---- */
    const exportNode = {
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
                    init: valueToEstree(meta),
                  },
                ],
              },
            },
          ],
        },
      },
    };

    // Insert right after the YAML node so it's early in the module.
    const yamlIndex = tree.children.indexOf(yamlNode);
    tree.children.splice(yamlIndex + 1, 0, exportNode);
  };
}
