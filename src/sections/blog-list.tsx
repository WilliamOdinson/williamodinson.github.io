import Link from "next/link";
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

async function getPosts() {
  const base = path.join(process.cwd(), "src/app/blog");
  const entries = await fs.readdir(base, { withFileTypes: true });

  const posts = await Promise.all(
    entries
      .filter((e) => e.isDirectory())
      .map(async (dir) => {
        const raw = await fs.readFile(
          path.join(base, dir.name, "page.mdx"),
          "utf8",
        );
        const { data } = matter(raw);
        return {
          slug: dir.name,
          title: data.title as string,
          summary: data.summary as string,
          date: data.date as string,
        };
      }),
  );

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export default async function RecentPosts() {
  const posts = await getPosts();

  return (
    <section className="my-16 space-y-8">
      <h2 className="mb-6 text-2xl font-bold dark:text-white">Blog Posts</h2>
      <div className="space-y-6">
        {posts.map((p) => (
          <article key={p.slug} className="group">
            <Link
              href={`/blog/${p.slug}`}
              className="hover-lift -mx-4 block rounded-lg p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-start gap-4">
                <time className="w-30 mt-1 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  }).format(new Date(p.date))}
                </time>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-gray-600 dark:text-gray-400">
                    {p.summary}
                  </p>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
