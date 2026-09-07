/**
 * BlogLayoutInner: Client-side wrapper for blog pages.
 *
 * - Wraps content in Tailwind Typography prose classes.
 * - Caps the column at `max-w-3xl` (768px) for a readable measure. It adds no
 *   horizontal padding of its own: the root `<main>` in `app/layout.tsx`
 *   already applies `lg:px-28`, and repeating it here used to collapse the
 *   column to ~350px at 1024px viewports.
 * - Conditionally renders the Giscus comment section on individual
 *   post pages (hidden on the `/blog` index).
 */
"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import ViewCounter from "@/components/view-counter";

/** Lazy-load Giscus to avoid loading the script on every blog navigation. */
const GiscusComments = dynamic(() => import("@/components/giscus-comments"), {
  ssr: false,
  loading: () => null,
});

export default function BlogLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showComments = pathname !== "/blog";

  return (
    <section className="mx-auto max-w-3xl py-10">
      {showComments && (
        <div className="mb-4">
          <ViewCounter path={pathname} />
        </div>
      )}
      <article className="prose max-w-none dark:prose-invert">
        {children}
      </article>

      {showComments && (
        <div className="mt-16">
          <GiscusComments />
        </div>
      )}
    </section>
  );
}
