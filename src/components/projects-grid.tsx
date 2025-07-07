"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MdStar } from "react-icons/md";
import type { Project } from "@/sections/projects";

/**
 * Animated card grid that displays a list of featured projects.
 */
export default function ProjectsGrid({ items }: { items: Project[] }) {
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const card = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 24 },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {items.map((p) => (
        <motion.div key={p.slug} variants={card}>
          <Link
            href={`/projects/${p.slug}`}
            title={`Visit ${p.title}`}
            className="hover-lift focus-ring group block rounded-lg border border-border
                       bg-card p-4 transition-all duration-200
                       hover:border-muted"
          >
            {/* title + stars */}
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-mono text-lg transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {p.title}
              </h3>

              {/* star counter with Material icon */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {p.stars}
                <MdStar className="h-4 w-4 fill-yellow-400" />
              </span>
            </div>

            {/* description */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {p.description}
            </p>

            {/* tag badge */}
            {p.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
