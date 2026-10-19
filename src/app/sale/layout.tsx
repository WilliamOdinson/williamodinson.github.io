/**
 * SaleLayout: Metadata shared by `/sale` and every listing under it.
 *
 * `sale.hidden` makes the whole section noindex from here rather than inside
 * `remark-next-metadata`: Turbopack caches a page's compiled MDX by the page's
 * own content, so a config flag baked in at compile time could survive a
 * rebuild after the switch was flipped. This module imports the config, so
 * the build tracks the change. A page that sets `robots` itself (an item with
 * `hidden: true`) still wins, since segment metadata is shallowly merged.
 */
import type { Metadata } from "next";
import { sale } from "@/lib/site.config.mjs";

export const metadata: Metadata = sale.hidden
  ? { robots: { index: false, follow: false } }
  : {};

export default function SaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
