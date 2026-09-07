/**
 * RecentPosts: Homepage section that displays featured blog posts.
 * Server component: fetches posts at build time, then delegates
 * rendering to the client-side animated PostsList component.
 */
import { getAllPosts } from "@/lib/get-posts";
import PostsList from "@/components/posts-list";
import MotionDiv from "@/components/motion-div";

export default async function RecentPosts() {
  const posts = await getAllPosts({ featured: true });

  return (
    <section id="blog-posts" className="my-16 md:my-20">
      <MotionDiv delayOffset={0.2} className="justify-start">
        <h2 className="mb-6 dark:text-white">Blog Posts</h2>
      </MotionDiv>
      <PostsList items={posts} />
    </section>
  );
}
