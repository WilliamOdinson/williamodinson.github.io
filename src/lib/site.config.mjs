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
  url: "https://williamodinson.github.io",
  title: "William Sun",
  description:
    "William Sun's personal portfolio — Software Engineering, AI, and more",
  language: "en",
};

export const rss = {
  title: "Blog by William Sun",
  description: "Articles on Software Engineering, AI, etc.",
};
