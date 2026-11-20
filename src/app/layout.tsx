/**
 * RootLayout: Top-level layout wrapping every page.
 *
 * Responsibilities:
 *  - Loads Montserrat for body text and JetBrains Mono as `--font-mono`.
 *  - Sets the `.dark` class on `<html>` before first paint (see `themeInit`).
 *  - Renders the shared Header, Footer, GridBackground, and BackToTop.
 *  - Provides the ThemeProvider context to all children.
 */
import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";

import Header from "@/components/header";
import BackToTop from "@/components/back-to-top";
import GridBackground from "@/components/grid-background";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/footer";
import GoatCounterScript from "@/components/goatcounter-script";
import JsonLd from "@/components/json-ld";
import { author, site } from "@/lib/site.config.mjs";

const montserrat = Montserrat({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

/**
 * Applies the saved theme, or the OS preference, while the parser is still in
 * `<head>`, so dark mode never paints a light frame first. It has to be a plain
 * inline script: next/script runs `beforeInteractive` code only after the
 * Next.js runtime has loaded.
 */
const themeInit = `{
  const stored = localStorage.getItem("theme");
  const dark = stored ? stored === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark) document.documentElement.classList.add("dark");
}`;

export const metadata: Metadata = {
  title: site.title,
  metadataBase: new URL(site.url),
  alternates: { canonical: "/" },

  description: site.description,

  authors: [{ name: author.name, url: author.social.github }],

  openGraph: {
    title: site.title,
    description: site.description,
    images: [
      {
        url: author.image.src,
        alt: author.image.alt,
        width: author.image.width,
        height: author.image.height,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* suppressHydrationWarning: prevents mismatch caused by the
       theme-preload script toggling .dark before React mounts */
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />

        {/* Resource discovery links */}
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <link rel="author" type="text/plain" href="/humans.txt" />

        {/* JSON-LD: Person + WebSite structured data for rich search results */}
        <JsonLd
          json={JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: author.name,
            url: site.url,
            image: `${site.url}${author.image.src}`,
            jobTitle: author.jobTitle,
            alumniOf: author.education.map((name) => ({
              "@type": "CollegeOrUniversity",
              name,
            })),
            sameAs: Object.values(author.social),
          })}
        />
        <JsonLd
          json={JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.title,
            url: site.url,
          })}
        />
      </head>

      <body className={`${montserrat.className} ${jetbrainsMono.variable}`}>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to main content
          </a>
          <Header />
          <GridBackground />
          <main id="main-content" className="container overflow-x-hidden lg:px-28">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
        <GoatCounterScript />
      </body>
    </html>
  );
}
