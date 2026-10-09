// Canonical order. Also the last-resort tie-break in lib/quiz/scoring.ts, so don't reorder.
export const ARCHETYPES = [
  "Renaissance",
  "System Breaker",
  "Legacy Builder",
  "Culture Carrier",
  "Quiet Storm",
  "Self-Made",
  "First-Gen",
  "Dual Citizen",
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export function archetypeSlug(archetype: Archetype): string {
  return archetype.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export type ArchetypeCopy = {
  description: string;
  signal: string;
  perspective: string;
};

export const ARCHETYPE_COPY: Record<Archetype, ArchetypeCopy> = {
  Renaissance: {
    description: "You move with range, curiosity, and creative flexibility.",
    signal: "Range without fragmentation",
    perspective:
      "You do not need one lane to be legible. Your power comes from synthesis, taste, and the ability to move between ideas without losing yourself.",
  },
  "System Breaker": {
    description: "You question inherited rules and build new paths.",
    signal: "New paths over inherited scripts",
    perspective:
      "You can feel where structures stop serving you. Your instinct is not just to critique the frame, but to design a better one and move first.",
  },
  "Legacy Builder": {
    description:
      "You are focused on building something that lasts beyond the present moment.",
    signal: "Durability over spectacle",
    perspective:
      "You are motivated by what stays. Even your ambition has roots: ownership, responsibility, and the desire to leave something stronger than you found it.",
  },
  "Culture Carrier": {
    description:
      "You carry memory, place, and tradition into everything you do.",
    signal: "Memory as a living resource",
    perspective:
      "You treat history as active material. What you keep, repeat, and pass forward is part of the work, not separate from it.",
  },
  "Quiet Storm": {
    description: "Your presence is measured, intentional, and deeply felt.",
    signal: "Restraint with impact",
    perspective:
      "You are not interested in noise for its own sake. Your influence lands through precision, control, and knowing when presence says more than explanation.",
  },
  "Self-Made": {
    description: "You know what it means to build from what you had.",
    signal: "Resourcefulness under pressure",
    perspective:
      "You trust what you can create with your own hands, mind, and discipline. Independence is not branding for you; it is lived practice.",
  },
  "First-Gen": {
    description:
      "You are navigating rooms and responsibilities that did not come with a manual.",
    signal: "Navigation without a map",
    perspective:
      "You are translating across expectations, institutions, and family stakes in real time. Your growth carries both personal ambition and collective weight.",
  },
  "Dual Citizen": {
    description: "You live between places, contexts, and versions of home.",
    signal: "Belonging in more than one place",
    perspective:
      "You understand how identity shifts across geography, class, and context. Your sensitivity to contrast becomes part of your instinct and taste.",
  },
};

export type ArchetypeCard = {
  archetype: Archetype;
  headline: readonly string[];
  sub: string;
  ghost: string;
  // Class in app/globals.css that paints the card face.
  art: string;
};

// Hero deck, front card first.
export const ARCHETYPE_CARDS: readonly ArchetypeCard[] = [
  {
    archetype: "Legacy Builder",
    headline: ["You're not the first.", "You won't be the last."],
    sub: "You're the link.",
    ghost: "LEGACY",
    art: "art-legacy",
  },
  {
    archetype: "First-Gen",
    headline: ["Everyone's watching.", "You're figuring it out."],
    sub: "In real time.",
    ghost: "FIRST",
    art: "art-first",
  },
  {
    archetype: "Self-Made",
    headline: ["Nobody handed", "you anything."],
    sub: "That's why the fit is so clean.",
    ghost: "MADE",
    art: "art-made",
  },
  {
    archetype: "Renaissance",
    headline: ["You do five things.", "You're actually good"],
    sub: "at four of them.",
    ghost: "FIVE",
    art: "art-renaissance",
  },
  {
    archetype: "Quiet Storm",
    headline: ["You don't announce."],
    sub: "You arrive.",
    ghost: "STORM",
    art: "art-storm",
  },
  {
    archetype: "Culture Carrier",
    headline: ["I don't borrow culture."],
    sub: "I protect it.",
    ghost: "CULTURE",
    art: "art-culture",
  },
  {
    archetype: "Dual Citizen",
    headline: ["Your Blackground has", "a passport stamp."],
    sub: "And an accent your mother still corrects.",
    ghost: "BOTH",
    art: "art-dual",
  },
  {
    archetype: "System Breaker",
    headline: ["You see the structure."],
    sub: "You challenge it.",
    ghost: "BREAK",
    art: "art-breaker",
  },
];

export type LensCopy = { title: string; description: string; emphasis: string };

export const RESOURCE_LENS_COPY = {
  "family-first": {
    title: "Family-First",
    description:
      "Your decisions are filtered through care, reciprocity, and what your people need next.",
    emphasis: "Security means shared stability, not just individual relief.",
  },
  "debt-first": {
    title: "Debt-First",
    description:
      "Relief and stability matter. You want freedom that changes the weight you carry every day.",
    emphasis: "You define wealth as reduced pressure and more room to breathe.",
  },
  "invest-first": {
    title: "Invest-First",
    description:
      "You think in systems, leverage, and what compounds over time.",
    emphasis:
      "You are oriented toward future ownership, not just immediate reward.",
  },
  "experience-first": {
    title: "Experience-First",
    description:
      "You value memory, movement, and the feeling of being fully present in your own life.",
    emphasis:
      "You want money to become motion, perspective, and lived memory.",
  },
} as const satisfies Record<string, LensCopy>;

export const AESTHETIC_LENS_COPY = {
  "monochrome-minimal": {
    title: "Monochrome Minimal",
    description:
      "You are drawn to restraint, precision, and a silhouette that speaks without noise.",
    emphasis: "Clean lines, discipline, and intentional calm.",
  },
  "warmth-heritage": {
    title: "Warmth Heritage",
    description:
      "You want texture, memory, and spaces that feel lived-in and inherited.",
    emphasis: "Atmosphere, softness, and the feeling of story in the room.",
  },
  "solo-elevated": {
    title: "Solo Elevated",
    description:
      "You move toward polish, height, and a mood that feels deliberate and self-possessed.",
    emphasis: "Clarity, altitude, and a composed sense of arrival.",
  },
  "maker-disheveled": {
    title: "Maker Disheveled",
    description:
      "You are most yourself in process, around materials, worktables, and unfinished ideas becoming real.",
    emphasis: "Texture, process, and creative evidence left in plain view.",
  },
} as const satisfies Record<string, LensCopy>;

export type ResourceLens = keyof typeof RESOURCE_LENS_COPY;
export type AestheticLens = keyof typeof AESTHETIC_LENS_COPY;
