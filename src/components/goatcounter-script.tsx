/**
 * GoatCounterScript: Loads the GoatCounter analytics script.
 * Only renders when a valid siteCode is configured in site.config.
 *
 * @see https://www.goatcounter.com/help/start
 */
"use client";

import { goatcounter } from "@/lib/site.config.mjs";

export default function GoatCounterScript() {
  if (!goatcounter.siteCode) return null;

  return (
    <script
      data-goatcounter={`https://${goatcounter.siteCode}.goatcounter.com/count`}
      async
      src="//gc.zgo.at/count.js"
    />
  );
}
