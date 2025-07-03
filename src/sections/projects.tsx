import Link from "next/link";
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

async function getProjects() {
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

export default async function FeaturedProjects() {
  const projects = await getProjects();

  return (
    <section id="projects" className="my-16 space-y-8">
      <h2 className="text-2xl font-bold dark:text-white">
        Featured Repositories
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            title={`Visit ${p.title}`}
            className="hover-lift focus-ring group block rounded-lg border border-gray-200 bg-white p-4
                       transition-all duration-200 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900
                       dark:hover:border-gray-600"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-mono text-lg transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {p.title}
              </h3>
              <span className="font-mono text-xs lowercase dark:text-gray-500">
                {p.stars} <span className="text-xl leading-none">☆</span>
              </span>
            </div>

            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {p.description}
            </p>

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">
                  {p.language}
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
