import type { MetadataRoute } from "next";

import { getSitemapEntries } from "@/lib/shopify/content";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

// Addresses that don't come from the store's catalogue or pages.
const FIXED = ["/", "/collections/all", "/quiz"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();

  return [
    ...FIXED.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...(CONTACT_EMAIL ? [{ url: `${SITE_URL}/pages/contact` }] : []),
    ...entries.map(({ path, updatedAt }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: updatedAt,
    })),
  ];
}
