import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { Article } from "@/components/content/Article";
import { getPolicies } from "@/lib/shopify/content";

type Props = PageProps<"/policies/[handle]">;

async function getPolicy(handle: string) {
  return (await getPolicies()).find((policy) => policy.handle === handle) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    return { title: (await getPolicy(handle))?.title ?? "Not found" };
  } catch (error) {
    unstable_rethrow(error);
    return {};
  }
}

// The store's legal policies, at the addresses Shopify's own theme used, so
// links from the old site, checkout and emails keep working.
export default function PolicyRoute(props: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-10 md:px-10 md:pt-20">
      <Suspense fallback={<div className="h-20 w-2/3 bg-coal" aria-busy="true" />}>
        <PolicyContent params={props.params} />
      </Suspense>
    </main>
  );
}

async function PolicyContent({ params }: Pick<Props, "params">) {
  const { handle } = await params;
  const policy = await getPolicy(handle);
  if (!policy) notFound();

  return <Article title={policy.title} html={policy.body} />;
}
