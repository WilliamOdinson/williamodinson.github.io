/**
 * Next.js configuration.
 *
 * - Enables MDX page support via @next/mdx with front-matter parsing.
 * - Uses static export (`output: 'export'`) for GitHub Pages deployment.
 * - Disables image optimization (not available in static export mode).
 */
const os = require('os')
const path = require('path')

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      ['remark-mdx-frontmatter', { name: 'frontMatter' }],
      path.resolve(__dirname, 'src/lib/remark-next-metadata.mjs'),
      path.resolve(__dirname, 'src/lib/remark-json-ld.mjs'),
    ],
    rehypePlugins: [],
  },
})

const lanIPs = Object.values(os.networkInterfaces())
  .flat()
  .filter(n => n.family === 'IPv4' && !n.internal)
  .map(n => n.address)

module.exports = withMDX({
  output: 'export',
  images: { unoptimized: true },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  allowedDevOrigins: [...lanIPs, 'localhost'],
})
