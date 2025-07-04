// src/sections/projects.tsx
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

import ProjectsGrid from "@/components/projects-grid";

/**
 * Shape of project metadata coming from front-matter.
 */
export type Project = {
  slug: string;
  title: string;
  description: string;
  stars: number;
  language: string;
  tags: string[];
  featured: boolean;
};

/**
 * Scan every project folder, read its page.mdx front-matter,
 * and keep only items marked as featured.
 * This runs on the server only.
 */
async function getFeaturedProjects(): Promise<Project[]> {
  const baseDir = path.join(process.cwd(), "src/app/projects");
  const dirEntries = await fs.readdir(baseDir, { withFileTypes: true });

  const all = await Promise.all(
    dirEntries
      .filter((d) => d.isDirectory() && !d.name.startsWith("["))
      .map(async (d) => {
        const raw = await fs.readFile(
          path.join(baseDir, d.name, "page.mdx"),
          "utf8",
        );
        const { data } = matter(raw);

        return {
          slug: d.name,
          title: data.repo as string,
          description: data.description as string,
          stars: data.stars as number,
          language: data.language as string,
          tags: Array.isArray(data.tags)
            ? (data.tags as string[])
            : data.tags
              ? [data.tags]
              : [],
          featured: Boolean(data.featured),
        } as Project;
      }),
  );

  return all.filter((p) => p.featured).sort((a, b) => b.stars - a.stars);
}

/**
 * Server component – renders the section shell
 * and passes data to the client-side animated grid.
 */
export default async function FeaturedProjects() {
  const projects = await getFeaturedProjects();

  return (
    <section id="projects" className="my-16 space-y-8">
      <h2 className="text-2xl font-bold dark:text-white">
        Featured Repositories
      </h2>
      <ProjectsGrid items={projects} />
    </section>
  );
}
