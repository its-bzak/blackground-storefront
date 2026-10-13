import "server-only";
import { headers } from "next/headers";

// Loopback, link-local and private ranges: what the app sees in development
// or behind a proxy that didn't pass the real address on.
const NOT_PUBLIC =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|f[cd][0-9a-f]{2}:|fe80:)/i;

// The shopper's address as the host reports it, or undefined when there isn't
// a usable one. Reads request headers, so not for use inside "use cache".
export async function buyerIp(): Promise<string | undefined> {
  const list = await headers();
  const ip = (
    list.get("x-forwarded-for")?.split(",")[0] ||
    list.get("x-real-ip") ||
    ""
  )
    .trim()
    // An IPv4 address written the IPv6 way.
    .replace(/^::ffff:/i, "");
  return ip && !NOT_PUBLIC.test(ip) ? ip : undefined;
}
