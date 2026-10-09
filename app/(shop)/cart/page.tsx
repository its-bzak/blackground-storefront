import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { updateCartLine } from "@/lib/cart/actions";
import { getCartId } from "@/lib/session";
import { getCart } from "@/lib/shopify/cart";
import { formatMoney } from "@/lib/shopify/money";
import type { CartLine } from "@/lib/shopify/types";

export const metadata: Metadata = { title: "Bag" };

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-28 pt-10 md:px-10 md:pt-16">
      <h1 className="font-display text-[clamp(3rem,10vw,6rem)] leading-none">
        Bag
      </h1>
      <Suspense fallback={<p className="eyebrow mt-12 text-bone/50">Loading&hellip;</p>}>
        <CartContents />
      </Suspense>
    </main>
  );
}

async function CartContents() {
  const cartId = await getCartId();
  const cart = cartId ? await getCart(cartId) : null;

  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <div className="mt-12">
        <p className="text-bone/60">Your bag is empty.</p>
        <Link
          href="/collections/all"
          className="eyebrow mt-8 inline-block border-b border-bone/40 pb-1 transition-colors hover:border-gold hover:text-gold"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="mt-12 border-t border-bone/10">
        {cart.lines.nodes.map((line) => (
          <CartRow key={line.id} line={line} />
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-bone/50">Subtotal</p>
          <p className="mt-2 font-display text-4xl tabular-nums">
            {formatMoney(cart.cost.subtotalAmount)}
          </p>
          <p className="mt-2 text-sm text-bone/50">
            Shipping and taxes are calculated at checkout.
          </p>
        </div>
        {/* Shopify-hosted checkout, so a plain link rather than a client route. */}
        <a
          href={cart.checkoutUrl}
          className="eyebrow bg-gold px-10 py-4.5 text-center text-ink transition-colors hover:bg-bone"
        >
          Checkout
        </a>
      </div>
    </>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const { merchandise } = line;
  const href = `/products/${merchandise.product.handle}`;
  const stepper =
    "grid size-9 place-items-center border border-bone/20 transition-colors hover:border-gold hover:text-gold";

  return (
    <li className="flex gap-5 border-b border-bone/10 py-6">
      <Link href={href} className="relative block aspect-[4/5] w-24 shrink-0 bg-coal">
        {merchandise.image && (
          <Image
            src={merchandise.image.url}
            alt={merchandise.image.altText ?? merchandise.product.title}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-4">
          <Link href={href} className="eyebrow transition-colors hover:text-gold">
            {merchandise.product.title}
          </Link>
          <p className="shrink-0 text-sm tabular-nums text-bone/70">
            {formatMoney(line.cost.totalAmount)}
          </p>
        </div>
        {merchandise.title !== "Default Title" && (
          <p className="mt-2 text-sm text-bone/50">{merchandise.title}</p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-5 text-sm">
          <QuantityButton
            lineId={line.id}
            quantity={line.quantity - 1}
            label="Decrease quantity"
            className={stepper}
          >
            &minus;
          </QuantityButton>
          <span className="w-6 text-center tabular-nums" aria-label="Quantity">
            {line.quantity}
          </span>
          <QuantityButton
            lineId={line.id}
            quantity={line.quantity + 1}
            label="Increase quantity"
            className={stepper}
          >
            +
          </QuantityButton>
          <QuantityButton
            lineId={line.id}
            quantity={0}
            label={`Remove ${merchandise.product.title}`}
            className="eyebrow ml-auto text-bone/50 transition-colors hover:text-gold"
          >
            Remove
          </QuantityButton>
        </div>
      </div>
    </li>
  );
}

function QuantityButton({
  lineId,
  quantity,
  label,
  className,
  children,
}: {
  lineId: string;
  quantity: number;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={updateCartLine}>
      <input type="hidden" name="lineId" value={lineId} />
      <input type="hidden" name="quantity" value={quantity} />
      <button type="submit" aria-label={label} className={className}>
        {children}
      </button>
    </form>
  );
}
