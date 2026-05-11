/**
 * RecentPosts: Homepage section that displays featured blog posts.
 * Server component: fetches posts at build time, then delegates
 * rendering to the client-side animated PostsList component.
 */
import { getAllPosts } from "@/lib/get-posts";
import PostsList from "@/components/posts-list";

export default async function RecentPosts() {
  const posts = await getAllPosts({ featured: true });

  return (
    <section className="my-16 space-y-8">
      <h2 className="mb-6 text-2xl font-bold dark:text-white">Blog Posts</h2>
      <PostsList items={posts} />
    </section>
  );
}
