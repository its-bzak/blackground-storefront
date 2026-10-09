import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center px-5">
      <p className="eyebrow text-gold">404</p>
      <h1 className="mt-5 font-display text-5xl leading-none">
        This page isn&rsquo;t here.
      </h1>
      <Link
        href="/"
        className="eyebrow mt-10 border-b border-bone/40 pb-1 transition-colors hover:border-gold hover:text-gold"
      >
        Back to Blackground
      </Link>
    </main>
  );
}
