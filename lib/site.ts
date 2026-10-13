import { headers } from "next/headers";

// The public address of this site, with no trailing slash. Set SITE_URL once
// the site has a home; Vercel's own variable covers deployments before that.
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");

// Search engines are kept out until the site is on its own domain. Before
// that it is a public copy of the live store at a *.vercel.app address.
// Setting SITE_URL to the real domain is what lets them in.
export const INDEXABLE =
  Boolean(process.env.SITE_URL) &&
  !new URL(SITE_URL).hostname.endsWith(".vercel.app");

// Shown on the Contact page. Without it that page, and the footer link to it,
// are left out.
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL?.trim() || null;

// The address the visitor is on right now, for links Shopify sends them back
// to. SITE_URL wins when set, which a tunnel or proxy in front of the app needs.
export async function siteOrigin(): Promise<string> {
  if (process.env.SITE_URL) return SITE_URL;

  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host");
  if (!host) return SITE_URL;

  const protocol =
    list.get("x-forwarded-proto")?.split(",")[0].trim() ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
