import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Article } from "@/components/content/Article";
import { hasContent } from "@/lib/html";
import { getContentPage } from "@/lib/shopify/products";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

// The store's Contact page has no text of its own: the old theme put a form
// there. This shows whatever the merchant writes on that page, then the
// address to write to.
export default async function ContactRoute() {
  const page = await getContentPage("contact");
  const body = page && hasContent(page.body) ? page.body : undefined;
  if (!body && !CONTACT_EMAIL) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10 md:px-10 md:pt-20">
      <Article title={page?.title ?? "Contact"} html={body}>
        {CONTACT_EMAIL && (
          <div className="mt-12">
            <p className="eyebrow text-bone/50">Email</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-block break-all border-b border-bone/40 pb-1 font-display text-3xl transition-colors hover:border-gold hover:text-gold md:text-4xl"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        )}
      </Article>
    </main>
  );
}
