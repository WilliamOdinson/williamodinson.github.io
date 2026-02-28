/**
 * RSS Feed Route: Generates `/feed.xml` at build time.
 *
 * Reuses `getAllPosts()` from the shared lib for metadata, then reads
 * each MDX file to convert its content to HTML for the feed body.
 */
import { Feed } from "feed";
import { mdxToHtml } from "./mdx-to-html";
import { getAllPosts } from "@/lib/get-posts";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-static";

const SITE = "https://williamodinson.github.io";
const BLOG_DIR = path.join(process.cwd(), "src/app/blog");

export async function GET() {
  const postMetas = await getAllPosts();

  /* Enrich each post with its full HTML content for the RSS body. */
  const posts = await Promise.all(
    postMetas.map(async (meta) => {
      const raw = await fs.readFile(
        path.join(BLOG_DIR, meta.slug, "page.mdx"),
        "utf8",
      );
      return { ...meta, html: await mdxToHtml(raw) };
    }),
  );

  const feed = new Feed({
    id: SITE,
    link: SITE,
    title: "Blog by William Sun",
    description: "Articles on Software Engineering, AI, etc.",
    copyright: "© 2026 Yiqing Sun",
    language: "en",
    updated: new Date(posts[0]?.date ?? Date.now()),
    feedLinks: { rss: `${SITE}/feed.xml` },
    author: { name: "William Sun", link: SITE },
  });

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

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
