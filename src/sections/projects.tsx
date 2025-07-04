import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

import ProjectsGrid from "@/components/projects-grid";

type Project = {
  slug: string;
  title: string;
  description: string;
  stars: number;
  language: string;
};

/**
 * Read project metadata from the file system.
 * Runs only on the server, never in the browser bundle.
 */
async function getProjects(): Promise<Project[]> {
  const base = path.join(process.cwd(), "src/app/projects");
  const entries = await fs.readdir(base, { withFileTypes: true });

  const items = await Promise.all(
    entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("["))
      .map(async (dir) => {
        const raw = await fs.readFile(
          path.join(base, dir.name, "page.mdx"),
          "utf8",
        );
        const { data } = matter(raw);
        return {
          slug: dir.name,
          title: data.repo as string,
          description: data.description as string,
          stars: data.stars as number,
          language: data.language as string,
        };
      }),
  );

  return items.sort((a, b) => b.stars - a.stars);
}

/**
 * Server component. It renders the section shell and
 * delegates the animated grid to the client component.
 */
export default async function FeaturedProjects() {
  const projects = await getProjects();

  return (
    <section id="projects" className="my-16 space-y-8">
      <h2 className="text-2xl font-bold dark:text-white">
        Featured Repositories
      </h2>
      <ProjectsGrid items={projects} />
    </section>
  );
}
