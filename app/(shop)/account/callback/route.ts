import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { getCartId, setCustomerSession, takePendingLogin } from "@/lib/session";
import { setCartCustomer } from "@/lib/shopify/cart";
import { exchangeCode } from "@/lib/shopify/customer";
import { idTokenClaims, sameToken } from "@/lib/shopify/oauth";
import { siteOrigin } from "@/lib/site";

// Where Shopify returns the visitor after its login page. The address has to
// be on the storefront's list of callback URLs in the Headless channel.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const pending = await takePendingLogin();

  // No matching sign-in in progress: a stale tab, a replayed link, or a
  // response this browser never asked for.
  if (!pending || !code || !state || !sameToken(state, pending.state)) {
    redirect("/account?error=failed");
  }

  let signedIn = false;
  try {
    const origin = await siteOrigin();
    const tokens = await exchangeCode(origin, {
      code,
      redirectUri: `${origin}/account/callback`,
      verifier: pending.verifier,
    });

    const nonce = tokens.idToken ? idTokenClaims(tokens.idToken)?.nonce : null;
    if (typeof nonce !== "string" || !sameToken(nonce, pending.nonce)) {
      throw new Error("The id token doesn't belong to this sign-in");
    }

    await setCustomerSession(tokens);
    signedIn = true;

    // Best effort: checkout still works for a bag that isn't tied to anyone.
    const cartId = await getCartId();
    if (cartId) {
      await setCartCustomer(cartId, tokens.accessToken).catch((error) => {
        console.error("Linking the bag to the customer failed", error);
      });
    }
  } catch (error) {
    console.error("Completing sign-in failed", error);
  }

  redirect(signedIn ? pending.next : "/account?error=failed");
}
