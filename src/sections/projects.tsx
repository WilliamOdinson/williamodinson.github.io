// src/sections/projects.tsx
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

import ProjectsGrid from "@/components/projects-grid";

/**
 * Project metadata shape coming from front-matter.
 */
export type Project = {
  slug: string;
  title: string;
  description: string;
  stars: number;
  tags: string[];
};

/**
 * Read every project folder's page.mdx and extract its front-matter.
 * Runs only on the server during the build / request.
 */
async function getProjects(): Promise<Project[]> {
  const base = path.join(process.cwd(), "src/app/projects");
  const entries = await fs.readdir(base, { withFileTypes: true });

  const items = await Promise.all(
    entries
      .filter((dir) => dir.isDirectory() && !dir.name.startsWith("["))
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
          tags: Array.isArray(data.tags) ? data.tags : [data.tags].filter(Boolean),
        };
      }),
  );

  // sort by GitHub stars, descending
  return items.sort((a, b) => b.stars - a.stars);
}

/**
 * Server component - shells the section and leaves all animation
 * to the client-side <ProjectsGrid/>.
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
