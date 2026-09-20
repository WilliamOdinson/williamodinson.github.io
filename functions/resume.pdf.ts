/**
 * Pages Function for /resume.pdf.
 *
 * The résumé is a static PDF injected into out/ at deploy time, so count.js
 * never runs for it. This Function sits in front of the file, serves it
 * unchanged, and records the pageview through GoatCounter's backend API
 * (https://www.goatcounter.com/help/backend) without delaying the response.
 *
 * public/_routes.json limits Function invocation to this one path; every
 * other request keeps being served as a plain static asset.
 *
 * Environment (Cloudflare Pages secret, or .dev.vars for `wrangler pages dev`):
 *   GOATCOUNTER_TOKEN   API token with the "Record pageviews" permission.
 *   GOATCOUNTER_ORIGIN  Optional API origin override, e.g. a local mock server.
 *                       Defaults to https://<siteCode>.goatcounter.com.
 */
import { goatcounter } from "../src/lib/site.config.mjs";

interface Env {
  GOATCOUNTER_TOKEN?: string;
  GOATCOUNTER_ORIGIN?: string;
}

const PATH = "/resume.pdf";
const TITLE = "Résumé (PDF)";

export const onRequestGet: PagesFunction<Env> = async ({
  request,
  env,
  next,
  waitUntil,
}) => {
  /* Static asset server, with _headers/_redirects rules applied as usual */
  const response = await next();

  if (response.status < 400 && isPageview(request)) {
    waitUntil(
      recordPageview(request, env).catch((err: unknown) => {
        console.error("goatcounter: failed to record pageview", err);
      }),
    );
  }

  return response;
};

/**
 * One person opening the PDF can produce several requests. Count only the one
 * that fetches the document from the start:
 *  - PDF viewers re-request byte ranges of a file they are already showing.
 *  - Browsers and link previews prefetch URLs nobody has opened yet.
 * HEAD requests never reach this handler; only onRequestGet is exported.
 */
function isPageview(request: Request): boolean {
  const range = request.headers.get("range");
  if (range !== null && !/^bytes=0-/.test(range)) return false;

  const purpose =
    request.headers.get("sec-purpose") ?? request.headers.get("purpose");
  if (purpose?.includes("prefetch")) return false;

  return true;
}

async function recordPageview(request: Request, env: Env): Promise<void> {
  if (!goatcounter.siteCode) return;
  if (!env.GOATCOUNTER_TOKEN) {
    console.warn("goatcounter: GOATCOUNTER_TOKEN is not set, pageview dropped");
    return;
  }

  const origin =
    env.GOATCOUNTER_ORIGIN ?? `https://${goatcounter.siteCode}.goatcounter.com`;
  const headers = request.headers;

  /* GoatCounter derives the visitor session from user_agent + ip (neither is
     stored), drops known bots by user_agent, geolocates from ip, and reads
     campaign parameters (utm_source, ref, utm_campaign, ...) from query. */
  const hit = {
    path: PATH,
    title: TITLE,
    ref: headers.get("referer") ?? "",
    user_agent: headers.get("user-agent") ?? "",
    ip: headers.get("cf-connecting-ip") ?? "",
    query: new URL(request.url).search,
  };

  const res = await fetch(`${origin}/api/v0/count`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GOATCOUNTER_TOKEN}`,
    },
    body: JSON.stringify({ hits: [hit] }),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }
}
