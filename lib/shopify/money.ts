import type { Money } from "./types";

// Whole amounts drop the cents: $240, but $240.50 keeps them.
export function formatMoney({ amount, currencyCode }: Money): string {
  const value = Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function isDiscounted(price: Money, compareAt: Money | null): boolean {
  return compareAt !== null && Number(compareAt.amount) > Number(price.amount);
}
