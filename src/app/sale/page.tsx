/**
 * SalePage: Index page for `/sale`, the second-hand listings.
 * Reads every item at build time and hands them to the client-side SaleIndex,
 * which provides search, status and category filters and the animated grid.
 *
 * With `sale.hidden` set in site.config the page still builds (static export
 * cannot drop a route per deploy) but lists nothing; `layout.tsx` marks the
 * whole section noindex.
 */
import type { Metadata } from "next";
import { getAllSaleItems } from "@/lib/get-sale-items";
import SaleIndex from "@/components/sale/sale-index";
import { author, sale } from "@/lib/site.config.mjs";

const title = `${sale.title} by ${author.name}`;

/*
 * `alternates` and `openGraph` are set explicitly: nested metadata objects
 * replace the root layout's rather than merging with it, so without these
 * `/sale` would inherit the homepage canonical and OG title.
 * The preview image is the cover of the newest available item, so a shared
 * link shows merchandise rather than the portrait.
 */
export async function generateMetadata(): Promise<Metadata> {
  const items = sale.hidden ? [] : await getAllSaleItems();
  const cover = items.find((item) => item.status === "available")?.images[0];

  return {
    title,
    description: sale.description,
    alternates: { canonical: "/sale" },
    openGraph: {
      title,
      description: sale.description,
      url: "/sale",
      type: "website",
      images: [
        cover
          ? { url: cover, alt: title }
          : {
              url: author.image.src,
              alt: author.image.alt,
              width: author.image.width,
              height: author.image.height,
            },
      ],
    },
  };
}

export default async function SalePage() {
  const items = sale.hidden ? [] : await getAllSaleItems();

  return (
    <section className="px-4 py-16">
      <h1 className="mb-12 text-3xl font-bold dark:text-white">{sale.title}</h1>
      <SaleIndex items={items} />
    </section>
  );
}
