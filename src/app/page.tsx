/**
 * Home: The root page (`/`).
 * Composed of three vertical sections: Hero, About, and Blog.
 */
import Hero from "@/sections/hero";
import About from "@/sections/about";
import RecentPosts from "@/sections/blog-list";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <RecentPosts />
    </>
  );
}
