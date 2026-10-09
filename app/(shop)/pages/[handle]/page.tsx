import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { getContentPage } from "@/lib/shopify/products";

type Props = PageProps<"/pages/[handle]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const page = await getContentPage(handle);
    return {
      title: page?.seo?.title ?? page?.title ?? "Not found",
      description: page?.seo?.description ?? undefined,
    };
  } catch (error) {
    unstable_rethrow(error);
    return {};
  }
}

// Pages written in the Shopify admin, such as /pages/about.
export default function ContentRoute(props: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10 md:px-10 md:pt-20">
      <Suspense fallback={<div className="h-20 w-2/3 bg-coal" aria-busy="true" />}>
        <Content params={props.params} />
      </Suspense>
    </main>
  );
}

async function Content({ params }: Pick<Props, "params">) {
  const { handle } = await params;
  const page = await getContentPage(handle);
  if (!page) notFound();

  return (
    <article>
      <h1 className="font-display text-[clamp(3rem,10vw,6rem)] leading-[0.95]">
        {page.title}
      </h1>
      <div
        className="mt-12 text-lg leading-relaxed text-bone/75 [&_a]:underline [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-4xl [&_h2]:text-bone [&_li]:mt-2 [&_ol]:mt-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p+p]:mt-6 [&_strong]:text-bone [&_ul]:mt-6 [&_ul]:list-disc [&_ul]:pl-6"
        // Written by the merchant in the Shopify admin.
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </article>
  );
}
