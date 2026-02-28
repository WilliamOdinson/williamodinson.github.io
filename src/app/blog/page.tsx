/**
 * BlogPage: Index page for `/blog`.
 * Fetches all posts at build time and passes them to the client-side
 * BlogIndex component which provides search and animated listing.
 */
import { getAllPosts } from "@/lib/get-posts";
import BlogIndex from "@/components/blog-index";

export const metadata = {
  title: "Blog By William Sun",
  description: "Articles on System Design. Search by title or summary.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 lg:px-28">
      <h1 className="mb-12 text-3xl font-bold dark:text-white">Blog</h1>
      <BlogIndex posts={posts} />
    </section>
  );
}
