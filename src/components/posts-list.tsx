/**
 * PostsList: Animated vertical list of blog post summary cards.
 * Used on the homepage to display featured/recent posts.
 * Each row reveals with a staggered spring animation when scrolled into view.
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Post = {
  slug: string;
  title: string;
  summary: string;
  date: string;
};

/** Stagger timing for the list container. */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

/** Slide-up animation for each individual row. */
const rowVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
};

export default function PostsList({ items }: { items: Post[] }) {
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
                       hover:bg-secondary"
          >
            <div className="flex items-start gap-4">
              <time className="w-30 mt-1 flex-shrink-0 text-sm text-muted-foreground">
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
                <p className="mt-2 line-clamp-2 text-muted-foreground">
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
