/**
 * @module get-posts
 * Reads blog post metadata from the filesystem at build time.
 * Each blog post lives in `src/app/blog/<slug>/page.mdx` with YAML front-matter.
 */

import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

export const BLOG_DIR = path.join(process.cwd(), "src/app/blog");

/** Shape of front-matter metadata extracted from a blog MDX file. */
export interface PostMeta {
  slug: string;
  title: string;
  summary: string;
  /** Front-matter `date` (YYYY-MM-DD), as UTC midnight. */
  date: Date;
  /** Shown in the homepage "Blog Posts" section. */
  featured: boolean;
}

/**
 * Scan `src/app/blog/` for MDX posts and return their metadata, newest first.
 *
 * Posts with `hidden: true` in their front-matter are left out, so they never
 * reach the blog index, the homepage, the RSS feed or the sitemap. Their pages
 * are still built and reachable by URL, marked noindex by
 * `remark-next-metadata`. Folders starting with `_` are Next.js private
 * folders: they have no route and are skipped as well.
 */
export async function getAllPosts(): Promise<PostMeta[]> {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });

  const scanned = await Promise.all(
    entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
      .map(async (dir) => {
        const raw = await fs.readFile(
          path.join(BLOG_DIR, dir.name, "page.mdx"),
          "utf8",
        );
        const { data } = matter(raw);
        if (data.hidden) return null;

        return {
          slug: dir.name,
          title: data.title,
          summary: data.summary,
          date: new Date(data.date),
          featured: Boolean(data.featured),
        } satisfies PostMeta;
      }),
  );

  return scanned
    .filter((p) => p !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
