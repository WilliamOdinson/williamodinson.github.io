const remarkFrontmatter = require('remark-frontmatter').default
const remarkMdxFrontmatter = require('remark-mdx-frontmatter').default

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontMatter' }],
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
