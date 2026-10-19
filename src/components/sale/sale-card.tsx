/**
 * SaleCard: One listing on the /sale index: cover photo, status, category,
 * title, one-line summary, price and condition, linking to the item page.
 * Sold items are greyed out so what is still available stands out.
 */
"use client";

import Link from "next/link";
import { ImageOff } from "lucide-react";
import SalePrice from "@/components/sale/sale-price";
import { ConditionBadge, StatusBadge } from "@/components/sale/sale-badges";
import type { SaleItem } from "@/lib/sale.mjs";
import { cn } from "@/lib/utils";

export default function SaleCard({ item }: { item: SaleItem }) {
  const sold = item.status === "sold";
  const cover = item.images[0];

  return (
    <Link
      href={`/sale/${item.slug}`}
      aria-label={`${item.title}${sold ? " (sold)" : ""}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl bg-card",
        "ring-1 ring-border transition-[box-shadow,transform] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-lg focus-ring",
        sold && "opacity-75 hover:opacity-100",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cover}
            alt=""
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]",
              sold && "grayscale",
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-7 w-7" aria-hidden="true" />
          </div>
        )}
        {item.status !== "available" && (
          <StatusBadge status={item.status} className="absolute left-3 top-3 shadow" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {item.category}
        </p>
        <h2
          className={cn(
            "line-clamp-2 text-base font-semibold leading-snug transition-colors",
            "group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400",
            sold && "line-through decoration-1",
          )}
        >
          {item.title}
        </h2>
        {item.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <SalePrice item={item} />
          <ConditionBadge condition={item.condition} className="shrink-0" />
        </div>
      </div>
    </Link>
  );
}
