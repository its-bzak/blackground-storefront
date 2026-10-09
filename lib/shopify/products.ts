import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { storefront } from "./client";
import type {
  CollectionFilter,
  CollectionPage,
  ContentPage,
  PageInfo,
  Product,
  ProductCardData,
} from "./types";

const PAGE_SIZE = 24;

const IMAGE_FIELDS = /* GraphQL */ `
  url
  altText
  width
  height
`;

const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    handle
    title
    availableForSale
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    featuredImage { ${IMAGE_FIELDS} }
    # First two images: the second one is the hover swap.
    images(first: 2) {
      nodes { ${IMAGE_FIELDS} }
    }
  }
`;

const COLLECTION_QUERY = /* GraphQL */ `
  query CollectionPage(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      title
      description
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        filters {
          id
          label
          type
          values { id label count input }
        }
        pageInfo { hasNextPage endCursor }
        nodes { ...ProductCard }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

const CATALOG_QUERY = /* GraphQL */ `
  query Catalog(
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      pageInfo { hasNextPage endCursor }
      nodes { ...ProductCard }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      descriptionHtml
      availableForSale
      priceRange {
        minVariantPrice { amount currencyCode }
      }
      seo { title description }
      featuredImage { ${IMAGE_FIELDS} }
      images(first: 20) {
        nodes { ${IMAGE_FIELDS} }
      }
      options {
        id
        name
        optionValues { id name }
      }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
        }
      }
    }
  }
`;

const PAGE_QUERY = /* GraphQL */ `
  query ContentPage($handle: String!) {
    page(handle: $handle) {
      title
      body
      seo { title description }
    }
  }
`;

export const SORT_KEYS = ["featured", "newest", "price-asc", "price-desc"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

type SortArgs = { sortKey: string; reverse: boolean };

// The collection and whole-catalog connections use different sort enums.
const SORTS: Record<SortKey, { label: string; collection: SortArgs; catalog: SortArgs }> = {
  featured: {
    label: "Featured",
    collection: { sortKey: "COLLECTION_DEFAULT", reverse: false },
    catalog: { sortKey: "BEST_SELLING", reverse: false },
  },
  newest: {
    label: "Newest",
    collection: { sortKey: "CREATED", reverse: true },
    catalog: { sortKey: "CREATED_AT", reverse: true },
  },
  "price-asc": {
    label: "Price, low to high",
    collection: { sortKey: "PRICE", reverse: false },
    catalog: { sortKey: "PRICE", reverse: false },
  },
  "price-desc": {
    label: "Price, high to low",
    collection: { sortKey: "PRICE", reverse: true },
    catalog: { sortKey: "PRICE", reverse: true },
  },
};

export const SORT_LABELS: Record<SortKey, string> = {
  featured: SORTS.featured.label,
  newest: SORTS.newest.label,
  "price-asc": SORTS["price-asc"].label,
  "price-desc": SORTS["price-desc"].label,
};

export function parseSort(value: unknown): SortKey {
  return (SORT_KEYS as readonly unknown[]).includes(value)
    ? (value as SortKey)
    : "featured";
}

const FILTER_KEYS = new Set([
  "available",
  "category",
  "price",
  "productMetafield",
  "productType",
  "productVendor",
  "tag",
  "taxonomyMetafield",
  "variantMetafield",
  "variantOption",
]);

// ?filter= carries the JSON Shopify handed out in filters.values.input. Anything
// that isn't a single known ProductFilter key is dropped instead of sent on.
function parseFilters(inputs: string[]): Record<string, unknown>[] {
  const filters: Record<string, unknown>[] = [];
  for (const input of inputs) {
    try {
      const parsed: unknown = JSON.parse(input);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        continue;
      }
      const keys = Object.keys(parsed);
      if (keys.length === 1 && FILTER_KEYS.has(keys[0])) {
        filters.push(parsed as Record<string, unknown>);
      }
    } catch {
      // Not JSON; ignore it.
    }
  }
  return filters;
}

type CollectionArgs = {
  handle: string;
  sort: SortKey;
  filters: string[];
  after: string | null;
};

type RawFilter = Omit<CollectionFilter, "values"> & {
  values: { id: string; label: string; count: number; input: unknown }[];
};

type CollectionData = {
  collection: {
    title: string;
    description: string;
    products: {
      filters: RawFilter[];
      pageInfo: PageInfo;
      nodes: ProductCardData[];
    };
  } | null;
};

type CatalogData = {
  products: { pageInfo: PageInfo; nodes: ProductCardData[] };
};

export async function getCollectionPage({
  handle,
  sort,
  filters,
  after,
}: CollectionArgs): Promise<CollectionPage | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const data = await storefront<CollectionData>(COLLECTION_QUERY, {
    handle,
    first: PAGE_SIZE,
    after,
    ...SORTS[sort].collection,
    filters: parseFilters(filters),
  });

  if (data.collection) {
    const { title, description, products } = data.collection;
    return {
      title,
      description,
      products: products.nodes,
      pageInfo: products.pageInfo,
      filters: products.filters.map((filter) => ({
        ...filter,
        values: filter.values.map((value) => ({
          ...value,
          input:
            typeof value.input === "string"
              ? value.input
              : JSON.stringify(value.input),
        })),
      })),
    };
  }

  // /collections/all only exists in the Storefront API if the merchant made a
  // collection with that handle. Otherwise list the whole catalog (no filters).
  if (handle !== "all") return null;

  const catalog = await storefront<CatalogData>(CATALOG_QUERY, {
    first: PAGE_SIZE,
    after,
    ...SORTS[sort].catalog,
  });

  return {
    title: "Shop",
    description: "",
    products: catalog.products.nodes,
    pageInfo: catalog.products.pageInfo,
    filters: [],
  };
}

export async function getProduct(handle: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const data = await storefront<{ product: Product | null }>(PRODUCT_QUERY, {
    handle,
  });
  return data.product;
}

export async function getContentPage(handle: string): Promise<ContentPage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("pages");

  const data = await storefront<{ page: ContentPage | null }>(PAGE_QUERY, {
    handle,
  });
  return data.page;
}
