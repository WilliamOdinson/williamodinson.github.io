import "@/app/globals.css";

export default function BlogLayout({
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
