"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { addToCart, type AddToCartState } from "@/lib/cart/actions";
import { formatMoney, isDiscounted } from "@/lib/shopify/money";
import type { Product, ProductVariant } from "@/lib/shopify/types";

type Selection = Record<string, string>;

function toSelection(variant: ProductVariant | undefined): Selection {
  return Object.fromEntries(
    (variant?.selectedOptions ?? []).map((option) => [option.name, option.value]),
  );
}

function matches(variant: ProductVariant, selection: Selection): boolean {
  return variant.selectedOptions.every(
    (option) => selection[option.name] === option.value,
  );
}

const INITIAL: AddToCartState = { status: "idle" };

export function ProductForm({
  product,
}: {
  product: Pick<Product, "options" | "variants" | "priceRange">;
}) {
  const variants = product.variants.nodes;
  const [selection, setSelection] = useState<Selection>(() =>
    toSelection(variants.find((v) => v.availableForSale) ?? variants[0]),
  );
  const [state, formAction, pending] = useActionState(addToCart, INITIAL);

  const variant = variants.find((v) => matches(v, selection)) ?? null;
  const price = variant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = variant?.compareAtPrice ?? null;

  // A product with no real options still has one "Default Title" variant.
  const hasChoices = variants.length > 1;

  // Would picking this value, with everything else as it is, be buyable?
  const canBuy = (name: string, value: string) =>
    variants.some(
      (v) => v.availableForSale && matches(v, { ...selection, [name]: value }),
    );

  const label = pending
    ? "Adding…"
    : !variant
      ? "Unavailable"
      : !variant.availableForSale
        ? "Sold out"
        : "Add to bag";

  return (
    <form action={formAction}>
      <p className="mt-4 text-lg tabular-nums text-bone/80">
        {isDiscounted(price, compareAt) && compareAt && (
          <s className="mr-3 text-bone/35">{formatMoney(compareAt)}</s>
        )}
        {formatMoney(price)}
      </p>

      {hasChoices &&
        product.options.map((option) => (
          <fieldset key={option.id} className="mt-8">
            <legend className="eyebrow text-bone/50">
              {option.name}
              <span className="ml-3 text-bone">{selection[option.name]}</span>
            </legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const available = canBuy(option.name, value.name);
                return (
                  <label key={value.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`option-${option.name}`}
                      value={value.name}
                      checked={selection[option.name] === value.name}
                      onChange={() =>
                        setSelection({ ...selection, [option.name]: value.name })
                      }
                      className="peer sr-only"
                    />
                    <span
                      className={`eyebrow block min-w-12 border border-bone/20 px-4 py-3 text-center transition-colors hover:border-bone/60 peer-checked:border-gold peer-checked:text-gold peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-gold ${
                        available ? "" : "text-bone/30 line-through"
                      }`}
                    >
                      {value.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

      <input type="hidden" name="merchandiseId" value={variant?.id ?? ""} />

      {/* Small screens: fixed to the bottom edge, so the button is in reach from
          the first paint however tall the gallery is. From md it sits in the
          pinned details column instead. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-bone/10 bg-ink/95 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:static md:z-auto md:mt-10 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <button
          type="submit"
          disabled={pending || !variant?.availableForSale}
          className="eyebrow w-full bg-gold px-8 py-4.5 text-ink transition-colors hover:bg-bone disabled:pointer-events-none disabled:bg-bone/10 disabled:text-bone/40"
        >
          {label}
        </button>

        <p
          role="status"
          className="eyebrow mt-3 text-bone/60 empty:hidden md:mt-4 md:min-h-4 md:empty:block"
        >
          {state.status === "added" && !pending && (
            <>
              Added to your bag.{" "}
              <Link
                href="/cart"
                className="border-b border-gold/60 pb-0.5 text-gold"
              >
                View bag
              </Link>
            </>
          )}
          {state.status === "error" && !pending && state.message}
        </p>
      </div>
    </form>
  );
}
