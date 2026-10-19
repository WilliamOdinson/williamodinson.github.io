/**
 * SaleGallery: Photo viewer for an item page.
 *
 * Shows the selected photo large, with a thumbnail strip underneath when there
 * is more than one. Clicking the large photo opens the Lightbox, which steps
 * through the same set with its arrows and the Left and Right keys. With no
 * photos at all a placeholder keeps the layout intact.
 */
"use client";

import { useCallback, useState } from "react";
import { ImageOff, ZoomIn } from "lucide-react";
import Lightbox from "@/components/lightbox";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  title: string;
  sold?: boolean;
};

export default function SaleGallery({ images, title, sold = false }: Props) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  if (count === 0) {
    return (
      <div
        className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl bg-secondary text-muted-foreground"
        role="img"
        aria-label={`${title}: no photos yet`}
      >
        <ImageOff className="h-8 w-8" aria-hidden="true" />
        <span className="text-sm">No photos yet</span>
      </div>
    );
  }

  const current = images[index];
  const altFor = (i: number) =>
    count > 1 ? `${title}, photo ${i + 1} of ${count}` : title;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open photo ${index + 1} of ${count} full size`}
        className={cn(
          "group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-secondary",
          "cursor-zoom-in focus-ring",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={altFor(index)}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]",
            sold && "grayscale",
          )}
          fetchPriority="high"
        />
        <span
          className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          <ZoomIn className="h-4 w-4" />
        </span>
        {sold && (
          <span
            className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white"
            aria-hidden="true"
          >
            Sold
          </span>
        )}
      </button>

      {count > 1 && (
        <ul
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label="Photo thumbnails"
        >
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "block h-16 w-20 overflow-hidden rounded-md bg-secondary ring-offset-2 ring-offset-background transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  i === index
                    ? "ring-2 ring-foreground"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Lightbox
        src={current}
        alt={altFor(index)}
        open={open}
        onClose={() => setOpen(false)}
        onPrev={count > 1 ? prev : undefined}
        onNext={count > 1 ? next : undefined}
        counter={count > 1 ? `${index + 1} / ${count}` : undefined}
      />
    </div>
  );
}
