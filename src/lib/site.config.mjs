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
