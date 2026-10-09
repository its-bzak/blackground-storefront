"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import type { ArchetypeCard as Card } from "@/lib/archetypes";

// How far each waiting card rises above the one in front of it, in px.
const STACK_STEP = 14;
const STACK_SHRINK = 0.045;
// Cards deeper than this are fully hidden.
const VISIBLE_DEPTH = 3;
const PEEL_DEGREES = 84;
const PEEL_LIFT = 56;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type Props = {
  card: Card;
  index: number;
  total: number;
  // Deck position: 0 shows the first card, total - 1 the last.
  position: MotionValue<number>;
  reduceMotion: boolean;
};

export function ArchetypeCard({
  card,
  index,
  total,
  position,
  reduceMotion,
}: Props) {
  // < 0: waiting behind the front card. 0: front. 0..1: peeling away. >= 1: gone.
  const offset = useTransform(position, (value) => value - index);

  const rotateX = useTransform(offset, (o) =>
    reduceMotion ? 0 : clamp(o, 0, 1) * PEEL_DEGREES,
  );

  const y = useTransform(offset, (o) => {
    if (o <= 0) return Math.max(o, -VISIBLE_DEPTH - 1) * STACK_STEP;
    return reduceMotion ? 0 : -clamp(o, 0, 1) * PEEL_LIFT;
  });

  const scale = useTransform(offset, (o) =>
    o <= 0 ? 1 + Math.max(o, -VISIBLE_DEPTH - 1) * STACK_SHRINK : 1,
  );

  const opacity = useTransform(offset, (o) => {
    // Fades in as it comes within VISIBLE_DEPTH of the front.
    if (o <= 0) return clamp(VISIBLE_DEPTH + 1 + o, 0, 1);
    // Holds while it lifts, then fades over the last part of the peel.
    return reduceMotion ? clamp(1 - o, 0, 1) : clamp((1 - o) / 0.45, 0, 1);
  });

  // Cards further back sit in shadow.
  const shade = useTransform(offset, (o) => (o < 0 ? Math.min(0.72, -o * 0.26) : 0));

  const number = String(index + 1).padStart(2, "0");
  const count = String(total).padStart(2, "0");

  return (
    <motion.li
      style={{
        rotateX,
        y,
        scale,
        opacity,
        zIndex: total - index,
        transformOrigin: "50% 0%",
      }}
      className={`absolute inset-0 overflow-hidden rounded-[1.25rem] ring-1 ring-bone/10 will-change-transform [container-type:inline-size] ${card.art}`}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/35 to-transparent" />

      <span
        aria-hidden
        className="pointer-events-none absolute -right-[4cqw] top-[30%] select-none font-display text-[38cqw] leading-none text-bone/[0.045]"
      >
        {card.ghost}
      </span>

      <p className="eyebrow absolute left-[7cqw] top-[7cqw] text-gold/70 tabular-nums">
        {number} / {count}
      </p>

      <div className="absolute inset-x-0 bottom-0 p-[7cqw]">
        <p className="eyebrow text-gold">The {card.archetype}</p>
        <h2 className="mt-[4cqw] font-display text-[clamp(1.5rem,9.5cqw,2.5rem)] leading-[1.04] text-bone">
          {card.headline.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        <p className="mt-[3cqw] text-[clamp(0.8125rem,4cqw,1rem)] text-bone/55">
          {card.sub}
        </p>
      </div>

      <motion.div
        aria-hidden
        style={{ opacity: shade }}
        className="pointer-events-none absolute inset-0 bg-ink"
      />
    </motion.li>
  );
}
