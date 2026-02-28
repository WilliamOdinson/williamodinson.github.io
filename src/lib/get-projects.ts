/**
 * @module get-projects
 * Reads project metadata from the filesystem at build time.
 * Each project lives in `src/app/projects/<slug>/page.mdx` with YAML front-matter.
 */

import matter from "gray-matter";
import { promises as fs } from "fs";
import path from "path";

/** Shape of front-matter metadata extracted from a project MDX file. */
export interface ProjectMeta {
  slug: string;
  title: string;        // GitHub repo path, e.g. "WilliamOdinson/Gastronome"
  description: string;
  stars: number;
  language: string;
  tags: string[];
  cover: string;         // URL or relative path to the cover image
  featured: boolean;
  period: {
    start: string;       // ISO date string
    end?: string;        // Omitted if the project is ongoing
  };
}

/**
 * Subset of ProjectMeta fields consumed by grid/card components.
 * Defined here to avoid components importing from section-level modules.
 */
export type ProjectSummary = Pick<
  ProjectMeta,
  "slug" | "title" | "description" | "stars" | "language" | "tags"
>;

/**
 * Scan `src/app/projects/` for MDX files and return their metadata.
 *
 * @param filter - Optional filter; pass `{ featured: true }` for homepage projects.
 * @returns Projects sorted by end date descending (most recent first).
 */
export async function getAllProjects(
  filter?: { featured?: boolean },
): Promise<ProjectMeta[]> {
  const base = path.join(process.cwd(), "src/app/projects");
  const entries = await fs.readdir(base, { withFileTypes: true });

  const projects = await Promise.all(
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
          tags: Array.isArray(data.tags)
            ? (data.tags as string[])
            : data.tags
              ? [data.tags]
              : [],
          cover: data.cover as string,
          featured: Boolean(data.featured),
          period: {
            start: data.period?.start as string,
            end: data.period?.end as string | undefined,
          },
        } satisfies ProjectMeta;
      }),
  );

  const filtered =
    filter?.featured !== undefined
      ? projects.filter((p) => p.featured === filter.featured)
      : projects;

  // Sort by end date (or start if still ongoing), newest first
  return filtered.sort((a, b) => {
    const dateA = new Date(a.period.end ?? a.period.start).getTime();
    const dateB = new Date(b.period.end ?? b.period.start).getTime();
    return dateB - dateA;
  });
}
