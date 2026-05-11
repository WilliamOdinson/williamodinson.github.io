/**
 * ViewCounter: Displays the page view count for a given path.
 * Fetches from GoatCounter's public counter API.
 *
 * Falls back to nothing rendered if:
 *  - GoatCounter siteCode is not configured
 *  - The API request fails or returns no data
 *
 * @param path - The page path to query, e.g. "/blog/go-reflection"
 */
"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { goatcounter } from "@/lib/site.config.mjs";

export default function ViewCounter({ path }: { path: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!goatcounter.siteCode) return;

    const url = `https://${goatcounter.siteCode}.goatcounter.com/counter/${encodeURIComponent(path)}.json`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.count) {
          /* GoatCounter returns count as a formatted string like "1,234" */
          setCount(parseInt(data.count.replace(/,/g, ""), 10));
        }
      })
      .catch(() => {});
  }, [path]);

  if (!goatcounter.siteCode || count === null) return null;

  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Eye className="h-3.5 w-3.5" />
      {count.toLocaleString()}
    </span>
  );
}
