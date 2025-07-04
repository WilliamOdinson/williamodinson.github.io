"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
};

/**
 * Animated vertical list of blog post summaries.
 * Each row appears with a small staggered delay.
 */
export default function PostsList({ items }: { items: Post[] }) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const rowVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 180, damping: 20 },
    },
  };

  return (
    <motion.ul
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {items.map((p) => (
        <motion.li key={p.slug} variants={rowVariants} className="group">
          <Link
            href={`/blog/${p.slug}`}
            className="hover-lift -mx-4 block rounded-lg p-4 transition-all
                       hover:bg-gray-50 dark:hover:bg-gray-700/50"
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
        </motion.li>
      ))}
    </motion.ul>
  );
}
