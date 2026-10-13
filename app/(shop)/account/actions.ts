"use server";

import { redirect } from "next/navigation";

import {
  clearCustomerSession,
  getCartId,
  getCustomerSession,
} from "@/lib/session";
import { setCartCustomer } from "@/lib/shopify/cart";
import { getCustomerEndpoints } from "@/lib/shopify/customer";
import { logoutUrl } from "@/lib/shopify/oauth";
import { siteOrigin } from "@/lib/site";

// Signs out here and at Shopify. Without the second half, the next sign-in
// would go straight through on Shopify's own session.
export async function logout(): Promise<void> {
  const { idToken } = await getCustomerSession();

  const cartId = await getCartId();
  if (cartId) {
    await setCartCustomer(cartId, null).catch((error) => {
      console.error("Unlinking the bag from the customer failed", error);
    });
  }

  await clearCustomerSession();

  let destination = "/";
  if (idToken) {
    try {
      const [endpoints, origin] = await Promise.all([
        getCustomerEndpoints(),
        siteOrigin(),
      ]);
      destination = logoutUrl(endpoints.logout, idToken, origin);
    } catch (error) {
      console.error("Signing out at Shopify failed", error);
    }
  }

  redirect(destination);
}
