import assert from "node:assert/strict";
import { test } from "node:test";

import {
  SCOPE,
  authorizeUrl,
  idTokenClaims,
  logoutUrl,
  parseTokens,
  pkceChallenge,
  randomToken,
  sameToken,
  tokenRequest,
} from "./oauth.ts";

const TOKEN_ENDPOINT = "https://shopify.com/authentication/1/oauth/token";
const ORIGIN = "https://blackgroundclothing.com";

function jwt(claims: unknown): string {
  const part = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "RS256" })}.${part(claims)}.signature`;
}

test("pkceChallenge matches the RFC 7636 example", () => {
  assert.equal(
    pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
    "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  );
});

test("randomToken is url-safe, long enough for a PKCE verifier, and not repeated", () => {
  const token = randomToken(48);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
  assert.ok(token.length >= 43 && token.length <= 128);
  assert.notEqual(token, randomToken(48));
});

test("sameToken only accepts an exact match", () => {
  assert.equal(sameToken("abc123", "abc123"), true);
  assert.equal(sameToken("abc123", "abc124"), false);
  assert.equal(sameToken("abc123", "abc1234"), false);
  assert.equal(sameToken("", "abc"), false);
});

test("authorizeUrl carries the code-flow parameters and the challenge, never the verifier", () => {
  const url = new URL(
    authorizeUrl("https://shopify.com/authentication/1/oauth/authorize", {
      client: { id: "client-id", secret: "secret" },
      redirectUri: `${ORIGIN}/account/callback`,
      state: "state-value",
      nonce: "nonce-value",
      verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
    }),
  );

  assert.equal(url.origin + url.pathname, "https://shopify.com/authentication/1/oauth/authorize");
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    client_id: "client-id",
    response_type: "code",
    redirect_uri: `${ORIGIN}/account/callback`,
    scope: SCOPE,
    state: "state-value",
    nonce: "nonce-value",
    code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    code_challenge_method: "S256",
  });
  assert.equal(url.toString().includes("secret"), false);
});

test("tokenRequest authenticates a confidential client with its secret", () => {
  const { url, init } = tokenRequest(
    TOKEN_ENDPOINT,
    { id: "client-id", secret: "s3cret" },
    ORIGIN,
    {
      type: "authorization_code",
      code: "the-code",
      redirectUri: `${ORIGIN}/account/callback`,
      verifier: "the-verifier",
    },
  );

  assert.equal(url, TOKEN_ENDPOINT);
  assert.equal(init.method, "POST");
  assert.equal(
    init.headers.Authorization,
    `Basic ${Buffer.from("client-id:s3cret").toString("base64")}`,
  );
  assert.equal(init.headers.Origin, undefined);
  assert.ok(init.headers["User-Agent"]);
  assert.equal(init.headers["Content-Type"], "application/x-www-form-urlencoded");
  assert.deepEqual(Object.fromEntries(init.body as URLSearchParams), {
    grant_type: "authorization_code",
    client_id: "client-id",
    redirect_uri: `${ORIGIN}/account/callback`,
    code: "the-code",
    code_verifier: "the-verifier",
  });
});

test("tokenRequest sends a public client's origin instead of a secret", () => {
  const { init } = tokenRequest(TOKEN_ENDPOINT, { id: "client-id" }, ORIGIN, {
    type: "refresh_token",
    refreshToken: "the-refresh-token",
  });

  assert.equal(init.headers.Authorization, undefined);
  assert.equal(init.headers.Origin, ORIGIN);
  assert.deepEqual(Object.fromEntries(init.body as URLSearchParams), {
    grant_type: "refresh_token",
    client_id: "client-id",
    refresh_token: "the-refresh-token",
  });
});

test("parseTokens reads a token response and tolerates the optional fields", () => {
  assert.deepEqual(
    parseTokens({
      access_token: "shcat_abc",
      expires_in: 3600,
      refresh_token: "refresh",
      id_token: "id",
    }),
    { accessToken: "shcat_abc", expiresIn: 3600, refreshToken: "refresh", idToken: "id" },
  );
  assert.deepEqual(parseTokens({ access_token: "shcat_abc" }), {
    accessToken: "shcat_abc",
    expiresIn: 0,
    refreshToken: null,
    idToken: null,
  });
});

test("parseTokens rejects a response with no access token", () => {
  for (const bad of [null, "text", {}, { error: "invalid_grant" }, { access_token: "" }]) {
    assert.throws(() => parseTokens(bad));
  }
});

test("idTokenClaims decodes the payload and returns null for anything else", () => {
  assert.deepEqual(idTokenClaims(jwt({ nonce: "n-1", sub: "42" })), {
    nonce: "n-1",
    sub: "42",
  });
  assert.equal(idTokenClaims("not-a-jwt"), null);
  assert.equal(idTokenClaims("a.!!!.c"), null);
  assert.equal(idTokenClaims(jwt(["array"])), null);
});

test("logoutUrl hands Shopify the id token and where to return", () => {
  const url = new URL(
    logoutUrl("https://shopify.com/authentication/1/logout", "the-id-token", ORIGIN),
  );
  assert.equal(url.origin + url.pathname, "https://shopify.com/authentication/1/logout");
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    id_token_hint: "the-id-token",
    post_logout_redirect_uri: ORIGIN,
  });
});
