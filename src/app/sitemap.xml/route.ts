import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import crypto from "crypto";

export const dynamic = "force-static";

const BASE = "https://williamodinson.github.io";

/** Unified object type used for every <url> entry */
type UrlEntry = {
  loc: string;
  lastmod: string; // YYYY-MM-DD
  sha?: string; // present only for MDX pages
};

/**
 * Collect every folder in dir that owns a page.mdx file.
 */
async function collect(dir: string, prefix: string): Promise<UrlEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  return Promise.all(
    entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("["))
      .map(async (folder) => {
        const mdxPath = path.join(dir, folder.name, "page.mdx");
        const raw = await fs.readFile(mdxPath, "utf8");

        // date from front-matter or file mtime
        const { data } = matter(raw);
        const stat = await fs.stat(mdxPath);
        const dateStr = new Date(data.date ?? data.lastModified ?? stat.mtime)
          .toISOString()
          .slice(0, 10);

        const sha = crypto
          .createHash("sha256")
          .update(raw)
          .digest("hex")
          .slice(0, 10);

        return {
          loc: `${BASE}${prefix}/${folder.name}`,
          lastmod: dateStr,
          sha,
        };
      }),
  );
}
/**
 * Generates a sitemap.xml for the site.
 */
export async function GET() {
  // dynamic collections
  const blog = await collect(path.join(process.cwd(), "src/app/blog"), "/blog");
  const projects = await collect(
    path.join(process.cwd(), "src/app/projects"),
    "/projects",
  );

  // static top-level pages
  const today = new Date().toISOString().slice(0, 10);
  const topLevel: UrlEntry[] = [
    { loc: BASE, lastmod: today },
    { loc: `${BASE}/projects`, lastmod: today },
    { loc: `${BASE}/blog`, lastmod: today },
  ];

  const urls = [...topLevel, ...blog, ...projects]
    .map(
      ({ loc, lastmod, sha }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>${
      sha ? `\n    <xhash:sha256>${sha}</xhash:sha256>` : ""
    }
  </url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhash="https://williamodinson.github.io/ns/hash">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
