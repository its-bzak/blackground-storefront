"use server";

import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/safe-path";
import {
  clearCustomerToken,
  getCustomerToken,
  setCustomerToken,
} from "@/lib/session";
import {
  createCustomerToken,
  registerCustomer,
  revokeCustomerToken,
  type TokenResult,
} from "@/lib/shopify/customer";

// The email is echoed back so the field isn't wiped when a submit fails.
// The password never is.
export type AuthState = { error?: string; email?: string };

const UNREACHABLE = "We couldn't reach the store. Please try again.";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function startSession(
  email: string,
  password: string,
): Promise<TokenResult> {
  const result = await createCustomerToken(email, password);
  if (result.ok) await setCustomerToken(result.token, result.expiresAt);
  return result;
}

export async function login(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  let result: TokenResult;
  try {
    result = await startSession(email, password);
  } catch (error) {
    console.error("login failed", error);
    return { error: UNREACHABLE, email };
  }
  if (!result.ok) return { error: result.message, email };

  redirect(safeNextPath(formData.get("next")));
}

export async function register(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  const firstName = field(formData, "firstName").trim();
  const lastName = field(formData, "lastName").trim();
  if (!email || !password) {
    return { error: "Enter an email and a password.", email };
  }

  let session: TokenResult;
  try {
    const created = await registerCustomer({
      email,
      password,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    });
    if (!created.ok) return { error: created.message, email };

    session = await startSession(email, password);
  } catch (error) {
    console.error("register failed", error);
    return { error: UNREACHABLE, email };
  }

  if (!session.ok) {
    // Created, but not signed in straight away. One cause is a store that
    // asks new customers to confirm their email first.
    return { error: "Your account was created. Sign in to continue.", email };
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function logout(): Promise<void> {
  const token = await getCustomerToken();
  if (token) {
    await revokeCustomerToken(token).catch((error) => {
      console.error("revoking the customer token failed", error);
    });
  }
  await clearCustomerToken();
  redirect("/");
}
