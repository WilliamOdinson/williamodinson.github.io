/**
 * Home: The root page (`/`).
 * Composed of four vertical sections: Hero, About, Projects, and Blog.
 */
import Hero from "@/sections/hero";
import About from "@/sections/about";
import FeaturedProjects from "@/sections/projects";
import RecentPosts from "@/sections/blog-list";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedProjects />
      <RecentPosts />
    </>
  );
}
