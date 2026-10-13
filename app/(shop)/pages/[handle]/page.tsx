import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { Article } from "@/components/content/Article";
import { getPage } from "@/lib/shopify/content";

type Props = PageProps<"/pages/[handle]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const page = await getPage(handle);
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
  const page = await getPage(handle);
  if (!page) notFound();

  return <Article title={page.title} html={page.body} />;
}
