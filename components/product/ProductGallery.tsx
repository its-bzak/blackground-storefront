"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import type { ShopImage } from "@/lib/shopify/types";

// Desktop: a tall column of full-size images that scrolls past the pinned
// details. Mobile: the same markup becomes a swipeable snap carousel.
export function ProductGallery({
  images,
  title,
}: {
  images: ShopImage[];
  title: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const last = Math.max(0, images.length - 1);

  const { scrollXProgress } = useScroll({ container: trackRef });
  useMotionValueEvent(scrollXProgress, "change", (value) => {
    setCurrent(Math.round(value * last));
  });

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar relative flex snap-x snap-mandatory overflow-x-auto md:block md:space-y-2 md:overflow-visible"
      >
        {images.length === 0 && <div className="aspect-[4/5] w-full bg-coal" />}

        {images.map((image, index) => (
          // Height is capped on small screens so the title shows below the image.
          <div
            key={image.url}
            className="aspect-[4/5] max-h-[55svh] w-full shrink-0 snap-center bg-coal md:aspect-auto md:max-h-none"
          >
            <Image
              src={image.url}
              alt={image.altText ?? title}
              width={image.width ?? 1600}
              height={image.height ?? 2000}
              sizes="(min-width: 768px) 58vw, 100vw"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              className="h-full w-full object-cover md:h-auto"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <p
          aria-hidden
          className="eyebrow absolute bottom-4 right-5 bg-ink/70 px-2.5 py-1 tabular-nums md:hidden"
        >
          {current + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
