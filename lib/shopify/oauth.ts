import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// The protocol half of customer sign-in: OAuth 2 authorization code with PKCE,
// as Shopify's Customer Account API expects it. No Next or network code lives
// here, so it can be tested directly.

export const SCOPE = "openid email customer-account-api:full";

// Shopify turns away token requests that don't name a client.
export const USER_AGENT = "Blackground-Storefront";

// A confidential client has a secret; a public one doesn't.
export type OAuthClient = { id: string; secret?: string };

export type Tokens = {
  accessToken: string;
  // Seconds until the access token stops working.
  expiresIn: number;
  refreshToken: string | null;
  idToken: string | null;
};

export type TokenGrant =
  | { type: "authorization_code"; code: string; redirectUri: string; verifier: string }
  | { type: "refresh_token"; refreshToken: string };

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

// base64url with no padding: Shopify answers invalid_grant to anything else.
export function pkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function sameToken(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function authorizeUrl(
  endpoint: string,
  request: {
    client: OAuthClient;
    redirectUri: string;
    state: string;
    nonce: string;
    verifier: string;
  },
): string {
  const url = new URL(endpoint);
  url.search = new URLSearchParams({
    client_id: request.client.id,
    response_type: "code",
    redirect_uri: request.redirectUri,
    scope: SCOPE,
    state: request.state,
    nonce: request.nonce,
    code_challenge: pkceChallenge(request.verifier),
    code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

// A confidential client proves itself with its secret. A public one can't, so
// Shopify checks its Origin against the storefront's allowed list instead.
export function tokenRequest(
  endpoint: string,
  client: OAuthClient,
  origin: string,
  grant: TokenGrant,
): { url: string; init: RequestInit & { headers: Record<string, string> } } {
  const body = new URLSearchParams({ grant_type: grant.type, client_id: client.id });
  if (grant.type === "authorization_code") {
    body.set("redirect_uri", grant.redirectUri);
    body.set("code", grant.code);
    body.set("code_verifier", grant.verifier);
  } else {
    body.set("refresh_token", grant.refreshToken);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    "User-Agent": USER_AGENT,
  };
  if (client.secret) {
    const credentials = Buffer.from(`${client.id}:${client.secret}`).toString("base64");
    headers.Authorization = `Basic ${credentials}`;
  } else {
    headers.Origin = origin;
  }

  return { url: endpoint, init: { method: "POST", headers, body } };
}

export function parseTokens(json: unknown): Tokens {
  const data = (typeof json === "object" && json !== null ? json : {}) as Record<
    string,
    unknown
  >;
  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new Error("The token response had no access token");
  }
  return {
    accessToken: data.access_token,
    expiresIn: typeof data.expires_in === "number" ? data.expires_in : 0,
    refreshToken: typeof data.refresh_token === "string" ? data.refresh_token : null,
    idToken: typeof data.id_token === "string" ? data.id_token : null,
  };
}

// Reads the claims without checking the signature. That is enough here: the
// token arrives straight from Shopify's token endpoint over TLS, and the only
// claim used is the nonce, to tie the response to the request that began it.
export function idTokenClaims(idToken: string): Record<string, unknown> | null {
  const payload = idToken.split(".")[1];
  if (!payload) return null;
  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof claims === "object" && claims !== null && !Array.isArray(claims)
      ? (claims as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function logoutUrl(endpoint: string, idToken: string, returnTo: string): string {
  const url = new URL(endpoint);
  url.search = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: returnTo,
  }).toString();
  return url.toString();
}
