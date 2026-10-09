import type { Metadata } from "next";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { AuthForms } from "@/components/account/AuthForms";
import { safeNextPath } from "@/lib/safe-path";
import { getCustomerToken } from "@/lib/session";
import { getCustomer } from "@/lib/shopify/customer";
import type { Customer } from "@/lib/shopify/types";

import { logout } from "./actions";

type Props = PageProps<"/account/login">;

export const metadata: Metadata = { title: "Account" };

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
  const token = await getCustomerToken();
  if (!token) return null;
  try {
    return await getCustomer(token);
  } catch (error) {
    unstable_rethrow(error);
    // Can't confirm the session right now; offer the sign-in form instead.
    return null;
  }
}

async function Account({ searchParams }: Pick<Props, "searchParams">) {
  const { next } = await searchParams;
  const customer = await currentCustomer();

  if (!customer) return <AuthForms next={safeNextPath(next)} />;

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
        <form action={logout}>
          <button
            type="submit"
            className="eyebrow border-b border-bone/40 pb-1 text-bone/70 transition-colors hover:border-gold hover:text-gold"
          >
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
