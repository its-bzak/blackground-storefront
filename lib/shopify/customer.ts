import "server-only";
import { cacheLife } from "next/cache";

import { ShopifyError, storeDomain } from "./client";
import {
  USER_AGENT,
  parseTokens,
  tokenRequest,
  type OAuthClient,
  type TokenGrant,
  type Tokens,
} from "./oauth";
import type { Customer } from "./types";

// New customer accounts: Shopify hosts the sign-in page, where a customer
// enters a one-time code sent to their email, and this app then talks to the
// Customer Account API on their behalf. There are no passwords.

// Null until the storefront's Customer Account API client is configured.
export function customerClient(): OAuthClient | null {
  const id = process.env.SHOPIFY_CUSTOMER_CLIENT_ID;
  if (!id) return null;
  return { id, secret: process.env.SHOPIFY_CUSTOMER_CLIENT_SECRET || undefined };
}

export type CustomerEndpoints = {
  authorize: string;
  token: string;
  logout: string;
  graphql: string;
  // Shopify's hosted account pages: orders, addresses, profile.
  account: string;
};

async function discover<T>(path: string): Promise<T> {
  const response = await fetch(`https://${storeDomain()}/.well-known/${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new ShopifyError(
      `Could not read ${path} from the store (${response.status})`,
      response.status,
    );
  }
  return (await response.json()) as T;
}

// The store publishes where its sign-in and customer API live. Looking them up
// keeps working if the store moves customer accounts onto its own domain.
export async function getCustomerEndpoints(): Promise<CustomerEndpoints> {
  "use cache";
  cacheLife("days");

  const [openid, api] = await Promise.all([
    discover<{
      authorization_endpoint: string;
      token_endpoint: string;
      end_session_endpoint: string;
    }>("openid-configuration"),
    discover<{ graphql_api: string }>("customer-account-api"),
  ]);

  return {
    authorize: openid.authorization_endpoint,
    token: openid.token_endpoint,
    logout: openid.end_session_endpoint,
    graphql: api.graphql_api,
    account: api.graphql_api.replace(/\/customer\/api\/.*$/, ""),
  };
}

async function requestTokens(origin: string, grant: TokenGrant): Promise<Tokens> {
  const client = customerClient();
  if (!client) {
    throw new ShopifyError(
      "SHOPIFY_CUSTOMER_CLIENT_ID is not set. Copy .env.example to .env.local and fill it in.",
    );
  }

  const { token } = await getCustomerEndpoints();
  const { url, init } = tokenRequest(token, client, origin, grant);
  const response = await fetch(url, init);
  const json: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const reason =
      typeof json === "object" && json !== null && "error" in json
        ? `: ${String(json.error)}`
        : "";
    throw new ShopifyError(
      `Shopify refused the sign-in token request (${response.status}${reason})`,
      response.status,
    );
  }
  return parseTokens(json);
}

export function exchangeCode(
  origin: string,
  grant: { code: string; redirectUri: string; verifier: string },
): Promise<Tokens> {
  return requestTokens(origin, { type: "authorization_code", ...grant });
}

export function refreshTokens(origin: string, refreshToken: string): Promise<Tokens> {
  return requestTokens(origin, { type: "refresh_token", refreshToken });
}

const CUSTOMER_QUERY = /* GraphQL */ `
  query Customer {
    customer {
      id
      firstName
      emailAddress { emailAddress }
    }
  }
`;

type CustomerData = {
  customer: {
    id: string;
    firstName: string | null;
    emailAddress: { emailAddress: string | null } | null;
  } | null;
};

// Null when the access token is no longer accepted.
export async function getCustomer(accessToken: string): Promise<Customer | null> {
  const { graphql } = await getCustomerEndpoints();
  const response = await fetch(graphql, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
      // The token goes in as it is; this API doesn't use a Bearer prefix.
      Authorization: accessToken,
    },
    body: JSON.stringify({ query: CUSTOMER_QUERY }),
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new ShopifyError(
      `Shopify responded with ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const json = (await response.json()) as {
    data?: CustomerData | null;
    errors?: { message: string }[];
  };
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  }

  const customer = json.data?.customer;
  if (!customer) return null;
  return {
    id: customer.id,
    email: customer.emailAddress?.emailAddress ?? null,
    firstName: customer.firstName,
  };
}
