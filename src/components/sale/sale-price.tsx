/**
 * SalePrice: "$40", with the original price struck through, "OBO" when the
 * price is negotiable, and "Free" for a zero price. On a sold item the price
 * itself is struck through so the card and the page read as closed.
 */
import { formatPrice, type SaleItem } from "@/lib/sale.mjs";
import { cn } from "@/lib/utils";

type Props = {
  item: Pick<
    SaleItem,
    "price" | "originalPrice" | "currency" | "negotiable" | "status"
  >;
  size?: "sm" | "lg";
  className?: string;
};

export default function SalePrice({ item, size = "sm", className }: Props) {
  const sold = item.status === "sold";
  const price = formatPrice(item.price, item.currency);

  return (
    <p
      className={cn(
        "flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums",
        className,
      )}
    >
      <span
        className={cn(
          "font-bold",
          size === "lg" ? "text-3xl" : "text-lg",
          sold && "text-muted-foreground line-through decoration-2",
        )}
      >
        {price}
      </span>
      {item.negotiable && item.price > 0 && !sold && (
        <span
          className={cn(
            "font-medium text-muted-foreground",
            size === "lg" ? "text-base" : "text-xs",
          )}
          title="Or best offer"
        >
          OBO
        </span>
      )}
      {item.originalPrice !== null && (
        <span
          className={cn(
            "text-muted-foreground",
            size === "lg" ? "text-base" : "text-sm",
          )}
        >
          <span className="sr-only">Originally </span>
          <s>{formatPrice(item.originalPrice, item.currency)}</s>
          <span className="sr-only"> new</span>
        </span>
      )}
    </p>
  );
}
