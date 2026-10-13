import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { safeNextPath } from "@/lib/safe-path";
import { setPendingLogin } from "@/lib/session";
import { customerClient, getCustomerEndpoints } from "@/lib/shopify/customer";
import { authorizeUrl, randomToken } from "@/lib/shopify/oauth";
import { siteOrigin } from "@/lib/site";

// Starts sign-in: remembers where to come back to, then hands the visitor to
// Shopify's hosted login page. Link here with a plain <a>, never <Link>, so
// nothing prefetches it.
export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), "/account");
  const client = customerClient();

  let destination = "/account?error=unavailable";
  if (!client) {
    console.error("SHOPIFY_CUSTOMER_CLIENT_ID is not set, so nobody can sign in.");
  } else {
    try {
      const [endpoints, origin] = await Promise.all([
        getCustomerEndpoints(),
        siteOrigin(),
      ]);
      const pending = {
        state: randomToken(),
        nonce: randomToken(),
        verifier: randomToken(48),
        next,
      };
      await setPendingLogin(pending);
      destination = authorizeUrl(endpoints.authorize, {
        client,
        redirectUri: `${origin}/account/callback`,
        ...pending,
      });
    } catch (error) {
      console.error("Starting sign-in failed", error);
    }
  }

  redirect(destination);
}
