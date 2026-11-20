/**
 * Sitemap: `/sitemap.xml`, generated at build time from the top-level pages
 * and every listed blog post (see `getAllPosts()` for what is left out).
 */
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/get-posts";
import { site } from "@/lib/site.config.mjs";

export const dynamic = "force-static";

const day = (date: Date) => date.toISOString().slice(0, 10);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const today = day(new Date());

  return [
    { url: site.url, lastModified: today },
    { url: `${site.url}/blog`, lastModified: today },
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: day(p.date),
    })),
  ];
}
