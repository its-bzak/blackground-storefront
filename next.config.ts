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
  // Addresses from the old Shopify theme that have moved. Old pages with no
  // equivalent here are left to return not-found.
  async redirects() {
    return [
      { source: "/pages/about-1", destination: "/pages/about", permanent: true },
      { source: "/pages/blackground-check", destination: "/quiz", permanent: true },
      { source: "/pages/archetypes", destination: "/", permanent: true },
      { source: "/collections", destination: "/collections/all", permanent: true },
      { source: "/products", destination: "/collections/all", permanent: true },
      // Shopify themes also list each product under every collection it's in.
      {
        source: "/collections/:collection/products/:handle",
        destination: "/products/:handle",
        permanent: true,
      },
      { source: "/collections/vendors", destination: "/collections/all", permanent: false },
      { source: "/search", destination: "/collections/all", permanent: false },
      { source: "/account/register", destination: "/account", permanent: false },
    ];
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
