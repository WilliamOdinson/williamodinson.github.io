"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";

const goldenSignature = localFont({
  src: "../assets/GoldenSignature.otf",
  display: "swap",
});

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
      {/* Container keeps content centered and sets row layout on md+ screens */}
      <div className="container flex flex-col items-center justify-between md:flex-row">
        {/* Logo / site title */}
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

          {/* Dark / light switch */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
