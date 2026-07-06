/**
 * Header: Sticky top navigation bar.
 * Contains the site logo (custom font), nav links, source link, and the dark-mode toggle.
 */
"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";

/** Custom calligraphic font used for the site logo only. */
const goldenSignature = localFont({
  src: "../assets/GoldenSignature.otf",
  display: "swap",
});

/** Top-level navigation entries. */
const nav = [
  { label: "Blogs", href: "/blog" },
];

export default function Header() {
  return (
    <nav
      aria-label="Main navigation"
      className="
        fixed left-0 top-0 z-50 flex w-full select-none justify-center
        bg-background/80 py-4 font-light backdrop-blur md:px-28
      "
    >
      <div className="container flex flex-col items-center justify-between md:flex-row">
        {/* Logo */}
        <div
          className={cn("text-5xl drop-shadow-2xl", goldenSignature.className)}
        >
          <Link href="/">William Sun</Link>
        </div>

        {/* Right side: nav links + source code link + theme toggle */}
        <div className="flex items-center gap-x-4">
          <div className="nav-links flex gap-x-8 font-semibold text-xl">
            {nav.map(({ label, href }) => (
              <Link key={href} href={href} className="cursor-pointer">
                {label}
              </Link>
            ))}
          </div>
          <Link
            href="https://github.com/WilliamOdinson/williamodinson.github.io"
            target="_blank"
            rel="noreferrer"
          >
            <div
              className={buttonVariants({
                size: "icon",
                variant: "ghost",
              })}
            >
              <ExternalLink className="h-6 w-6" strokeWidth={2.5} />
              <span className="sr-only">View source</span>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
