import { Feed } from "feed";
import { mdxToHtml } from "./mdx-to-html";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-static";
const SITE = "https://williamodinson.github.io";
const BLOG_DIR = path.join(process.cwd(), "src/app/blog");

type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  html: string;
};

async function getAllPosts(): Promise<Post[]> {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });

  const posts = await Promise.all(
    entries
      .filter((d) => d.isDirectory() && !d.name.startsWith("["))
      .map(async (dir) => {
        const fullPath = path.join(BLOG_DIR, dir.name, "page.mdx");
        const raw = await fs.readFile(fullPath, "utf8");

        // Use gray-matter to read front-matter
        const matter = await import("gray-matter");
        const { data } = matter.default(raw);

        return {
          slug: dir.name,
          title: data.title as string,
          summary: data.summary as string,
          date: data.date as string,
          html: await mdxToHtml(raw),
        } as Post;
      }),
  );

  // Newest first
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function GET() {
  const posts = await getAllPosts();

  const feed = new Feed({
    id: SITE,
    link: SITE,
    title: "Blog by William Sun",
    description: "Articles on System Design",
    copyright: "© 2025 Yiqing Sun",
    language: "en",
    updated: new Date(posts[0]?.date ?? Date.now()),
    feedLinks: { rss: `${SITE}/feed.xml` },
    author: { name: "William Sun", link: SITE },
  });

  // Add each post to the feed
  for (const p of posts) {
    const url = `${SITE}/blog/${p.slug}`;
    feed.addItem({
      id: url,
      link: url,
      title: p.title,
      description: p.summary,
      content: p.html,
      date: new Date(p.date),
    });
  }

  feed.options.ttl = 60;

  // Send XML as the response body
  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
