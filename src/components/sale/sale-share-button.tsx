/**
 * SaleShareButton: Puts the item's canonical link on the clipboard, or hands
 * it to the native share sheet where one exists (phones, mostly), so a
 * listing can be dropped into a group chat in one tap.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  url: string;
  title: string;
};

export default function SaleShareButton({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* navigator.share only exists in the browser; decide after mount so the
     server-rendered markup matches the first client render. */
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const share = async () => {
    if (canShare) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        /* The user closed the sheet: nothing to do. Anything else falls back to copying. */
        if ((err as DOMException).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* No clipboard permission (older browsers, some webviews): show the link to copy by hand. */
      window.prompt("Copy this link", url);
    }
  };

  const Icon = copied ? Check : canShare ? Share2 : Link2;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={share}
      aria-live="polite"
      className="gap-2"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {copied ? "Link copied" : canShare ? "Share" : "Copy link"}
    </Button>
  );
}
