/**
 * ProjectLayout: Shared layout for all `/projects/*` routes.
 * Wraps project detail pages in Tailwind Typography prose styling.
 */
export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="container mx-auto py-10 lg:px-28">
      <article className="prose max-w-none dark:prose-invert">
        {children}
      </article>
    </section>
  );
}
