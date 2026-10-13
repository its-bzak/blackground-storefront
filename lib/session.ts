import "server-only";
import { cookies } from "next/headers";

import type { Tokens } from "@/lib/shopify/oauth";

const CUSTOMER_COOKIE = "bg_customer";
const REFRESH_COOKIE = "bg_customer_refresh";
const ID_TOKEN_COOKIE = "bg_customer_id";
const LOGIN_COOKIE = "bg_login";
const CART_COOKIE = "bg_cart";

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

// Shopify doesn't publish how long a refresh token lasts. When it stops
// working the customer signs in again.
const REMEMBER_FOR = 60 * 60 * 24 * 30;

export type CustomerSession = {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
};

export async function getCustomerSession(): Promise<CustomerSession> {
  const store = await cookies();
  return {
    accessToken: store.get(CUSTOMER_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
    idToken: store.get(ID_TOKEN_COOKIE)?.value,
  };
}

// A renewal can come back without a new refresh or id token; the ones already
// stored stay in that case.
export async function setCustomerSession(tokens: Tokens) {
  const store = await cookies();
  // The cookie goes a minute before the token does, so it is never sent stale.
  store.set(CUSTOMER_COOKIE, tokens.accessToken, {
    ...baseOptions,
    maxAge: Math.max(0, tokens.expiresIn - 60),
  });
  if (tokens.refreshToken) {
    store.set(REFRESH_COOKIE, tokens.refreshToken, {
      ...baseOptions,
      maxAge: REMEMBER_FOR,
    });
  }
  if (tokens.idToken) {
    store.set(ID_TOKEN_COOKIE, tokens.idToken, {
      ...baseOptions,
      maxAge: REMEMBER_FOR,
    });
  }
}

export async function clearCustomerSession() {
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(ID_TOKEN_COOKIE);
}

// What a sign-in in progress needs back when Shopify returns the visitor.
export type PendingLogin = {
  state: string;
  nonce: string;
  verifier: string;
  next: string;
};

export async function setPendingLogin(pending: PendingLogin) {
  (await cookies()).set(LOGIN_COOKIE, JSON.stringify(pending), {
    ...baseOptions,
    maxAge: 60 * 10,
  });
}

// Single use: reading it also removes it.
export async function takePendingLogin(): Promise<PendingLogin | null> {
  const store = await cookies();
  const raw = store.get(LOGIN_COOKIE)?.value;
  if (!raw) return null;
  store.delete(LOGIN_COOKIE);

  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { state, nonce, verifier, next } = value as Record<string, unknown>;
    if (
      typeof state !== "string" ||
      typeof nonce !== "string" ||
      typeof verifier !== "string" ||
      typeof next !== "string"
    ) {
      return null;
    }
    return { state, nonce, verifier, next };
  } catch {
    return null;
  }
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
