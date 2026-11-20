/**
 * Next.js configuration.
 *
 * - Compiles `page.mdx` routes with @next/mdx; the remark plugins turn each
 *   post's front matter into page metadata and JSON-LD.
 * - Uses static export (`output: 'export'`); Cloudflare Pages serves `out/`.
 * - Disables image optimization (not available in static export mode).
 * - Allows this machine's LAN addresses to reach the dev server, for testing
 *   from other devices.
 */
const os = require('os')
const path = require('path')

const withMDX = require('@next/mdx')({
  options: {
    remarkPlugins: [
      'remark-frontmatter',
      path.resolve(__dirname, 'src/lib/remark-next-metadata.mjs'),
      path.resolve(__dirname, 'src/lib/remark-json-ld.mjs'),
    ],
  },
})

const lanIPs = Object.values(os.networkInterfaces())
  .flat()
  .filter(n => n.family === 'IPv4' && !n.internal)
  .map(n => n.address)

module.exports = withMDX({
  output: 'export',
  images: { unoptimized: true },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  allowedDevOrigins: lanIPs,
})
