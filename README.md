# Personal Website

Personal website and blog, live at **[wsun.io](https://wsun.io)**.

Next.js (App Router, static export), React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, and MDX. Posts are MDX files; front matter drives page metadata, Open Graph, JSON-LD, the RSS feed, and the sitemap through two small remark plugins. Comments via Giscus, page views via GoatCounter. Deployed to Cloudflare Pages by GitHub Actions.

## Quickstart

Prerequisites: **Node.js >= 20.9** and **pnpm 12**.

```bash
git clone git@github.com:WilliamOdinson/williamodinson.github.io.git wsun.io
cd wsun.io
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

|     Command      |                What it does                |
| :--------------: | :----------------------------------------: |
|    `pnpm dev`    |  Dev server with Turbopack and hot reload  |
|   `pnpm build`   |   Type-check and static export to `out/`   |
|   `pnpm lint`    | ESLint (strict TypeScript + Next.js rules) |
| `pnpm lint:fix`  |            Same, with auto-fix             |
|   `pnpm clean`   |         Remove `.next/` and `out/`         |
| `pnpm clean:all` | Also remove `node_modules/` and reinstall  |

To preview the production build the way Cloudflare serves it:

```bash
pnpm build
npx serve out
```
