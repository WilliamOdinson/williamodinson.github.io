"use client";

import { useState } from "react";
import Lightbox from "@/components/lightbox";

/**
 * Drop-in replacement for <img> inside MDX prose.
 * Clicking the image opens a full-screen lightbox.
 */
export default function MdxImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        alt={props.alt || ""}
        className="cursor-zoom-in rounded-lg transition-opacity hover:opacity-90"
        onClick={() => setOpen(true)}
      />
      <Lightbox
        src={props.src || ""}
        alt={props.alt}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
