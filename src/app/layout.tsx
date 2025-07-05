import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/header";
import BackToTop from "@/components/back-to-top";
import GridBackground from "@/components/grid-background";

const montserrat = Montserrat({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Yiqing Sun",
  metadataBase: new URL("https://williamodinson.github.io"),
  alternates: {
    canonical: "/",
  },
  authors: [
    { name: "Yiqing Sun", url: "https://github.com/williamodinson" },
    { name: "孙逸青", url: "https://github.com/williamodinson" },
  ],
  description: "Yiqing Sun's personal portfolio website, 孙逸青的个人主页",
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
    <html lang="en">
      <body className={montserrat.className}>
        <Header />
        <GridBackground />
        <main className="container overflow-x-hidden pt-20 lg:px-28">
          {children}
        </main>
        <BackToTop />
      </body>
    </html>
  );
}
