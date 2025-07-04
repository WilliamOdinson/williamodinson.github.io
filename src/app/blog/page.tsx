import { getAllPosts } from "@/lib/get-posts";
import BlogIndex from "@/components/blog-index";

export const metadata = {
  title: "Blog By William Sun",
  description: "Articles on System Design. Search by title or summary.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-[700px] px-4 pb-24 pt-20 ring-offset-primary md:px-6 md:pb-44">
      <BlogIndex posts={posts} />
    </div>
  );
}
