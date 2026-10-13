import "server-only";

import { buyerIp } from "./buyer";
import { ShopifyError, storefront, type UserError } from "./client";
import type { Cart } from "./types";

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image { url altText width height }
            product { handle title }
          }
        }
      }
    }
  }
`;

const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!) {
    cart(id: $id) { ...CartFields }
  }
  ${CART_FRAGMENT}
`;

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_ADD = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_UPDATE = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_LINES_REMOVE = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const CART_BUYER_IDENTITY_UPDATE = /* GraphQL */ `
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { id }
      userErrors { field message }
    }
  }
`;

type CartPayload = { cart: Cart | null; userErrors: UserError[] } | null;

// Cart requests are made on a shopper's behalf, so they carry the shopper's IP.
async function cartRequest<T>(query: string, variables: Record<string, unknown>) {
  return storefront<T>(query, variables, { buyerIp: await buyerIp() });
}

function unwrap(payload: CartPayload): Cart {
  if (payload?.userErrors.length) {
    throw new ShopifyError(payload.userErrors.map((e) => e.message).join("; "));
  }
  if (!payload?.cart) throw new ShopifyError("Shopify did not return a cart");
  return payload.cart;
}

export type NewCartLine = { merchandiseId: string; quantity: number };

// Null when the cart has expired or already been checked out.
export async function getCart(id: string): Promise<Cart | null> {
  const data = await cartRequest<{ cart: Cart | null }>(CART_QUERY, { id });
  return data.cart;
}

export async function createCart(lines: NewCartLine[]): Promise<Cart> {
  const data = await cartRequest<{ cartCreate: CartPayload }>(CART_CREATE, {
    lines,
  });
  return unwrap(data.cartCreate);
}

export async function addCartLines(
  cartId: string,
  lines: NewCartLine[],
): Promise<Cart> {
  const data = await cartRequest<{ cartLinesAdd: CartPayload }>(CART_LINES_ADD, {
    cartId,
    lines,
  });
  return unwrap(data.cartLinesAdd);
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<Cart> {
  const data = await cartRequest<{ cartLinesUpdate: CartPayload }>(
    CART_LINES_UPDATE,
    { cartId, lines },
  );
  return unwrap(data.cartLinesUpdate);
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<Cart> {
  const data = await cartRequest<{ cartLinesRemove: CartPayload }>(
    CART_LINES_REMOVE,
    { cartId, lineIds },
  );
  return unwrap(data.cartLinesRemove);
}

// Ties the bag to a signed-in customer so checkout recognises them. Passing
// null unties it again.
export async function setCartCustomer(
  cartId: string,
  customerAccessToken: string | null,
): Promise<void> {
  const data = await cartRequest<{
    cartBuyerIdentityUpdate: { userErrors: UserError[] } | null;
  }>(CART_BUYER_IDENTITY_UPDATE, {
    cartId,
    buyerIdentity: { customerAccessToken },
  });

  const errors = data.cartBuyerIdentityUpdate?.userErrors ?? [];
  if (errors.length > 0) {
    throw new ShopifyError(errors.map((e) => e.message).join("; "));
  }
}
