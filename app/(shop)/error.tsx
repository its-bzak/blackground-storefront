"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function ShopError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-start justify-center px-5">
      <p className="eyebrow text-gold">Something went wrong</p>
      <h1 className="mt-5 font-display text-5xl leading-none">
        We couldn&rsquo;t load this page.
      </h1>
      {process.env.NODE_ENV !== "production" && (
        <p className="mt-5 text-sm text-bone/60">{error.message}</p>
      )}
      <button
        type="button"
        onClick={() => retry()}
        className="eyebrow mt-10 border-b border-bone/40 pb-1 transition-colors hover:border-gold hover:text-gold"
      >
        Try again
      </button>
    </main>
  );
}
