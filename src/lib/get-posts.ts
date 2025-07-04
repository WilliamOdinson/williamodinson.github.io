import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

export interface PostMeta {
  slug: string;
  title: string;
  summary: string;
  date: string;
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const base = path.join(process.cwd(), "src/app/blog");
  const entries = await fs.readdir(base, { withFileTypes: true });

  const posts = await Promise.all(
    entries
      // ignore directories that start with "[", which are dynamic routes
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
        } satisfies PostMeta;
      }),
  );

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
