/**
 * Next.js configuration.
 *
 * - Enables MDX page support via @next/mdx with front-matter parsing.
 * - Uses static export (`output: 'export'`) for GitHub Pages deployment.
 * - Disables image optimization (not available in static export mode).
 */
const remarkFrontmatter = require('remark-frontmatter').default
const remarkMdxFrontmatter = require('remark-mdx-frontmatter').default

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontMatter' }],
      require('./src/lib/remark-next-metadata.mjs').default,
      require('./src/lib/remark-json-ld.mjs').default,
    ],
    rehypePlugins: [],
  },
})

module.exports = withMDX({
  output: 'export',
  images: { unoptimized: true },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // Allow dev requests from your LAN IP as well as localhost
  allowedDevOrigins: ['10.0.0.154', 'localhost'],
})
