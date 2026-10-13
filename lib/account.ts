import "server-only";

import {
  clearCustomerSession,
  getCustomerSession,
  setCustomerSession,
} from "@/lib/session";
import { getCustomer, refreshTokens } from "@/lib/shopify/customer";
import type { Customer } from "@/lib/shopify/types";
import { siteOrigin } from "@/lib/site";

// Who is signed in. Access tokens are short-lived and renewing one means
// writing cookies, which a Server Component can't do. So pages read with
// readCustomer and send a lapsed session through /account/refresh, while Route
// Handlers and Server Functions use resolveCustomer, which renews in place.

// For rendering. `lapsed` means the session can probably be renewed.
export async function readCustomer(): Promise<{
  customer: Customer | null;
  lapsed: boolean;
}> {
  const { accessToken, refreshToken } = await getCustomerSession();
  const customer = accessToken ? await getCustomer(accessToken) : null;
  return { customer, lapsed: !customer && Boolean(refreshToken) };
}

// Trades the refresh token for a new access token. A session that can't be
// renewed is cleared, so the visitor is simply signed out.
export async function renewSession(): Promise<string | null> {
  const { refreshToken } = await getCustomerSession();
  if (!refreshToken) return null;

  try {
    const tokens = await refreshTokens(await siteOrigin(), refreshToken);
    await setCustomerSession(tokens);
    return tokens.accessToken;
  } catch (error) {
    console.error("Renewing the customer session failed", error);
    await clearCustomerSession();
    return null;
  }
}

// For Route Handlers and Server Functions only: it may set cookies.
export async function resolveCustomer(): Promise<Customer | null> {
  const { accessToken } = await getCustomerSession();
  if (accessToken) {
    const customer = await getCustomer(accessToken);
    if (customer) return customer;
  }

  const renewed = await renewSession();
  return renewed ? getCustomer(renewed) : null;
}
