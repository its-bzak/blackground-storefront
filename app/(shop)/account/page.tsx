import type { Metadata } from "next";
import Link from "next/link";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { readCustomer } from "@/lib/account";
import { safeNextPath } from "@/lib/safe-path";
import { getCustomerEndpoints } from "@/lib/shopify/customer";
import type { Customer } from "@/lib/shopify/types";

import { logout } from "./actions";

type Props = PageProps<"/account">;

export const metadata: Metadata = { title: "Account" };

const ERRORS: Record<string, string> = {
  unavailable: "Sign-in isn't available right now. Please try again later.",
  failed: "That sign-in didn't go through. Please try again.",
};

const quiet =
  "eyebrow border-b border-bone/40 pb-1 text-bone/70 transition-colors hover:border-gold hover:text-gold";

export default function AccountRoute(props: Props) {
  return (
    <main className="mx-auto w-full max-w-md px-5 pb-28 pt-12 md:pt-24">
      <Suspense fallback={<div className="h-16 w-1/2 bg-coal" aria-busy="true" />}>
        <Account searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function currentCustomer(): Promise<Customer | null> {
  let session: Awaited<ReturnType<typeof readCustomer>>;
  try {
    session = await readCustomer();
  } catch (error) {
    unstable_rethrow(error);
    // Can't confirm the session right now; offer sign-in instead.
    return null;
  }

  if (session.lapsed) redirect("/account/refresh?next=/account");
  return session.customer;
}

// Shopify's own account pages, where orders and addresses live.
async function hostedAccountUrl(): Promise<string | null> {
  try {
    return (await getCustomerEndpoints()).account;
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}

async function Account({ searchParams }: Pick<Props, "searchParams">) {
  const { next, error } = await searchParams;
  const customer = await currentCustomer();

  if (!customer) {
    const message = typeof error === "string" ? ERRORS[error] : undefined;
    const destination = safeNextPath(next, "/account");

    return (
      <>
        <h1 className="font-display text-[clamp(3rem,10vw,5rem)] leading-none">
          Sign in
        </h1>
        <p className="mt-6 text-bone/60">
          Enter your email on the next screen and we&rsquo;ll send you a
          one-time code. There&rsquo;s no password to remember.
        </p>

        <p role="alert" className="mt-8 min-h-5 text-sm text-gold">
          {message}
        </p>

        {/* A route that redirects to Shopify, so a plain link rather than a
            client route. */}
        <a
          href={`/account/login?next=${encodeURIComponent(destination)}`}
          className="eyebrow mt-4 block w-full bg-gold px-8 py-4.5 text-center text-ink transition-colors hover:bg-bone"
        >
          Sign in
        </a>
      </>
    );
  }

  const accountUrl = await hostedAccountUrl();

  return (
    <>
      <p className="eyebrow text-gold">Signed in</p>
      <h1 className="mt-5 font-display text-[clamp(2.5rem,9vw,4.5rem)] leading-none">
        {customer.firstName ? `Hello, ${customer.firstName}.` : "Hello."}
      </h1>
      {customer.email && <p className="mt-5 text-bone/60">{customer.email}</p>}

      <div className="eyebrow mt-12 flex flex-wrap gap-x-10 gap-y-5">
        <Link
          href="/quiz"
          className="border-b border-gold/60 pb-1 text-gold transition-colors hover:border-gold"
        >
          Find your archetype
        </Link>
        {accountUrl && (
          <a href={accountUrl} className={quiet}>
            Orders and details
          </a>
        )}
        <form action={logout}>
          <button type="submit" className={quiet}>
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
