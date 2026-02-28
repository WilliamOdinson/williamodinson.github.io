/**
 * Header: Sticky top navigation bar.
 * Contains the site logo (custom font), nav links, and the dark-mode toggle.
 */
"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";

/** Custom calligraphic font used for the site logo only. */
const goldenSignature = localFont({
  src: "../assets/GoldenSignature.otf",
  display: "swap",
});

/** Top-level navigation entries. */
const nav = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
];

export default function Header() {
  return (
    <nav
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

        {/* Right side: nav links + theme toggle */}
        <div className="flex items-center gap-x-8">
          <div className="nav-links flex gap-x-8 font-semibold md:text-base">
            {nav.map(({ label, href }) => (
              <Link key={href} href={href} className="cursor-pointer">
                {label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
