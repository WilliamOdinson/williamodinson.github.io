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
import { author, site, rss as rssConfig } from "@/lib/site.config.mjs";

export const dynamic = "force-static";

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
    id: site.url,
    link: site.url,
    title: rssConfig.title,
    description: rssConfig.description,
    copyright: `© ${new Date().getFullYear()} ${author.name}`,
    language: site.language,
    updated: new Date(posts[0]?.date ?? Date.now()),
    feedLinks: { rss: `${site.url}/feed.xml` },
    author: { name: author.name, link: site.url },
  });

  for (const p of posts) {
    const url = `${site.url}/blog/${p.slug}`;
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
