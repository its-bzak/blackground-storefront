import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { getCartId } from "@/lib/session";
import { getCart } from "@/lib/shopify/cart";

// "Bag" is part of the static shell; the count streams in from the cart cookie.
export function BagLink({ className }: { className?: string }) {
  return (
    <Link href="/cart" className={className}>
      Bag
      <Suspense fallback={null}>
        <BagCount />
      </Suspense>
    </Link>
  );
}

async function BagCount() {
  const cartId = await getCartId();
  if (!cartId) return null;

  let quantity = 0;
  try {
    quantity = (await getCart(cartId))?.totalQuantity ?? 0;
  } catch (error) {
    unstable_rethrow(error);
    // A count that can't be read shouldn't take the header down with it.
    return null;
  }

  if (quantity === 0) return null;
  return <span className="tabular-nums"> ({quantity})</span>;
}
