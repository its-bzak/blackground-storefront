import Link from "next/link";

import { BagLink } from "./BagLink";
import { NAV } from "./links";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

const link = "text-bone/75 transition-colors hover:text-gold";

// Header for every page except the hero, which pins its links to the corners.
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-bone/10 bg-ink/95 backdrop-blur-md">
      <div className="eyebrow relative flex h-20 items-center justify-between px-5 md:px-10">
        <nav aria-label="Primary" className="flex items-center gap-8">
          <MobileMenu className={`eyebrow md:hidden ${link}`} />
          <Link href={NAV.shop.href} className={`hidden md:inline ${link}`}>
            {NAV.shop.label}
          </Link>
          <Link href={NAV.quiz.href} className={`hidden md:inline ${link}`}>
            {NAV.quiz.label}
          </Link>
          <Link href={NAV.about.href} className={`hidden md:inline ${link}`}>
            {NAV.about.label}
          </Link>
        </nav>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo />
        </div>

        <nav aria-label="Account" className="flex items-center gap-8">
          <Link href={NAV.account.href} className={`hidden md:inline ${link}`}>
            {NAV.account.label}
          </Link>
          <BagLink className={link} />
        </nav>
      </div>
    </header>
  );
}
