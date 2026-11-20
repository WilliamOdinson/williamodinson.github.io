/**
 * BlogPage: Index page for `/blog`.
 * Fetches all posts at build time and passes them to the client-side
 * BlogIndex component which provides search and animated listing.
 */
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/get-posts";
import BlogIndex from "@/components/blog-index";
import { author } from "@/lib/site.config.mjs";

const title = "Blog By William Sun";
const description =
  "Articles on Software Engineering, AI, etc. Search by title or summary.";

/*
 * Nested metadata objects replace the root layout's instead of merging with
 * it, so this page sets its own canonical URL and complete Open Graph object.
 */
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title,
    description,
    url: "/blog",
    type: "website",
    images: [
      {
        url: author.image.src,
        alt: author.image.alt,
        width: author.image.width,
        height: author.image.height,
      },
    ],
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <section className="px-4 py-16">
      <h1 className="mb-12 text-3xl font-bold dark:text-white">Blog</h1>
      <BlogIndex posts={posts} />
    </section>
  );
}
