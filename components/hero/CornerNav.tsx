import Link from "next/link";

import { BagLink } from "@/components/nav/BagLink";
import { NAV } from "@/components/nav/links";
import { Logo } from "@/components/nav/Logo";
import { MobileMenu } from "@/components/nav/MobileMenu";

const link = "eyebrow text-bone/75 transition-colors hover:text-gold";
const corner = `absolute z-20 hidden md:block ${link}`;

// Hero chrome: logo top-centre, one link in each corner from md up.
// Below md the corners collapse into Menu (left) and Bag (right).
export function CornerNav() {
  return (
    <>
      <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2 md:top-6">
        <Logo />
      </div>

      <MobileMenu className={`absolute left-5 top-8 z-20 md:hidden ${link}`} />

      <nav aria-label="Primary">
        <Link href={NAV.shop.href} className={`${corner} left-8 top-9`}>
          {NAV.shop.label}
        </Link>
        <Link href={NAV.about.href} className={`${corner} bottom-8 left-8`}>
          {NAV.about.label}
        </Link>
        <Link href={NAV.quiz.href} className={`${corner} bottom-8 right-8`}>
          {NAV.quiz.label}
        </Link>

        <div className="absolute right-5 top-8 z-20 flex items-center gap-8 md:right-8 md:top-9">
          <Link href={NAV.account.href} className={`hidden md:inline ${link}`}>
            {NAV.account.label}
          </Link>
          <BagLink className={link} />
        </div>
      </nav>
    </>
  );
}
