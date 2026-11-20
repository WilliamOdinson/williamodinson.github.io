/**
 * ViewCounter: Displays the page view count for a given path.
 * Fetches from GoatCounter's public counter API, which returns the count as a
 * string already formatted with thousands separators.
 *
 * Renders nothing until a count arrives. Paths GoatCounter has not recorded
 * answer 404, and content blockers often stop the request; both leave it empty.
 *
 * @param path - The page path to query, e.g. "/blog/go-reflection"
 */
"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { goatcounter } from "@/lib/site.config.mjs";

export default function ViewCounter({ path }: { path: string }) {
  const [count, setCount] = useState<string | null>(null);

  useEffect(() => {
    const url = `https://${goatcounter.siteCode}.goatcounter.com/counter/${encodeURIComponent(path)}.json`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.count) setCount(data.count);
      })
      .catch(() => {});
  }, [path]);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Eye className="h-3.5 w-3.5" />
      {count}
    </span>
  );
}
