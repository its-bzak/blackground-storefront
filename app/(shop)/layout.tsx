import { SiteHeader } from "@/components/nav/SiteHeader";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="pt-20">{children}</div>
    </>
  );
}
