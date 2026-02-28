/**
 * BlogLayoutInner: Client-side wrapper for blog pages.
 *
 * - Wraps content in Tailwind Typography prose classes.
 * - Conditionally renders the Giscus comment section on individual
 *   post pages (hidden on the `/blog` index).
 */
"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

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
    <section className="container mx-auto py-10 lg:px-28">
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
