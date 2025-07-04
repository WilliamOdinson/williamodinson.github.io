import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

import PostsList from "@/components/posts-list";

type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
};

/**
 * Read blog post front-matter from the file system.
 */
async function getPosts(): Promise<Post[]> {
  const base = path.join(process.cwd(), "src/app/blog");
  const entries = await fs.readdir(base, { withFileTypes: true });

  const posts = await Promise.all(
    entries
      .filter((e) => e.isDirectory())
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
        };
      }),
  );

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

/**
 * Server component wrapping the animated list.
 */
export default async function RecentPosts() {
  const posts = await getPosts();

  return (
    <section className="my-16 space-y-8">
      <h2 className="mb-6 text-2xl font-bold dark:text-white">Blog Posts</h2>
      <PostsList items={posts} />
    </section>
  );
}
