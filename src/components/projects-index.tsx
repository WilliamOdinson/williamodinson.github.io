/**
 * ProjectsIndex: Full chronological list of projects with cover images.
 * Rendered on the /projects page. Each row links to GitHub and to the detail page.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ProjectMeta } from "@/lib/get-projects";
import { motion } from "framer-motion";

const GITHUB_PREFIX = "https://github.com/";
const PLACEHOLDER_IMG = "https://placehold.co/600x338";

/** Cached formatter for "Mon YYYY" style dates. */
const dateFmt = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

/** Format a project period (start: end) into a human-readable string. */
function formatPeriod(period: ProjectMeta["period"]) {
  const start = dateFmt.format(new Date(period.start));
  const end = period.end ? dateFmt.format(new Date(period.end)) : "Present";
  return `${start} - ${end}`;
}

/** Stagger timing for the list container. */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/** Slide-up animation for each row. */
const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 180, damping: 22 },
  },
};

export default function ProjectsIndex({ items }: { items: ProjectMeta[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="flex list-none flex-col gap-14"
    >
      {items.map((p) => {
        const imgSrc = p.cover?.trim() || PLACEHOLDER_IMG;

        return (
          <motion.li key={p.slug} variants={rowVariants}>
            <section className="flex flex-col items-start gap-1 md:flex-row md:gap-8">
              {/* Date range column */}
              <span className="shrink-0 text-sm text-muted-foreground md:w-40 md:text-base">
                {formatPeriod(p.period)}
              </span>

              {/* Content column */}
              <div className="flex flex-1 flex-col gap-0">
                <div className="flex flex-col gap-0.5">
                  {/* Link to GitHub repo */}
                  <Link
                    href={`${GITHUB_PREFIX}${p.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold no-underline transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400 md:text-xl"
                  >
                    {p.title}
                  </Link>

                  <p className="text-sm text-muted-foreground md:text-base">
                    {p.description}
                  </p>

                  {/* Link to local detail page */}
                  <Link
                    href={`/projects/${p.slug}`}
                    className="text-sm underline underline-offset-4 md:text-base"
                  >
                    Go into Details
                  </Link>
                </div>

                {/* Cover image */}
                <Link
                  href={`/projects/${p.slug}`}
                  className="mx-auto block w-full overflow-hidden rounded-xl md:h-[338px] md:w-[600px]"
                >
                  <Image
                    src={imgSrc}
                    width={600}
                    height={338}
                    sizes="(max-width:600px) 100vw, 600px"
                    className="rounded-xl object-cover object-center"
                    alt={`${p.title} cover`}
                  />
                </Link>
              </div>
            </section>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
