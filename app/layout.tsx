import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";

import { INDEXABLE, SITE_URL } from "@/lib/site";

import "./globals.css";

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  // Makes the relative URLs in metadata, such as the share image, absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Blackground",
    template: "%s | Blackground",
  },
  description: "Blackground. Find your archetype.",
  openGraph: { siteName: "Blackground", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
  ...(!INDEXABLE && { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink font-sans text-bone">{children}</body>
    </html>
  );
}
