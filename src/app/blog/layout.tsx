/**
 * BlogLayout: Shared layout for all `/blog/*` routes.
 *
 * - Wraps content in Tailwind Typography prose classes.
 * - Caps the column at `max-w-3xl` (768px) for a readable measure. It adds no
 *   horizontal padding of its own; the root `<main>` already applies `lg:px-28`.
 * - On post pages (not the `/blog` index), shows the view counter above the
 *   post and the Giscus comment thread below it.
 */
"use client";

import { usePathname } from "next/navigation";
import ViewCounter from "@/components/view-counter";
import GiscusComments from "@/components/giscus-comments";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPost = pathname !== "/blog";

  return (
    <section className="mx-auto max-w-3xl py-10">
      {isPost && (
        <div className="mb-4">
          <ViewCounter path={pathname} />
        </div>
      )}
      <article className="prose max-w-none dark:prose-invert">
        {children}
      </article>

      {isPost && (
        <div className="mt-16">
          <GiscusComments />
        </div>
      )}
    </section>
  );
}
