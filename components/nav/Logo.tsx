import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" aria-label="Blackground home" className="block">
      <Image
        src="/logo.png"
        alt=""
        width={380}
        height={374}
        unoptimized
        // Above the fold on every page, and the largest paint on text-only ones.
        loading="eager"
        className="h-11 w-auto"
      />
    </Link>
  );
}
