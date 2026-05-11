"use client";

/**
 * Custom 404 page that also handles case-insensitive routing.
 *
 * On a static GitHub Pages site, visiting `/Blog` returns 404.
 * This page detects uppercase letters in the path and redirects
 * to the lowercase version. If the path is already lowercase
 * (a genuine 404), it shows the normal "Not Found" UI.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  const [showNotFound, setShowNotFound] = useState(false);

  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const lowered = pathname.toLowerCase();

    if (lowered !== pathname) {
      // Path has uppercase letters — redirect to lowercase equivalent
      window.location.replace(lowered + search + hash);
    } else {
      // Already lowercase — this is a genuine 404
      setShowNotFound(true);
    }
  }, []);

  if (!showNotFound) {
    // While potentially redirecting, show nothing (avoids flash)
    return null;
  }

  return (
    <section className="flex h-[calc(100vh_-_90px)] w-full flex-col items-center justify-center gap-4">
      <h2>404 Not Found</h2>
      <p>Could not find requested resource</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </section>
  );
}
