import "server-only";

import { storefront } from "./client";
import type { Customer } from "./types";

// Classic customer accounts (email + password) through the Storefront API.

const TOKEN_CREATE = /* GraphQL */ `
  mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code message }
    }
  }
`;

const TOKEN_DELETE = /* GraphQL */ `
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      userErrors { message }
    }
  }
`;

const CUSTOMER_CREATE = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id }
      customerUserErrors { code message }
    }
  }
`;

const CUSTOMER_QUERY = /* GraphQL */ `
  query Customer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
    }
  }
`;

type CustomerUserError = { code: string | null; message: string };

export type TokenResult =
  | { ok: true; token: string; expiresAt: string }
  | { ok: false; message: string };

export async function createCustomerToken(
  email: string,
  password: string,
): Promise<TokenResult> {
  const data = await storefront<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: CustomerUserError[];
    } | null;
  }>(TOKEN_CREATE, { input: { email, password } });

  const token = data.customerAccessTokenCreate?.customerAccessToken;
  if (!token) {
    // Shopify's own wording here is "Unidentified customer".
    return { ok: false, message: "That email or password is incorrect." };
  }
  return { ok: true, token: token.accessToken, expiresAt: token.expiresAt };
}

export type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export async function registerCustomer(
  input: RegisterInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const data = await storefront<{
    customerCreate: {
      customer: { id: string } | null;
      customerUserErrors: CustomerUserError[];
    } | null;
  }>(CUSTOMER_CREATE, { input });

  const errors = data.customerCreate?.customerUserErrors ?? [];
  if (errors.length > 0) return { ok: false, message: errors[0].message };
  if (!data.customerCreate?.customer) {
    return { ok: false, message: "We couldn't create that account." };
  }
  return { ok: true };
}

// Null when the token is unknown or expired.
export async function getCustomer(token: string): Promise<Customer | null> {
  const data = await storefront<{ customer: Customer | null }>(CUSTOMER_QUERY, {
    customerAccessToken: token,
  });
  return data.customer;
}

export async function revokeCustomerToken(token: string): Promise<void> {
  await storefront(TOKEN_DELETE, { customerAccessToken: token });
}
