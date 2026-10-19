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
 *  - robots     (noindex, nofollow) when the front-matter has `hidden: true`
 *
 * Pages under /sale/ are second-hand listings: their front-matter goes through
 * `normalizeSaleItem` (so the build fails on a bad listing) and the description
 * and cover come from the item when the front-matter has none of its own.
 */
import matter from "gray-matter";
import { author, site } from "./site.config.mjs";
import { describeSaleItem, normalizeSaleItem } from "./sale.mjs";
import { valueToEstree } from "./mdx-estree.mjs";

const BASE_URL = site.url;

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
    /src[\\/]app[\\/]((?:blog|projects|sale)[\\/][^\\/]+)[\\/]/,
  );
  return match ? `/${match[1].replace(/\\/g, "/")}` : "";
}

/** The portrait, used as og:image wherever a page has no cover of its own. */
function portraitImage() {
  return {
    url: author.image.src,
    alt: author.image.alt,
    width: author.image.width,
    height: author.image.height,
  };
}

/**
 * Metadata for a second-hand listing under /sale/. Link previews in chat apps
 * show title, description and image, so the description carries the condition
 * and price when the front-matter has no `summary`.
 */
function saleMetadata(data, urlPath) {
  const item = normalizeSaleItem(data, urlPath.slice("/sale/".length));
  const title = item.title;
  const description = item.summary || describeSaleItem(item);
  const fullUrl = `${BASE_URL}${urlPath}`;
  const cover = item.images[0];

  const meta = {
    title,
    description,
    alternates: { canonical: fullUrl },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: author.name,
      url: fullUrl,
      images: cover ? [{ url: cover, alt: title }] : [portraitImage()],
    },
  };

  // A hidden item stays out of search. The section-wide switch (`sale.hidden`)
  // is applied by src/app/sale/layout.tsx, where the build tracks the config.
  if (item.hidden) {
    meta.robots = { index: false, follow: false };
  }

  return meta;
}

/**
 * Build a Next.js Metadata object from raw front-matter data.
 */
function buildMetadata(data, urlPath) {
  if (urlPath.startsWith("/sale/")) return saleMetadata(data, urlPath);

  // Normalise fields across blog posts (title/summary) and projects (repo/description).
  const title = data.title || data.repo || "";
  const description = data.summary || data.description || "";

  const meta = { title, description };

  // OpenGraph
  meta.openGraph = {
    title,
    description,
    type: "article",
    siteName: author.name,
  };

  if (urlPath) {
    const fullUrl = `${BASE_URL}${urlPath}`;
    meta.openGraph.url = fullUrl;
    meta.alternates = { canonical: fullUrl };
  }

  if (data.date) {
    meta.openGraph.publishedTime = new Date(data.date).toISOString();
  }

  // Hidden pages are unlisted everywhere else; keep them out of search results too.
  if (data.hidden) {
    meta.robots = { index: false, follow: false };
  }

  // Tags → OG tags + keywords meta
  const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
  if (tags.length) {
    meta.openGraph.tags = tags;
    meta.keywords = tags;
  }

  // Cover image, falling back to the portrait. A page-level `openGraph` replaces
  // the root layout's object entirely, so without a fallback posts would ship
  // with no og:image at all and social cards would render without a preview.
  meta.openGraph.images = data.cover
    ? [{ url: data.cover, alt: title }]
    : [portraitImage()];

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
