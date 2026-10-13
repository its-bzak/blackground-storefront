import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import { getPage, getPolicies } from "@/lib/shopify/content";
import { CONTACT_EMAIL } from "@/lib/site";

import { NAV } from "./links";

const link = "text-bone/60 transition-colors hover:text-gold";

type FooterLink = { href: string; label: string };

// The store keeps its shipping terms on a page; this is used until a shipping
// policy is set alongside the others in the admin.
const SHIPPING_PAGE = "shipping-policy";

async function policyLinks(): Promise<FooterLink[]> {
  try {
    const [policies, shipping] = await Promise.all([
      getPolicies(),
      getPage(SHIPPING_PAGE),
    ]);
    const links = policies.map(({ handle, title }) => ({
      href: `/policies/${handle}`,
      label: title,
    }));
    if (shipping && !policies.some((policy) => policy.handle === SHIPPING_PAGE)) {
      links.push({ href: `/pages/${SHIPPING_PAGE}`, label: shipping.title });
    }
    return links;
  } catch (error) {
    unstable_rethrow(error);
    // A footer without its policy links is better than no page at all.
    console.error("Loading the footer's policy links failed", error);
    return [];
  }
}

// Footer for every page except the hero, which fills the screen.
export async function SiteFooter() {
  const policies = await policyLinks();
  const site: FooterLink[] = [
    NAV.shop,
    NAV.quiz,
    NAV.about,
    ...(CONTACT_EMAIL ? [NAV.contact] : []),
  ];

  return (
    <footer className="border-t border-bone/10 px-5 py-12 md:px-10">
      <div className="eyebrow flex flex-col gap-8 md:flex-row md:justify-between">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-4">
          {site.map(({ href, label }) => (
            <Link key={href} href={href} className={link}>
              {label}
            </Link>
          ))}
        </nav>

        {policies.length > 0 && (
          <nav aria-label="Policies" className="flex flex-wrap gap-x-8 gap-y-4">
            {policies.map(({ href, label }) => (
              <Link key={href} href={href} className={link}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <p className="eyebrow mt-10 text-bone/40">&copy; Blackground Clothing</p>
    </footer>
  );
}
