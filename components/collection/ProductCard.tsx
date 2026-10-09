import Image from "next/image";
import Link from "next/link";

import { formatMoney, isDiscounted } from "@/lib/shopify/money";
import type { ProductCardData } from "@/lib/shopify/types";

type Props = {
  product: ProductCardData;
  // Matches the tile's column span so the browser picks the right width.
  sizes: string;
  // True for the first tile, which is above the fold.
  eager?: boolean;
};

export function ProductCard({ product, sizes, eager = false }: Props) {
  const primary = product.featuredImage ?? product.images.nodes[0] ?? null;
  // Second image fades in on hover, where there is one.
  const secondary =
    product.images.nodes.find((image) => image.url !== primary?.url) ?? null;

  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;

  return (
    <Link href={`/products/${product.handle}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-coal">
        {primary && (
          <Image
            src={primary.url}
            alt={primary.altText ?? product.title}
            fill
            sizes={sizes}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            className="object-cover"
          />
        )}
        {secondary && (
          <Image
            src={secondary.url}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-700 ease-editorial group-hover:opacity-100 group-focus-visible:opacity-100"
          />
        )}
        {!product.availableForSale && (
          <span className="eyebrow absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-bone/80">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h2 className="eyebrow text-bone transition-colors group-hover:text-gold">
          {product.title}
        </h2>
        <p className="shrink-0 text-sm text-bone/60 tabular-nums">
          {isDiscounted(price, compareAt) && (
            <s className="mr-2 text-bone/35">{formatMoney(compareAt)}</s>
          )}
          {formatMoney(price)}
        </p>
      </div>
    </Link>
  );
}
