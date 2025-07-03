# Personal Portfolio Website

This repository hosts the source code for my portfolio website, built to showcase projects, blog posts, and personal information in a clean, responsive, and performant manner.

The website leverages modern web technologies including **Next.js 15** for efficient static-site generation and hybrid rendering, **Tailwind CSS 3.4** alongside **shadcn/ui** components for consistent styling and accessibility, and **Framer Motion 11** for interactive animations and enhanced user engagement. Content management is streamlined with **MDX**, allowing Markdown-based authoring with embedded React components.

## Local development

> [!NOTE]
>
> Prerequisites: Install Node ≥ 18 LTS and pnpm ≥ 10.

1. Clone and install dependencies

   ```bash
   git clone git@github.com:WilliamOdinson/williamodinson.github.io.git
   cd williamodinson.github.io
   pnpm install
   ```

2. Run the development server

   ```bash
   pnpm dev
   # Navigate to http://localhost:3000
   ```

3. Lint, type-check, and format

   ```bash
   pnpm lint        # ESLint + TypeScript strict mode
   pnpm format      # Prettier with Tailwind plugin (alias in package.json)
   ```

4. Build and export static files

   ```bash
   pnpm build   # next build
   pnpm export  # out/ directory with static HTML/CSS/JS
   ```

5. Preview a production build locally

   ```bash
   pnpm start         # Serves .next/ (node server)
   npx serve out      # Quick static preview of the export
   ```
