import { SiteFooter } from "@/components/nav/SiteFooter";
import { SiteHeader } from "@/components/nav/SiteHeader";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {/* A full screen tall at least, so the footer sits at the bottom of
          short pages. */}
      <div className="flex min-h-dvh flex-col pt-20">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </>
  );
}
