/**
 * GoatCounterScript: Loads the GoatCounter analytics script, which counts
 * each pageview for the site code in site.config.
 *
 * @see https://www.goatcounter.com/help/start
 */
import { goatcounter } from "@/lib/site.config.mjs";

export default function GoatCounterScript() {
  return (
    <script
      data-goatcounter={`https://${goatcounter.siteCode}.goatcounter.com/count`}
      async
      src="https://gc.zgo.at/count.js"
    />
  );
}
