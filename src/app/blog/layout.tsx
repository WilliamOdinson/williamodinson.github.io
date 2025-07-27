"use client";
import "@/app/globals.css";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const GiscusComments = dynamic(() => import("@/components/giscus-comments"), {
  ssr: false,
  loading: () => null,
});

export default function BlogLayout({
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
