import "server-only";
import { cookies } from "next/headers";

const CUSTOMER_COOKIE = "bg_customer";
const CART_COOKIE = "bg_cart";

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function getCustomerToken(): Promise<string | undefined> {
  return (await cookies()).get(CUSTOMER_COOKIE)?.value;
}

// expiresAt is the ISO timestamp Shopify returns with the access token.
export async function setCustomerToken(token: string, expiresAt: string) {
  (await cookies()).set(CUSTOMER_COOKIE, token, {
    ...baseOptions,
    expires: new Date(expiresAt),
  });
}

export async function clearCustomerToken() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export async function getCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

export async function setCartId(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    ...baseOptions,
    maxAge: 60 * 60 * 24 * 14,
  });
}
