/**
 * BlogLayout: Shared layout for all `/blog/*` routes.
 * Delegates to BlogLayoutInner (a client component) so it can
 * conditionally render the Giscus comment widget on post pages.
 */
import BlogLayoutInner from "./blog-layout-inner";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BlogLayoutInner>{children}</BlogLayoutInner>;
}
