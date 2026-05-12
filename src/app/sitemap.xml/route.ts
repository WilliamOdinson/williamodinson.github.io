/**
 * Sitemap Route: Generates `/sitemap.xml` at build time.
 *
 * Collects static top-level pages (/, /blog) and dynamic blog posts
 * (from `src/app/blog/<slug>/page.mdx`).
 */
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";

export const dynamic = "force-static";

const BASE = "https://wsun.io";

/** A single `<url>` entry in the sitemap. */
type UrlEntry = {
  loc: string;
  lastmod: string;   // YYYY-MM-DD
};

/**
 * Scan a directory for MDX page folders and return sitemap entries.
 *
 * @param dir    - Absolute path to the parent directory (e.g. `src/app/blog`).
 * @param prefix - URL prefix (e.g. `/blog`).
 */
async function collect(dir: string, prefix: string): Promise<UrlEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  return Promise.all(
    entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("["))
      .map(async (folder) => {
        const mdxPath = path.join(dir, folder.name, "page.mdx");
        const raw = await fs.readFile(mdxPath, "utf8");

        // Use front-matter date or file mtime as lastmod
        const { data } = matter(raw);
        const stat = await fs.stat(mdxPath);
        const dateStr = new Date(data.date ?? data.lastModified ?? stat.mtime)
          .toISOString()
          .slice(0, 10);

        return {
          loc: `${BASE}${prefix}/${folder.name}`,
          lastmod: dateStr,
        };
      }),
  );
}

export async function GET() {
  // Collect dynamic content pages
  const blog = await collect(path.join(process.cwd(), "src/app/blog"), "/blog");

  // Static top-level pages (use today's date as lastmod)
  const today = new Date().toISOString().slice(0, 10);
  const topLevel: UrlEntry[] = [
    { loc: BASE, lastmod: today },
    { loc: `${BASE}/blog`, lastmod: today },
  ];

  const urls = [...topLevel, ...blog]
    .map(
      ({ loc, lastmod }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
