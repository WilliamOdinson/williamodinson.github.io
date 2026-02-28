/**
 * @module get-posts
 * Reads blog post metadata from the filesystem at build time.
 * Each blog post lives in `src/app/blog/<slug>/page.mdx` with YAML front-matter.
 */

import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

/** Shape of front-matter metadata extracted from a blog MDX file. */
export interface PostMeta {
  slug: string;
  title: string;
  summary: string;
  date: string;      // ISO date string, e.g. "2025-01-15"
  featured: boolean;  // Whether to show on the homepage
}

/**
 * Scan `src/app/blog/` for MDX posts and return their metadata.
 *
 * @param filter - Optional filter; pass `{ featured: true }` to get homepage posts only.
 * @returns Posts sorted by date descending (newest first).
 */
export async function getAllPosts(
  filter?: { featured?: boolean },
): Promise<PostMeta[]> {
  const base = path.join(process.cwd(), "src/app/blog");
  const entries = await fs.readdir(base, { withFileTypes: true });

  const posts = await Promise.all(
    entries
      // Skip non-directory entries and Next.js dynamic route folders like [slug]
      .filter((e) => e.isDirectory() && !e.name.startsWith("["))
      .map(async (dir) => {
        const raw = await fs.readFile(
          path.join(base, dir.name, "page.mdx"),
          "utf8",
        );
        const { data } = matter(raw);

        return {
          slug: dir.name,
          title: data.title as string,
          summary: data.summary as string,
          date: data.date as string,
          featured: Boolean(data.featured),
        } satisfies PostMeta;
      }),
  );

  const filtered =
    filter?.featured !== undefined
      ? posts.filter((p) => p.featured === filter.featured)
      : posts;

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
