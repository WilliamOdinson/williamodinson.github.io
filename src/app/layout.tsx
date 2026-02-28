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

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yiqing Sun",
  metadataBase: new URL("https://williamodinson.github.io"),
  alternates: { canonical: "/" },

  description: "Yiqing Sun's personal portfolio website, 孙逸青的个人主页",

  authors: [
    { name: "Yiqing Sun", url: "https://github.com/williamodinson" },
    { name: "孙逸青", url: "https://github.com/williamodinson" },
  ],

  openGraph: {
    title: "Yiqing Sun",
    description: "Yiqing Sun's personal portfolio website, 孙逸青的个人主页",
    images: [
      {
        url: "/selfie.jpg",
        alt: "Yiqing Sun's Portrait",
        width: 640,
        height: 800,
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
                name: "Yiqing Sun",
                alternateName: "William Sun",
                url: "https://williamodinson.github.io",
                image: "https://williamodinson.github.io/selfie.jpg",
                jobTitle: "Software Engineer",
                alumniOf: [
                  {
                    "@type": "CollegeOrUniversity",
                    name: "Carnegie Mellon University",
                  },
                  {
                    "@type": "CollegeOrUniversity",
                    name: "Tianjin University",
                  },
                ],
                sameAs: [
                  "https://github.com/williamodinson",
                  "https://linkedin.com/in/williamodinson",
                  "https://x.com/william18652",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Yiqing Sun",
                url: "https://williamodinson.github.io",
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
