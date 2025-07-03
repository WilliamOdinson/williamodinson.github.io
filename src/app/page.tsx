import Hero from "@/sections/hero";
import About from "@/sections/about";
import FeaturedProjects from "@/sections/projects";
import RecentPosts from "@/sections/blog-list";
import Contact from "@/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedProjects />
      <RecentPosts />
      <Contact />
    </>
  );
}
