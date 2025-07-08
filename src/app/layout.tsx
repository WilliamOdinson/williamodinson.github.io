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
        {/* theme detection */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var stored = localStorage.getItem('theme');
                var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                var theme = stored || system;
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (_) {}
            })();
          `}
        </Script>

        {/* Resource discovery links */}
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <link rel="author" type="text/plain" href="/humans.txt" />
        <link rel="robots" href="/robots.txt" />
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
