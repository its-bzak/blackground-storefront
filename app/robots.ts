import type { MetadataRoute } from "next";

import { INDEXABLE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Per-visitor pages with nothing to index.
      disallow: ["/account", "/api/", "/cart"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
