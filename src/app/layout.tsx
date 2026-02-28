/**
 * RootLayout: Top-level layout wrapping every page.
 *
 * Responsibilities:
 *  - Loads the Montserrat font globally.
 *  - Injects a `<script>` to detect the user's theme before first paint
 *    (prevents dark-mode flash on reload).
 *  - Renders the shared Header, Footer, GridBackground, and BackToTop.
 *  - Provides the ThemeProvider context to all children.
 */
import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import Header from "@/components/header";
import BackToTop from "@/components/back-to-top";
import GridBackground from "@/components/grid-background";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import Footer from "@/components/footer";
import { author, site } from "@/lib/site.config.mjs";

const montserrat = Montserrat({ subsets: ["latin"] });

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
        {/* Detect stored/system theme before first paint to avoid flash */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                const stored = localStorage.getItem('theme');
                const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const theme = stored || system;
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (_) {}
            })();
          `}
        </Script>

        {/* Resource discovery links */}
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <link rel="author" type="text/plain" href="/humans.txt" />
        <link rel="robots" href="/robots.txt" />

        {/* JSON-LD: Person + WebSite structured data for rich search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
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
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: site.title,
                url: site.url,
              },
            ]),
          }}
        />
      </head>

      <body className={montserrat.className}>
        <ThemeProvider>
          <Header />
          <GridBackground />
          <main className="container overflow-x-hidden pt-20 lg:px-28">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
