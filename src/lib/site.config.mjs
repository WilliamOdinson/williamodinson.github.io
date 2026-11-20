/**
 * site.config: Single source of truth for all site-wide settings.
 *
 * Imported by the app, by the remark plugins (in Node, at build time) and by
 * functions/resume.pdf.ts. Edit this file to change the name, links, SEO
 * metadata, etc. everywhere.
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
 *  - the deploy workflow stops injecting the PDF into out/, so the path
 *    answers with the site's 404 page
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
 * GoatCounter (https://www.goatcounter.com) site code, i.e. the subdomain of
 * https://<siteCode>.goatcounter.com. Used by:
 *  - count.js, which counts pageviews (components/goatcounter-script.tsx)
 *  - the view counters, which read the public count API; the site needs
 *    "Allow public access to count API" enabled in its GoatCounter settings
 *  - functions/resume.pdf.ts, which counts /resume.pdf through the backend
 *    API with the GOATCOUNTER_TOKEN secret of the Cloudflare Pages project
 */
export const goatcounter = {
  siteCode: "williamodinson",
};
