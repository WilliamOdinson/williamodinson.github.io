"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MdStar } from "react-icons/md";

import type { Project } from "@/sections/projects";

/**
 * Stagger-animated grid that shows each card with a smooth spring-in effect.
 */
export default function ProjectsGrid({ items }: { items: Project[] }) {
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
            className="hover-lift focus-ring group block rounded-lg border border-gray-200
                       bg-white p-4 transition-all duration-200 hover:border-gray-300
                       dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
          >
            {/* title + stars */}
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-mono text-lg transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {p.title}
              </h3>

              {/* star counter with Material icon */}
              <span className="flex items-center gap-1 text-xs dark:text-gray-500">
                {p.stars}
                <MdStar className="h-4 w-4 fill-yellow-400" />
              </span>
            </div>

            {/* description */}
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {p.description}
            </p>

            {/* tag badge */}
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((tag, i) => (
                <span key={i} className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
