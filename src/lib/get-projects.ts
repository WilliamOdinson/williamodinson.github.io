import matter from "gray-matter";
import { promises as fs } from "fs";
import path from "path";

export interface ProjectMeta {
  slug: string;
  title: string;
  description: string;
  stars: number;
  language: string;
  tags: string[];
  cover: string;
  period: { start: string; end?: string };
}

export async function getAllProjects(): Promise<ProjectMeta[]> {
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
          period: {
            start: data.period?.start as string,
            end: data.period?.end as string | undefined,
          },
        } satisfies ProjectMeta;
      }),
  );

  /* Sort by period.end, newest first */
  return projects.sort((a, b) => {
    const dateA = new Date(a.period.end ?? a.period.start).getTime();
    const dateB = new Date(b.period.end ?? b.period.start).getTime();
    return dateB - dateA;
  });
}
