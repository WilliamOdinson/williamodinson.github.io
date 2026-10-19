/**
 * sale — Shared model for the second-hand listings under /sale.
 *
 * Importable from .tsx (bundler) and from the remark plugins (Node), like
 * site.config.mjs. The front-matter of src/app/sale/<slug>/page.mdx goes
 * through `normalizeSaleItem` on every path that reads it (the item page, the
 * /sale index, the sitemap), so a typo fails the build naming the item instead
 * of rendering "undefined" on the live site.
 */
import { sale as saleConfig } from "./site.config.mjs";

/** @typedef {"new" | "like-new" | "good" | "fair" | "for-parts"} SaleCondition */
/** @typedef {"available" | "pending" | "sold"} SaleStatus */

/**
 * @typedef {Object} SaleItem
 * @property {string} slug            Folder name under src/app/sale/, also the URL segment.
 * @property {string} title
 * @property {string} summary         One line for cards, link previews and search. May be "".
 * @property {number} price           0 means free.
 * @property {number | null} originalPrice  What it cost new, shown struck through.
 * @property {string} currency        ISO 4217 code, defaults to site.config `sale.currency`.
 * @property {boolean} negotiable     Shows "OBO" next to the price.
 * @property {SaleCondition} condition
 * @property {SaleStatus} status
 * @property {string} category        Free text; the index builds its filter chips from these.
 * @property {string[]} images        Public paths; the first one is the cover.
 * @property {string} date            YYYY-MM-DD, the day the item was listed.
 * @property {Array<[label: string, value: string]>} specs  Rows in front-matter order.
 * @property {string | null} link     Product page for reference (manufacturer, Amazon, ...).
 * @property {string | null} pickup   Overrides site.config `sale.location` for this item.
 * @property {boolean} hidden         Keeps the item out of every listing; page stays reachable.
 */

/** Condition keys accepted in front-matter, mapped to their display labels. */
export const CONDITION_LABELS = Object.freeze({
  new: "New",
  "like-new": "Like new",
  good: "Good",
  fair: "Fair",
  "for-parts": "For parts",
});

/** Status keys accepted in front-matter, mapped to their display labels. */
export const STATUS_LABELS = Object.freeze({
  available: "Available",
  pending: "Pending",
  sold: "Sold",
});

/** Sort rank per status: things you can still buy come first in every list. */
export const STATUS_ORDER = Object.freeze({ available: 0, pending: 1, sold: 2 });

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CURRENCY_RE = /^[A-Z]{3}$/;

/**
 * Validate and normalize raw front-matter into a SaleItem.
 *
 * @param {Record<string, unknown> | null | undefined} data  Parsed YAML front-matter.
 * @param {string} slug  Folder name of the item, used in error messages and URLs.
 * @returns {SaleItem}
 * @throws {Error} On a missing required field or an unknown enum value.
 */
export function normalizeSaleItem(data, slug) {
  /** @param {string} message @returns {never} */
  const fail = (message) => {
    throw new Error(`sale item "${slug}": ${message}`);
  };

  if (!data || typeof data !== "object") fail("front-matter block is missing");

  const title = text(data.title);
  if (!title) fail("`title` is required");

  const price = number(data.price);
  if (price === null || price < 0) {
    fail("`price` must be a number of 0 or more (0 means free)");
  }

  const originalPrice = number(data.originalPrice);
  if (data.originalPrice !== undefined) {
    if (originalPrice === null) fail("`originalPrice` must be a number");
    if (originalPrice <= price) {
      fail("`originalPrice` is what it cost new and must be higher than `price`");
    }
  }

  const currency = text(data.currency, saleConfig.currency).toUpperCase();
  if (!CURRENCY_RE.test(currency)) {
    fail(`\`currency\` must be a three-letter ISO code, got "${currency}"`);
  }

  const condition = text(data.condition);
  if (!isKey(CONDITION_LABELS, condition)) {
    fail(
      `\`condition\` must be one of ${keyList(CONDITION_LABELS)}, got "${condition}"`,
    );
  }

  const status = text(data.status, "available");
  if (!isKey(STATUS_LABELS, status)) {
    fail(`\`status\` must be one of ${keyList(STATUS_LABELS)}, got "${status}"`);
  }

  const date = isoDate(data.date);
  if (!date) fail("`date` must be a YYYY-MM-DD date (the day you listed it)");

  const images = stringList(data.images, "images", fail);
  const cover = text(data.cover);
  if (cover && images[0] !== cover) images.unshift(cover);
  for (const src of images) {
    if (!src.startsWith("/") && !/^https?:\/\//.test(src)) {
      fail(`image "${src}" must be a public path starting with "/" or a full URL`);
    }
  }

  const specs = specRows(data.specs, fail);

  const link = text(data.link) || null;
  if (link !== null && !isHttpUrl(link)) {
    fail(`\`link\` must be a full http(s) URL, got "${link}"`);
  }

  return {
    slug,
    title,
    summary: text(data.summary),
    price,
    originalPrice,
    currency,
    negotiable: data.negotiable === true,
    condition,
    status,
    category: text(data.category, "Other"),
    images,
    date,
    specs,
    link,
    pickup: text(data.pickup) || null,
    hidden: data.hidden === true,
  };
}

/**
 * Comparator for listings: available, then pending, then sold; newest first
 * within a status; title as the final tie-break so the order is stable.
 *
 * @param {SaleItem} a
 * @param {SaleItem} b
 */
export function compareSaleItems(a, b) {
  return (
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
    b.date.localeCompare(a.date) ||
    a.title.localeCompare(b.title)
  );
}

/**
 * "$40", "$12.50", "Free". Whole amounts drop the cents.
 *
 * @param {number} amount
 * @param {string} currency
 */
export function formatPrice(amount, currency) {
  if (amount === 0) return "Free";
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

/**
 * One-line summary used as the meta description and the card subtitle when
 * the front-matter has no `summary`: "Like new · $40 (was $199) · Pittsburgh, PA".
 *
 * @param {SaleItem} item
 */
export function describeSaleItem(item) {
  const parts = [CONDITION_LABELS[item.condition]];
  let price = formatPrice(item.price, item.currency);
  if (item.negotiable && item.price > 0) price += " OBO";
  if (item.originalPrice !== null) {
    price += ` (was ${formatPrice(item.originalPrice, item.currency)})`;
  }
  parts.push(price);
  if (item.status === "sold") parts.push("Sold");
  parts.push(item.pickup ?? saleConfig.location);
  return parts.join(" · ");
}

/* ------------------------------------------------------------------ */
/*  Front-matter coercion helpers                                     */
/* ------------------------------------------------------------------ */

/**
 * @param {unknown} value
 * @param {string} [fallback]
 */
function text(value, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
}

/** @param {unknown} value @returns {number | null} */
function number(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/[$,]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * YAML turns an unquoted `2026-10-18` into a Date (UTC midnight), a quoted one
 * stays a string. Both come back as "YYYY-MM-DD".
 *
 * @param {unknown} value
 * @returns {string | null}
 */
function isoDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && DATE_RE.test(value.trim())) {
    const s = value.trim();
    return Number.isNaN(Date.parse(s)) ? null : s;
  }
  return null;
}

/**
 * @param {unknown} value
 * @param {string} field
 * @param {(message: string) => never} fail
 * @returns {string[]}
 */
function stringList(value, field, fail) {
  if (value === undefined || value === null) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map((entry) => {
    const s = text(entry);
    if (!s) fail(`\`${field}\` must be a list of non-empty strings`);
    return s;
  });
}

/**
 * `specs` is a YAML mapping; rows keep the order they were written in.
 *
 * @param {unknown} value
 * @param {(message: string) => never} fail
 * @returns {Array<[string, string]>}
 */
function specRows(value, fail) {
  if (value === undefined || value === null) return [];
  if (typeof value !== "object" || Array.isArray(value)) {
    fail("`specs` must be a mapping of label: value");
  }
  return Object.entries(value).map(([label, raw]) => {
    const v = text(raw);
    if (!v) fail(`spec "${label}" has no value`);
    return [label, v];
  });
}

/** @param {string} value */
function isHttpUrl(value) {
  return /^https?:\/\/[^\s/?#]+[^\s]*$/i.test(value);
}

/**
 * @template {Record<string, string>} T
 * @param {T} table
 * @param {string} key
 * @returns {key is keyof T & string}
 */
function isKey(table, key) {
  return Object.prototype.hasOwnProperty.call(table, key);
}

/** @param {Record<string, string>} table */
function keyList(table) {
  return Object.keys(table)
    .map((k) => `"${k}"`)
    .join(", ");
}
