"use client";

import Link from "next/link";
import { useRef } from "react";

import { MENU_LINKS } from "./links";

// Small-screen replacement for the corner links. A native modal <dialog>
// supplies the focus trap, Escape to close and focus return.
export function MobileMenu({ className }: { className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        className={className}
        onClick={() => dialogRef.current?.showModal()}
      >
        Menu
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="menu-dialog m-0 h-full max-h-none w-full max-w-none bg-ink p-0 text-bone"
      >
        <div className="flex h-full flex-col px-5 pb-12 pt-8">
          <div className="flex justify-end">
            <button type="button" className="eyebrow text-bone/75" onClick={close}>
              Close
            </button>
          </div>

          <nav
            aria-label="Menu"
            className="flex flex-1 flex-col justify-center gap-5"
          >
            {MENU_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="font-display text-5xl leading-none transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </dialog>
    </>
  );
}
