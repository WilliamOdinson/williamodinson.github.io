"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Project = {
  slug: string;
  title: string;
  description: string;
  stars: number;
  language: string;
};

/**
 * Staggered card grid rendered in the browser.
 * Animation is triggered once when the grid enters the viewport.
 */
export default function ProjectsGrid({ items }: { items: Project[] }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
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
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {items.map((p) => (
        <motion.div key={p.slug} variants={cardVariants}>
          <Link
            href={`/projects/${p.slug}`}
            title={`Visit ${p.title}`}
            className="hover-lift focus-ring group block rounded-lg border border-gray-200
                       bg-white p-4 transition-all duration-200 hover:border-gray-300
                       dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-mono text-lg transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {p.title}
              </h3>
              <span className="font-mono text-xs lowercase dark:text-gray-500">
                {p.stars} <span className="text-xl leading-none">*</span>
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
        </motion.div>
      ))}
    </motion.div>
  );
}
