import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE = "https://williamodinson.github.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Homepage and top-level static routes
  const topLevel = ["", "/projects", "/blog"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date().toISOString(),
  }));

  // helper: convert MDX files in a given directory into sitemap entries
  async function collect(dir: string, prefix: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return Promise.all(
      entries
        .filter((e) => e.isDirectory() && !e.name.startsWith("["))
        .map(async (folder) => {
          const raw = await fs.readFile(
            path.join(dir, folder.name, "page.mdx"),
            "utf8",
          );
          const { data } = matter(raw);
          // Accept either date or lastModified; fallback to current time if missing
          const last = data.date ?? data.lastModified ?? Date.now();
          return {
            url: `${BASE}${prefix}/${folder.name}`,
            lastModified: new Date(last).toISOString(),
          };
        }),
    );
  }

  const blog = await collect(path.join(process.cwd(), "src/app/blog"), "/blog");
  const proj = await collect(
    path.join(process.cwd(), "src/app/projects"),
    "/projects",
  );

  return [...topLevel, ...blog, ...proj];
}
