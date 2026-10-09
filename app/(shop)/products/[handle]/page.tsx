import type { Metadata } from "next";
import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";

import { ProductForm } from "@/components/product/ProductForm";
import { ProductGallery } from "@/components/product/ProductGallery";
import { getProduct } from "@/lib/shopify/products";

type Props = PageProps<"/products/[handle]">;

const LAYOUT = "md:grid md:grid-cols-12 md:gap-x-6 md:px-10";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  try {
    const product = await getProduct(handle);
    if (!product) return { title: "Not found" };

    const image = product.featuredImage;
    return {
      title: product.seo.title ?? product.title,
      description: product.seo.description ?? undefined,
      openGraph: image
        ? { images: [{ url: image.url, alt: image.altText ?? product.title }] }
        : undefined,
    };
  } catch (error) {
    unstable_rethrow(error);
    return {};
  }
}

export default function ProductRoute(props: Props) {
  return (
    <main className="pb-28 md:pt-10">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductView params={props.params} />
      </Suspense>
    </main>
  );
}

async function ProductView({ params }: Pick<Props, "params">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <div className={LAYOUT}>
      <div className="md:col-span-7">
        <ProductGallery images={product.images.nodes} title={product.title} />
      </div>

      {/* The column stretches to the gallery's height; the inner block pins. */}
      <div className="px-5 pt-8 md:col-span-4 md:col-start-9 md:px-0 md:pt-0">
        <div className="md:sticky md:top-28">
          <Link
            href="/collections/all"
            className="eyebrow text-bone/50 transition-colors hover:text-gold"
          >
            {product.vendor || "Shop"}
          </Link>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">
            {product.title}
          </h1>

          <ProductForm
            product={{
              options: product.options,
              variants: product.variants,
              priceRange: product.priceRange,
            }}
          />

          {product.descriptionHtml && (
            <div
              className="mt-10 border-t border-bone/10 pt-8 text-[0.9375rem] leading-relaxed text-bone/65 [&_a]:underline [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-4 [&_strong]:text-bone [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
              // Written by the merchant in the Shopify admin.
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className={LAYOUT} aria-busy="true" aria-label="Loading product">
      <div className="aspect-[4/5] bg-coal md:col-span-7" />
      <div className="px-5 pt-8 md:col-span-4 md:col-start-9 md:px-0 md:pt-0">
        <div className="h-3 w-24 bg-coal" />
        <div className="mt-5 h-12 w-3/4 bg-coal" />
        <div className="mt-5 h-5 w-20 bg-coal" />
        <div className="mt-10 h-14 bg-coal" />
      </div>
    </div>
  );
}
