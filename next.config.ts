import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Every corner of the hero holds a link, so the dev badge has nowhere to sit.
  // Compile and runtime errors still show.
  devIndicators: false,
  images: {
    // Shopify's CDN resizes product images itself; see lib/shopify/image-loader.ts.
    loader: "custom",
    loaderFile: "./lib/shopify/image-loader.ts",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
