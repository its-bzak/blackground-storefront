"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import type { ArchetypeCard as Card } from "@/lib/archetypes";

import { ArchetypeCard } from "./ArchetypeCard";

type Props = {
  cards: readonly Card[];
  // Logo and corner links, rendered on the server and pinned over the stage.
  chrome: ReactNode;
};

// Scroll distance per card, as a share of the viewport height. Kept well under
// one viewport: a drag that stops short of halfway to the next snap point
// settles back, so a full-height step would make slow trackpad and touch
// gestures feel like they bounce off.
const STEP = 0.4;

function scrollToCard(scroller: HTMLElement, index: number, smooth: boolean) {
  scroller.scrollTo({
    top: index * STEP * scroller.clientHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

// The page itself never scrolls. An invisible scroll container sits over a
// sticky stage, with one snap stop per card; its scroll progress drives the
// deck, so wheel, touch and keyboard all work natively and in both directions.
export function ArchetypeStage({ cards, chrome }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);

  const count = cards.length;
  const last = count - 1;
  // Track height in viewports: one for the stage plus a step per later card.
  const trackScale = 1 + last * STEP;
  const stageHeight = `${100 / trackScale}%`;
  const stepHeight = `${(STEP * 100) / trackScale}%`;

  const { scrollYProgress } = useScroll({ container: scrollerRef });
  const progress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 28,
    mass: 0.5,
    restDelta: 0.0004,
  });
  // Deck position, 0 to last. Snap stops can land a fraction of a pixel off, so
  // values within a hair of a whole card settle on it and the card lies flat.
  const position = useTransform(progress, (value) => {
    const raw = value * last;
    const nearest = Math.round(raw);
    return Math.abs(raw - nearest) < 0.004 ? nearest : raw;
  });
  const hintOpacity = useTransform(position, [0, 0.35], [1, 0]);

  useMotionValueEvent(position, "change", (value) => {
    setActive(Math.min(last, Math.max(0, Math.round(value))));
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const scroller = scrollerRef.current;
      if (!scroller || event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const target = event.target instanceof Element ? event.target : null;
      // Leave form fields and the open menu alone.
      if (target?.closest("input, textarea, select, dialog")) return;

      const current = Math.round(
        scroller.scrollTop / (STEP * scroller.clientHeight),
      );
      let next: number;

      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          next = current + 1;
          break;
        case "ArrowUp":
        case "PageUp":
          next = current - 1;
          break;
        case " ":
          // Space still activates a focused link or button.
          if (target?.closest("a, button")) return;
          next = current + (event.shiftKey ? -1 : 1);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = last;
          break;
        default:
          return;
      }

      event.preventDefault();
      scrollToCard(scroller, Math.min(last, Math.max(0, next)), !reduceMotion);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [last, reduceMotion]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-ink">
      <div
        ref={scrollerRef}
        className="no-scrollbar absolute inset-0 snap-y snap-mandatory overflow-y-auto overscroll-none"
      >
        <div className="relative" style={{ height: `${trackScale * 100}%` }}>
          <div
            className="sticky top-0 overflow-hidden [container-type:size]"
            style={{ height: stageHeight }}
          >
            {chrome}

            <section
              aria-roledescription="carousel"
              aria-label="The eight Blackground archetypes"
              className="absolute inset-x-0 bottom-28 top-20 grid place-items-center [@media(max-height:520px)]:bottom-14"
            >
              {/* Perspective has to sit on the cards' direct parent to reach them.
                  From md up the deck is wider at the same height (7:8 instead
                  of 3:4); short landscape screens keep the compact size. */}
              <ol className="relative aspect-[3/4] w-[min(70cqw,44cqh,25rem)] [perspective:1800px] [@media(max-height:520px)]:w-[32cqh] md:[@media(min-height:521px)]:aspect-[7/8] md:[@media(min-height:521px)]:w-[min(70cqw,51cqh,29rem)]">
                {cards.map((card, index) => (
                  <ArchetypeCard
                    key={card.archetype}
                    card={card}
                    index={index}
                    total={count}
                    position={position}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </ol>
            </section>

            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
              <Link
                href="/quiz"
                className="eyebrow rounded-full border border-bone/25 px-7 py-3.5 text-bone transition-colors hover:border-gold hover:text-gold [@media(max-height:520px)]:hidden"
              >
                Find your archetype
              </Link>

              <div className="flex items-center gap-5">
                <p className="eyebrow text-bone/60 tabular-nums" aria-hidden>
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(count).padStart(2, "0")}
                </p>

                <ol className="flex items-center gap-1">
                  {cards.map((card, index) => (
                    <li key={card.archetype}>
                      <button
                        type="button"
                        aria-label={`Show The ${card.archetype}`}
                        aria-current={index === active ? "true" : undefined}
                        onClick={() => {
                          const scroller = scrollerRef.current;
                          if (scroller) scrollToCard(scroller, index, !reduceMotion);
                        }}
                        className="group grid size-5 place-items-center"
                      >
                        <span
                          className={`block size-1 rounded-full transition duration-300 group-hover:bg-gold ${
                            index === active
                              ? "scale-[1.75] bg-gold"
                              : "bg-bone/30"
                          }`}
                        />
                      </button>
                    </li>
                  ))}
                </ol>

                <motion.p
                  aria-hidden
                  style={{ opacity: hintOpacity }}
                  className="eyebrow text-bone/40"
                >
                  Scroll
                </motion.p>
              </div>

              <p className="sr-only" aria-live="polite">
                {active + 1} of {count}: The {cards[active].archetype}
              </p>
            </div>
          </div>

          {/* One snap stop per card. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {cards.map((card) => (
              <div
                key={card.archetype}
                className="snap-start snap-always"
                style={{ height: stepHeight }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
