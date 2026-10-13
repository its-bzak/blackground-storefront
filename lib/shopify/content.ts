import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { hasContent } from "@/lib/html";

import { storefront } from "./client";
import { getContentPage } from "./products";
import type { ContentPage, Policy } from "./types";

// Pages whose text still sits under an older handle in the store. The clean
// address serves that text until the page under its own handle is filled in.
const PAGE_FALLBACKS: Record<string, string> = { about: "about-1" };

// Handles that have their own route here, or redirect (see next.config.ts).
const NOT_LISTED = new Set(["contact", ...Object.values(PAGE_FALLBACKS)]);

// Null for a page with no text of its own. The old theme's templates supplied
// the content for many of the store's pages, and here those would render as a
// bare title.
export async function getPage(handle: string): Promise<ContentPage | null> {
  const page = await getContentPage(handle);
  if (page && hasContent(page.body)) return page;

  const fallback = PAGE_FALLBACKS[handle];
  if (!fallback) return null;
  const older = await getContentPage(fallback);
  return older && hasContent(older.body) ? older : null;
}

const POLICIES_QUERY = /* GraphQL */ `
  query Policies {
    shop {
      privacyPolicy { handle title body }
      refundPolicy { handle title body }
      shippingPolicy { handle title body }
      termsOfService { handle title body }
    }
  }
`;

// Only the policies the store has actually written.
export async function getPolicies(): Promise<Policy[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("pages");

  const data = await storefront<{ shop: Record<string, Policy | null> }>(
    POLICIES_QUERY,
  );
  return Object.values(data.shop).filter(
    (policy): policy is Policy => policy !== null && hasContent(policy.body),
  );
}

const SITEMAP_QUERY = /* GraphQL */ `
  query Sitemap {
    products(first: 250) {
      nodes { handle updatedAt }
    }
    collections(first: 250) {
      nodes {
        handle
        updatedAt
        products(first: 1) { nodes { id } }
      }
    }
    pages(first: 250) {
      nodes { handle updatedAt body }
    }
  }
`;

type SitemapData = {
  products: { nodes: { handle: string; updatedAt: string }[] };
  collections: {
    nodes: {
      handle: string;
      updatedAt: string;
      products: { nodes: { id: string }[] };
    }[];
  };
  pages: { nodes: { handle: string; updatedAt: string; body: string }[] };
};

export type SitemapEntry = { path: string; updatedAt?: string };

// Every address worth a search engine's time: products, collections that have
// something in them, and pages and policies that have text.
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "pages");

  const [data, policies] = await Promise.all([
    storefront<SitemapData>(SITEMAP_QUERY),
    getPolicies(),
  ]);

  const written = new Map(
    data.pages.nodes
      .filter((page) => hasContent(page.body))
      .map((page) => [page.handle, page.updatedAt]),
  );
  // A fallback's text is published at the clean address instead.
  for (const [handle, fallback] of Object.entries(PAGE_FALLBACKS)) {
    const updatedAt = written.get(fallback);
    if (!written.has(handle) && updatedAt) written.set(handle, updatedAt);
  }

  return [
    ...data.products.nodes.map(({ handle, updatedAt }) => ({
      path: `/products/${handle}`,
      updatedAt,
    })),
    ...data.collections.nodes
      .filter((collection) => collection.products.nodes.length > 0)
      .map(({ handle, updatedAt }) => ({
        path: `/collections/${handle}`,
        updatedAt,
      })),
    ...[...written]
      .filter(([handle]) => !NOT_LISTED.has(handle))
      .map(([handle, updatedAt]) => ({ path: `/pages/${handle}`, updatedAt })),
    ...policies.map(({ handle }) => ({ path: `/policies/${handle}` })),
  ];
}
