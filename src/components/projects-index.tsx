"use client";

import Image from "next/image";
import Link from "next/link";
import { ProjectMeta } from "@/lib/get-projects";
import { motion } from "framer-motion";

function fmt(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function ProjectsIndex({ items }: { items: ProjectMeta[] }) {
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const row = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 180, damping: 22 },
    },
  };

  return (
    <motion.ul
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="flex list-none flex-col gap-14"
    >
      {items.map((p) => {
        const period =
          p.period.start && p.period.end
            ? `${fmt(p.period.start)} - ${fmt(p.period.end)}`
            : `${fmt(p.period.start)} - Present`;

        /* fall-back image when no cover is provided */
        const imgSrc =
          p.cover && p.cover.trim().length
            ? p.cover
            : "https://placehold.co/600x338";

        return (
          <motion.li key={p.slug} variants={row}>
            <section className="flex flex-col items-start gap-1 md:flex-row md:gap-8">
              {/* date column */}
              <h2 className="shrink-0 text-xs leading-6 text-muted-foreground md:w-40 md:text-sm">
                {period}
              </h2>

              {/* right-hand column */}
              <div className="flex flex-1 flex-col gap-0">
                {/* title, description, details */}
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={`${"https://github.com/"}${p.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold no-underline transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400 md:text-xl"
                  >
                    {p.title}
                  </Link>

                  <p className="text-sm text-muted-foreground md:text-base">
                    {p.description}
                  </p>

                  <Link
                    href={`/projects/${p.slug}`}
                    className="text-sm underline underline-offset-4 md:text-base"
                  >
                    Go into Details
                  </Link>
                </div>

                {/* cover image */}
                <Link
                  href={`/projects/${p.slug}`}
                  className="mx-auto block h-[338px] w-[600px] overflow-hidden rounded-xl"
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
