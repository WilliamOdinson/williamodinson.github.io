"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

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
    <>
      <nav className="justify-centerpy-2 flex w-full select-none pt-6 font-light md:px-28 md:pb-2">
        <div className="container flex flex-col items-center justify-between md:flex-row">
          <div
            className={cn(
              "text-5xl drop-shadow-2xl",
              goldenSignature.className,
            )}
          >
            <Link href="/">William Sun</Link>
          </div>

          <div className="nav-links flex gap-x-8 text-xs md:text-base">
            {nav.map(({ label, href }) => (
              <Link key={href} href={href} className="cursor-pointer">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
