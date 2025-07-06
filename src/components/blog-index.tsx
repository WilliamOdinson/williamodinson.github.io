"use client";

import { useState, useMemo } from "react";
import { PostMeta } from "@/lib/get-posts";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlogIndex({ posts }: { posts: PostMeta[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      posts.filter((p) =>
        `${p.title} ${p.summary}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, posts],
  );

  /* animation presets */
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 180, damping: 20 },
    },
  };

  return (
    <section className="space-y-8">
      {/* heading + search */}
      <header className="space-y-4">
        <p className="text-muted-foreground">
          Articles on System Design. Search by title or summary.
        </p>
        <label
          htmlFor="search"
          className={cn(
            "flex w-fit items-center gap-2 rounded-full bg-secondary px-2 focus-within:outline",
          )}
        >
          <Search className="h-5 w-5 shrink-0 text-secondary" />
          <input
            id="search"
            type="search"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 bg-transparent pr-4 outline-none placeholder:text-secondary"
          />
        </label>
      </header>

      {/* list without bullets or lift effect */}
      <motion.ul
        variants={container}
        initial="hidden"
        animate="visible"
        className="animated-list flex list-none flex-col"
      >
        {filtered.map((p) => (
          <motion.li key={p.slug} variants={item} className="py-2.5">
            <section className="flex flex-col gap-1 md:flex-row md:gap-9">
              <time className="shrink-0 text-sm text-muted-foreground md:w-40 md:text-base">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }).format(new Date(p.date))}
              </time>
              <Link
                href={`/blog/${p.slug}`}
                className="text-base no-underline transition-colors hover:text-blue-600 dark:text-white
                dark:hover:text-blue-400 md:text-base md:text-lg"
              >
                {p.title}
              </Link>
            </section>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
