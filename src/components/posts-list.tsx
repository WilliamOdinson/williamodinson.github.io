/**
 * PostsList: Ledger-style list of featured blog posts for the homepage.
 * Each row shows the post date, title, and a two-line summary and links to
 * the post. On `md+` the list is a two-column grid (date | content) and every
 * row is a CSS subgrid, so the date column is sized once by the widest date
 * and shared by all rows. Below `md`, the date stacks above the title.
 *
 * Rows reveal with a staggered spring animation when scrolled into view.
 * Hover uses the site's existing link vocabulary: the row takes the same
 * `bg-secondary` surface as the contact icons and ghost buttons, and the
 * title turns blue like the titles on the blog index.
 */
"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type Post = {
  slug: string;
  title: string;
  summary: string;
  /** ISO date or a Date serialized by RSC; always passed through `new Date()`. */
  date: string;
};

/**
 * Cached formatter for "Month DD, YYYY" style dates.
 * Front-matter dates are day-precision and parsed as UTC midnight, so the
 * formatter is pinned to UTC. Without this, readers west of UTC would see
 * the previous day, and the client would disagree with the prerendered HTML.
 */
const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "2-digit",
  timeZone: "UTC",
});

/** Stagger timing for the list container. */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

/** Slide-up animation for each individual row. */
const rowVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
};

/** Makes an element span, and inherit, the two-column track of the list. */
const subgrid = "md:col-span-2 md:grid md:grid-cols-subgrid";

export default function PostsList({ items }: { items: Post[] }) {
  return (
    <motion.ul
      className="grid grid-cols-1 gap-y-2 md:grid-cols-[max-content_1fr] md:gap-x-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {items.map((p) => {
        const date = new Date(p.date);
        /* Guard against malformed front-matter: Intl.format throws on Invalid Date. */
        const isValidDate = !Number.isNaN(date.getTime());

        return (
          <motion.li key={p.slug} variants={rowVariants} className={subgrid}>
            <Link
              href={`/blog/${p.slug}`}
              className={cn(
                subgrid,
                /* Bleed the hover surface 1rem past the text edge on both sides
                   so text stays aligned with the section heading. */
                "group -mx-4 block rounded-lg px-4 py-4 md:items-baseline",
                "transition-colors hover:bg-secondary",
                "focus-ring",
              )}
            >
              <time
                dateTime={
                  isValidDate ? date.toISOString().slice(0, 10) : undefined
                }
                className="mb-1 block text-sm tabular-nums text-muted-foreground md:mb-0"
              >
                {isValidDate ? dateFmt.format(date) : String(p.date)}
              </time>

              <div className="min-w-0">
                <h3 className="text-balance text-lg font-semibold leading-snug transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 md:text-xl">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-prose text-muted-foreground">
                  {p.summary}
                </p>
              </div>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
