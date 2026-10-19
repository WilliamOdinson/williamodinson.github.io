/**
 * @module get-sale-items
 * Reads the second-hand listings from the filesystem at build time.
 * Each item lives in `src/app/sale/<slug>/page.mdx` with YAML front-matter;
 * `src/lib/sale.mjs` owns the shape and validation of that front-matter.
 */

import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import {
  compareSaleItems,
  normalizeSaleItem,
  type SaleItem,
} from "@/lib/sale.mjs";

export type { SaleItem };

const SALE_DIR = path.join(process.cwd(), "src/app/sale");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Scan `src/app/sale/` and return every listing, validated and sorted:
 * available first, then pending, then sold; newest first within a status.
 *
 * Items with `hidden: true` are left out, so they never reach the index or the
 * sitemap, the same rule `getAllPosts()` applies to posts. Their pages are
 * still built and reachable by URL, marked noindex by `remark-next-metadata`.
 * Pass `{ includeHidden: true }` to get them too.
 *
 * Every image path is checked against `public/` before the hidden filter, so
 * a photo that was never committed fails the build for hidden items as well.
 */
export async function getAllSaleItems(
  options: { includeHidden?: boolean } = {},
): Promise<SaleItem[]> {
  let entries: import("fs").Dirent[];
  try {
    entries = await fs.readdir(SALE_DIR, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const items = await Promise.all(
    entries
      // Skip files, dynamic route folders like [slug] and private folders like
      // _template, which Next.js never routes to
      .filter(
        (e) =>
          e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"),
      )
      .map(async (dir) => {
        const file = path.join(SALE_DIR, dir.name, "page.mdx");
        const raw = await fs.readFile(file, "utf8");
        const item = normalizeSaleItem(matter(raw).data, dir.name);
        await assertImagesExist(item);
        return item;
      }),
  );

  return items
    .filter((item) => options.includeHidden || !item.hidden)
    .sort(compareSaleItems);
}

/** Fail the build when a local image path has no file under `public/`. */
async function assertImagesExist(item: SaleItem): Promise<void> {
  for (const src of item.images) {
    if (!src.startsWith("/")) continue;
    const file = path.join(PUBLIC_DIR, decodeURIComponent(src));
    try {
      await fs.access(file);
    } catch {
      throw new Error(
        `sale item "${item.slug}": image "${src}" not found at public${src}`,
      );
    }
  }
}
