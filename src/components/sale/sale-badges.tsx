/**
 * Badges for the second-hand listings: item status and condition.
 * Pure components, safe in server and client trees alike.
 */
import {
  CONDITION_LABELS,
  STATUS_LABELS,
  type SaleCondition,
  type SaleStatus,
} from "@/lib/sale.mjs";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5";

const statusStyles: Record<SaleStatus, string> = {
  available:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  sold: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
};

/** What a status means, surfaced as a tooltip on the badge. */
const statusHints: Record<SaleStatus, string> = {
  available: "Nobody has claimed this yet",
  pending: "Someone has claimed it; email to be next in line if they back out",
  sold: "Gone to a new home",
};

export function StatusBadge({
  status,
  className,
}: {
  status: SaleStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(base, statusStyles[status], className)}
      title={statusHints[status]}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ConditionBadge({
  condition,
  className,
}: {
  condition: SaleCondition;
  className?: string;
}) {
  return (
    <span
      className={cn(
        base,
        "bg-secondary font-medium text-secondary-foreground",
        className,
      )}
    >
      {CONDITION_LABELS[condition]}
    </span>
  );
}
