"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

// Product images are resized by Shopify's CDN rather than the Next optimizer.
// Anything that isn't on that CDN is returned untouched.
export default function shopifyImageLoader({ src, width, quality }: LoaderArgs) {
  if (!src.startsWith("https://cdn.shopify.com/")) return src;

  const url = new URL(src);
  url.searchParams.set("width", String(width));
  if (quality) url.searchParams.set("quality", String(quality));
  return url.toString();
}
