/**
 * SaleItemPage: Template for one second-hand listing.
 *
 * `remark-sale-item` wraps every page under `src/app/sale/<slug>/` in this
 * component, passing the validated front-matter as `item`; whatever Markdown
 * the page has arrives as `children` and is rendered as the description.
 *
 * Server component: only the gallery and the share button need the browser.
 */
import { Children, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Mail } from "lucide-react";

import JsonLd from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import SaleGallery from "@/components/sale/sale-gallery";
import SalePrice from "@/components/sale/sale-price";
import SaleShareButton from "@/components/sale/sale-share-button";
import { ConditionBadge, StatusBadge } from "@/components/sale/sale-badges";
import { author, sale as saleConfig, site } from "@/lib/site.config.mjs";
import {
  describeSaleItem,
  type SaleCondition,
  type SaleItem,
  type SaleStatus,
} from "@/lib/sale.mjs";

/** "October 18, 2026"; dates are day-precision UTC, so the formatter is too. */
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const availabilityOf: Record<SaleStatus, string> = {
  available: "https://schema.org/InStock",
  pending: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

const conditionOf: Record<SaleCondition, string> = {
  new: "https://schema.org/NewCondition",
  "like-new": "https://schema.org/UsedCondition",
  good: "https://schema.org/UsedCondition",
  fair: "https://schema.org/UsedCondition",
  "for-parts": "https://schema.org/DamagedCondition",
};

/** The pre-addressed mail a buyer sends; the item link keeps replies unambiguous. */
function mailtoFor(item: SaleItem, url: string): string {
  const firstName = author.name.split(" ")[0];
  const subject = `[For sale] ${item.title}`;
  const body =
    item.status === "pending"
      ? `Hi ${firstName},\n\nIf "${item.title}" (${url}) frees up, I'd like to be next in line.\n\n`
      : `Hi ${firstName},\n\nI'd like to buy "${item.title}" (${url}). When could I pick it up?\n\n`;
  return `mailto:${saleConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function productJsonLd(item: SaleItem, url: string): string {
  const absolute = (src: string) =>
    src.startsWith("/") ? `${site.url}${src}` : src;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: item.summary || describeSaleItem(item),
    image: item.images.map(absolute),
    category: item.category,
    offers: {
      "@type": "Offer",
      url,
      price: item.price,
      priceCurrency: item.currency,
      availability: availabilityOf[item.status],
      itemCondition: conditionOf[item.condition],
      availableDeliveryMethod:
        "http://purl.org/goodrelations/v1#DeliveryModePickUp",
      seller: { "@type": "Person", name: author.name, url: site.url },
    },
  });
}

export default function SaleItemPage({
  item,
  children,
}: {
  item: SaleItem;
  children?: ReactNode;
}) {
  const url = `${site.url}/sale/${item.slug}`;
  const sold = item.status === "sold";
  const hasDescription = Children.count(children) > 0;
  const listed = new Date(item.date);
  const pickup = item.pickup ?? saleConfig.location;
  const linkHost = item.link ? new URL(item.link).hostname.replace(/^www\./, "") : null;

  return (
    <section className="mx-auto max-w-5xl py-10">
      <Link
        href="/sale"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All items
      </Link>

      {sold && (
        <p
          role="status"
          className="mt-6 rounded-lg border border-border bg-secondary px-4 py-3 text-sm"
        >
          This one has sold.{" "}
          <Link href="/sale" className="font-medium underline underline-offset-4">
            See what is still available
          </Link>
          .
        </p>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
        <SaleGallery images={item.images} title={item.title} sold={sold} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusBadge status={item.status} />
            <span>{item.category}</span>
          </div>

          <h1 className="text-balance text-2xl font-bold leading-tight md:text-3xl">
            {item.title}
          </h1>

          <SalePrice item={item} size="lg" />

          {item.summary && <p className="text-muted-foreground">{item.summary}</p>}

          <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Condition</dt>
            <dd>
              <ConditionBadge condition={item.condition} />
            </dd>
            <dt className="text-muted-foreground">Pickup</dt>
            <dd>{pickup}</dd>
            <dt className="text-muted-foreground">Listed</dt>
            <dd>
              <time dateTime={item.date}>{dateFmt.format(listed)}</time>
            </dd>
            {item.specs.map(([label, value]) => (
              <SpecRow key={label} label={label} value={value} />
            ))}
          </dl>

          {item.link && linkHost && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1 text-sm underline-offset-4 hover:underline focus-ring rounded"
            >
              Product page on {linkHost}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}

          <div className="flex flex-wrap gap-3">
            {!sold && (
              <Button asChild>
                <a href={mailtoFor(item, url)} className="gap-2">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {item.status === "pending" ? "Email to be next in line" : "Email to buy"}
                </a>
              </Button>
            )}
            <SaleShareButton url={url} title={item.title} />
          </div>

          {!sold && saleConfig.terms.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {saleConfig.terms.map((term) => (
                <li key={term} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {term}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {hasDescription && (
        <article className="prose mt-12 max-w-none dark:prose-invert">
          {children}
        </article>
      )}

      {/* Hidden pages are noindex; structured data would only invite rich results. */}
      {!item.hidden && !saleConfig.hidden && (
        <JsonLd json={productJsonLd(item, url)} />
      )}
    </section>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </>
  );
}
