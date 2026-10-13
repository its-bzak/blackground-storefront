import "server-only";

const API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-10";

export class ShopifyError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ShopifyError";
    this.status = status;
  }
}

export type UserError = { field?: string[] | null; message: string };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ShopifyError(
      `${name} is not set. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function storeDomain(): string {
  return requireEnv("SHOPIFY_STORE_DOMAIN")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

type Variables = Record<string, unknown>;
type GraphQLResponse<T> = { data?: T | null; errors?: { message: string }[] };

async function request<T>(
  url: string,
  headers: Record<string, string>,
  query: string,
  variables?: Variables,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new ShopifyError(
      `Shopify responded with ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "));
  }
  if (!json.data) throw new ShopifyError("Shopify returned no data");

  return json.data;
}

// Every call here is made from the server, which is what the private token is
// for. With it Shopify also wants the shopper's IP on requests made on a
// buyer's behalf, or all traffic looks like one visitor at this server's
// address. Cached catalogue reads have no buyer and leave it out. The public
// token is the fallback for a setup that only has that one.
function storefrontHeaders(buyerIp?: string): Record<string, string> {
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  if (!privateToken) {
    return {
      "X-Shopify-Storefront-Access-Token": requireEnv(
        "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
      ),
    };
  }
  return {
    "Shopify-Storefront-Private-Token": privateToken,
    ...(buyerIp && { "Shopify-Storefront-Buyer-IP": buyerIp }),
  };
}

export async function storefront<T>(
  query: string,
  variables?: Variables,
  options: { buyerIp?: string } = {},
): Promise<T> {
  return request<T>(
    `https://${storeDomain()}/api/${API_VERSION}/graphql.json`,
    storefrontHeaders(options.buyerIp),
    query,
    variables,
  );
}

let cachedAdminToken: { value: string; expiresAt: number } | null = null;

// A static token from an admin-created custom app, or a 24-hour token from the
// client-credentials grant (Dev Dashboard app in the store's own organisation).
async function adminToken(): Promise<string> {
  const fixed = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (fixed) return fixed;

  if (cachedAdminToken && cachedAdminToken.expiresAt - 60_000 > Date.now()) {
    return cachedAdminToken.value;
  }

  const response = await fetch(
    `https://${storeDomain()}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: requireEnv("SHOPIFY_CLIENT_ID"),
        client_secret: requireEnv("SHOPIFY_CLIENT_SECRET"),
      }),
    },
  );

  if (!response.ok) {
    throw new ShopifyError(
      `Could not get an Admin API token (${response.status})`,
      response.status,
    );
  }

  const json = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedAdminToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedAdminToken.value;
}

export async function admin<T>(query: string, variables?: Variables): Promise<T> {
  return request<T>(
    `https://${storeDomain()}/admin/api/${API_VERSION}/graphql.json`,
    { "X-Shopify-Access-Token": await adminToken() },
    query,
    variables,
  );
}
