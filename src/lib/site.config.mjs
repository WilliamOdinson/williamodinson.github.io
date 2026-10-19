/**
 * site.config — Single source of truth for all site-wide settings.
 *
 * Importable from both .tsx (via webpack) and .mjs (remark plugins via Node).
 * Edit this file to update your name, links, SEO metadata, etc. everywhere.
 */

export const author = {
  name: "William Sun",
  jobTitle: "Software Engineer",
  email: "earthsuperman@outlook.com",
  image: {
    src: "/selfie.jpg",
    alt: "William Sun's Portrait",
    width: 640,
    height: 800,
  },
  education: ["Carnegie Mellon University", "Tianjin University"],
  social: {
    github: "https://github.com/williamodinson",
    linkedin: "https://linkedin.com/in/williamodinson",
    twitter: "https://x.com/william18652",
  },
};

export const site = {
  url: "https://wsun.io",
  title: "William Sun",
  description:
    "William Sun's personal portfolio — Software Engineering, AI, and more",
  language: "en",
};

export const rss = {
  title: "Blog by William Sun",
  description: "Articles on Software Engineering, AI, etc.",
};

/**
 * Résumé visibility. Set `hidden: true` to take /resume.pdf offline:
 *  - the homepage stops rendering the "View My Résumé" button
 *  - the deploy workflow stops injecting the PDF into out/
 *  - functions/resume.pdf.ts answers 404 even if a stale deployment has the file
 *
 * Blog posts have the same switch in their front-matter: `hidden: true` keeps
 * a post out of the blog index, the homepage, the sitemap and the RSS feed and
 * marks the page noindex. The page itself stays reachable by its URL; to
 * remove the route entirely, prefix the post folder with `_` (a Next.js
 * private folder), which the listing code skips as well.
 */
export const resume = {
  hidden: false,
};

/**
 * Second-hand listings at /sale. One folder per item under src/app/sale/
 * (copy src/app/sale/_template/page.mdx), photos under public/sale/<slug>/.
 *
 * `hidden: true` takes the section offline without deleting anything: the nav
 * link and the sitemap entries go away, /sale shows an empty notice, and every
 * item page is marked noindex. Pages stay reachable by URL, like hidden posts.
 *
 * Buyers reach you through `contact.email`; the mail opens pre-addressed with
 * the item's title and link in the subject and body.
 */
export const sale = {
  hidden: false,
  title: "For Sale",
  description:
    "Things I no longer need, priced to go. Everything is pickup only in Pittsburgh.",
  location: "Pittsburgh, PA",
  currency: "USD",
  contact: {
    email: author.email,
  },
  /** Short lines shown under the heading on /sale and next to the contact button. */
  terms: [
    "Pickup only, Pittsburgh, PA. No shipping.",
    "Cash, Venmo or Zelle at pickup.",
    "First to confirm a pickup time gets the item.",
  ],
};

/**
 * GoatCounter: free, privacy-friendly web analytics.
 * 1. Sign up at https://www.goatcounter.com (free for personal use)
 * 2. Create a site and get your site code (e.g. "williamodinson")
 * 3. Replace the empty string below with your site code
 * 4. Enable "Allow public access to count API" in GoatCounter Settings → Sites
 * 5. /resume.pdf is counted server-side by functions/resume.pdf.ts, which needs
 *    the GOATCOUNTER_TOKEN secret on the Cloudflare Pages project
 */
export const goatcounter = {
  siteCode: "williamodinson",
};
