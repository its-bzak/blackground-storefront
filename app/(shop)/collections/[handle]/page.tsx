import type { Metadata } from "next";
import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import {
  CollectionToolbar,
  collectionHref,
} from "@/components/collection/CollectionToolbar";
import { ProductCard } from "@/components/collection/ProductCard";
import { getCollectionPage, parseSort } from "@/lib/shopify/products";

type Props = PageProps<"/collections/[handle]">;

// Editorial rhythm: a repeating run of six tiles on a 12-column grid, with
// uneven spans, skipped columns and staggered tops. Two columns on mobile,
// where the first and fourth tile of each run go full width.
const TILES = [
  { span: "col-span-2 md:col-span-6", sizes: "(min-width: 768px) 50vw, 100vw" },
  {
    span: "md:col-span-4 md:col-start-8 md:mt-32",
    sizes: "(min-width: 768px) 33vw, 50vw",
  },
  {
    span: "md:col-span-4 md:col-start-2",
    sizes: "(min-width: 768px) 33vw, 50vw",
  },
  {
    span: "col-span-2 md:col-span-5 md:col-start-7 md:mt-20",
    sizes: "(min-width: 768px) 42vw, 100vw",
  },
  { span: "md:col-span-5", sizes: "(min-width: 768px) 42vw, 50vw" },
  {
    span: "md:col-span-4 md:col-start-8 md:mt-28",
    sizes: "(min-width: 768px) 33vw, 50vw",
  },
] as const;

const GRID = "grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-12 md:gap-x-6 md:gap-y-24";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const collection = await getCollectionPage({
      handle,
      sort: "featured",
      filters: [],
      after: null,
    });
    return {
      title: collection?.title ?? "Shop",
      description: collection?.description || undefined,
    };
  } catch (error) {
    unstable_rethrow(error);
    return { title: "Shop" };
  }
}

export default function CollectionRoute(props: Props) {
  return (
    <main className="px-5 pb-28 pt-10 md:px-10 md:pt-16">
      <Suspense fallback={<CollectionSkeleton />}>
        <Collection params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

function toList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

async function Collection({
  params,
  searchParams,
}: Pick<Props, "params" | "searchParams">) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);

  const sort = parseSort(query.sort);
  const activeFilters = toList(query.filter);
  const after = typeof query.after === "string" ? query.after : null;

  const collection = await getCollectionPage({
    handle,
    sort,
    filters: activeFilters,
    after,
  });
  if (!collection) notFound();

  const base = `/collections/${encodeURIComponent(handle)}`;
  const { products, pageInfo } = collection;

  return (
    <>
      <header className="md:grid md:grid-cols-12 md:gap-x-6">
        <h1 className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95] md:col-span-7">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-6 max-w-md text-bone/60 md:col-span-4 md:col-start-9 md:mt-0 md:self-end">
            {collection.description}
          </p>
        )}
      </header>

      <CollectionToolbar
        base={base}
        sort={sort}
        activeFilters={activeFilters}
        filters={collection.filters}
      />

      {products.length === 0 ? (
        <p className="py-32 text-center text-bone/60">
          Nothing matches that selection.
        </p>
      ) : (
        <ul className={`mt-12 md:mt-20 ${GRID}`}>
          {products.map((product, index) => {
            const tile = TILES[index % TILES.length];
            return (
              <li key={product.id} className={tile.span}>
                <ProductCard
                  product={product}
                  sizes={tile.sizes}
                  eager={index === 0}
                />
              </li>
            );
          })}
        </ul>
      )}

      {(after || pageInfo.hasNextPage) && (
        <nav
          aria-label="Pages"
          className="eyebrow mt-24 flex justify-between border-t border-bone/10 pt-6"
        >
          {after ? (
            <Link
              href={collectionHref(base, { sort, filters: activeFilters })}
              className="text-bone/60 transition-colors hover:text-gold"
            >
              Back to start
            </Link>
          ) : (
            <span />
          )}
          {pageInfo.hasNextPage && pageInfo.endCursor && (
            <Link
              href={collectionHref(base, {
                sort,
                filters: activeFilters,
                after: pageInfo.endCursor,
              })}
              className="transition-colors hover:text-gold"
            >
              Next page
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

function CollectionSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading collection">
      <div className="h-[clamp(3rem,10vw,7rem)] w-2/5 bg-coal" />
      <div className="mt-10 h-14 border-y border-bone/10" />
      <ul className={`mt-12 md:mt-20 ${GRID}`}>
        {TILES.map((tile) => (
          <li key={tile.span} className={tile.span}>
            <div className="aspect-[4/5] bg-coal" />
            <div className="mt-4 h-4 w-1/2 bg-coal" />
          </li>
        ))}
      </ul>
    </div>
  );
}
