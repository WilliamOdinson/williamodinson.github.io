import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

import PostsList from "@/components/posts-list";

type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  featured: boolean;
};

/**
 * Read blog post front-matter and keep only items with `featured: true`.
 */
async function getFeaturedPosts(): Promise<Post[]> {
  const baseDir = path.join(process.cwd(), "src/app/blog");
  const dirEntries = await fs.readdir(baseDir, { withFileTypes: true });

  const all = await Promise.all(
    dirEntries
      .filter((e) => e.isDirectory() && !e.name.startsWith("["))
      .map(async (folder) => {
        const raw = await fs.readFile(
          path.join(baseDir, folder.name, "page.mdx"),
          "utf8",
        );
        const { data } = matter(raw);
        return {
          slug: folder.name,
          title: data.title as string,
          summary: data.summary as string,
          date: data.date as string,
          featured: Boolean(data.featured),
        } as Post;
      }),
  );

  return all
    .filter((p) => p.featured)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

/**
 * Server component: renders the blog section header
 * and passes the data to the client-side animated list.
 */
export default async function RecentPosts() {
  const posts = await getFeaturedPosts();

  return (
    <section className="my-16 space-y-8">
      <h2 className="mb-6 text-2xl font-bold dark:text-white">Blog Posts</h2>
      <PostsList items={posts} />
    </section>
  );
}
