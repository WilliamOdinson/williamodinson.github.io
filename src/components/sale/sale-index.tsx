/**
 * SaleIndex: The /sale listing with client-side search and filters.
 *
 * Items arrive sorted (available, pending, sold; newest first). Status and
 * category chips are built from the data, so a category only exists while
 * something is listed under it. Sold items stay visible, greyed out, at the end.
 */
"use client";

import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Search } from "lucide-react";
import SaleCard from "@/components/sale/sale-card";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, type SaleItem, type SaleStatus } from "@/lib/sale.mjs";
import { sale as saleConfig } from "@/lib/site.config.mjs";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | SaleStatus;

const STATUS_FILTERS: StatusFilter[] = ["all", "available", "pending", "sold"];

/** Staggered reveal for the grid. */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

/** Slide-up animation for each card. */
const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
};

export default function SaleIndex({ items }: { items: SaleItem[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: items.length,
      available: 0,
      pending: 0,
      sold: 0,
    };
    for (const item of items) counts[item.status] += 1;
    return counts;
  }, [items]);

  /** Categories by how many items they hold, then by name. */
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (category !== "all" && item.category !== category) return false;
      if (!needle) return true;
      const haystack = [
        item.title,
        item.summary,
        item.category,
        ...item.specs.map(([label, value]) => `${label} ${value}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, q, status, category]);

  const isFiltering = q.trim() !== "" || status !== "all" || category !== "all";
  const clearFilters = () => {
    setQ("");
    setStatus("all");
    setCategory("all");
  };

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nothing for sale right now. Check back later.
      </p>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <p className="max-w-prose text-muted-foreground">{saleConfig.description}</p>
        {saleConfig.terms.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {saleConfig.terms.join(" · ")}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <label
            htmlFor="sale-search"
            className="flex w-fit items-center gap-2 rounded-full bg-secondary px-2 focus-within:outline"
          >
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              id="sale-search"
              type="search"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 bg-transparent pr-4 outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {STATUS_FILTERS.filter((s) => s === "all" || statusCounts[s] > 0).map((s) => (
              <Chip
                key={s}
                active={status === s}
                onClick={() => setStatus(s)}
                count={statusCounts[s]}
              >
                {s === "all" ? "All" : STATUS_LABELS[s]}
              </Chip>
            ))}
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>
                All categories
              </Chip>
              {categories.map((name) => (
                <Chip
                  key={name}
                  active={category === name}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </header>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtered.length === items.length
          ? `${items.length} ${items.length === 1 ? "item" : "items"}`
          : `${filtered.length} of ${items.length} items`}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-8">
          <p className="text-muted-foreground">Nothing matches those filters.</p>
          {isFiltering && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((item) => (
            <motion.li key={item.slug} variants={itemVariants} className="min-w-0">
              <SaleCard item={item} />
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}

function Chip({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors focus-ring",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "tabular-nums",
            active ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
