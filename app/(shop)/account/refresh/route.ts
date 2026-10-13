import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { renewSession } from "@/lib/account";
import { safeNextPath } from "@/lib/safe-path";
import { clearCustomerSession } from "@/lib/session";
import { getCustomer } from "@/lib/shopify/customer";

// A page that finds a lapsed session can't renew it, because rendering can't
// write cookies. It sends the visitor here, and they come straight back.
export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), "/account");

  try {
    const accessToken = await renewSession();
    // A renewed token that still isn't accepted would bounce between here and
    // the page forever, so that session is dropped.
    if (accessToken && !(await getCustomer(accessToken))) {
      await clearCustomerSession();
    }
  } catch (error) {
    console.error("Checking the renewed session failed", error);
    await clearCustomerSession();
  }

  redirect(next);
}
