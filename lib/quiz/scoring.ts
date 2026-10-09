// Pure scoring for the archetype quiz. Runs in the browser for the instant
// result and again on the server before anything is written to Shopify.
// Relative ".ts" imports keep this runnable under plain `node --test`.
import {
  ARCHETYPES,
  type AestheticLens,
  type Archetype,
  type ResourceLens,
} from "../archetypes.ts";

export const QUESTION_IDS = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Q5",
  "Q6",
  "Q7",
  "Q8",
] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export const ANSWER_IDS = ["A", "B", "C", "D"] as const;
export type AnswerId = (typeof ANSWER_IDS)[number];

export type Answers = Record<QuestionId, AnswerId>;
export type PartialAnswers = Partial<Answers>;

type Pair = readonly [Archetype, Archetype];

export const SCORING_MAP: Record<QuestionId, Record<AnswerId, Pair>> = {
  Q1: {
    A: ["Renaissance", "System Breaker"],
    B: ["Legacy Builder", "Culture Carrier"],
    C: ["Quiet Storm", "Self-Made"],
    D: ["Renaissance", "First-Gen"],
  },
  Q2: {
    A: ["First-Gen", "Legacy Builder"],
    B: ["Self-Made", "First-Gen"],
    C: ["Self-Made", "System Breaker"],
    D: ["Dual Citizen", "Renaissance"],
  },
  Q3: {
    A: ["Legacy Builder", "Culture Carrier"],
    B: ["First-Gen", "Self-Made"],
    C: ["Renaissance", "System Breaker"],
    D: ["Quiet Storm", "Dual Citizen"],
  },
  Q4: {
    A: ["Quiet Storm", "Self-Made"],
    B: ["Legacy Builder", "Culture Carrier"],
    C: ["System Breaker", "Renaissance"],
    D: ["Renaissance", "First-Gen"],
  },
  Q5: {
    A: ["Legacy Builder", "Culture Carrier"],
    B: ["Self-Made", "Renaissance"],
    C: ["Dual Citizen", "Culture Carrier"],
    D: ["System Breaker", "First-Gen"],
  },
  Q6: {
    A: ["Legacy Builder", "Quiet Storm"],
    B: ["Culture Carrier", "First-Gen"],
    C: ["Renaissance", "Self-Made"],
    D: ["Quiet Storm", "System Breaker"],
  },
  Q7: {
    A: ["Culture Carrier", "Legacy Builder"],
    B: ["First-Gen", "Legacy Builder"],
    C: ["System Breaker", "Self-Made"],
    D: ["Dual Citizen", "System Breaker"],
  },
  Q8: {
    A: ["Legacy Builder", "Culture Carrier"],
    B: ["Self-Made", "System Breaker"],
    C: ["Quiet Storm", "First-Gen"],
    D: ["Renaissance", "Dual Citizen"],
  },
};

// lens_tag for Q2 (how they treat resources) and Q4 (visual self-image).
export const RESOURCE_LENS_BY_ANSWER: Record<AnswerId, ResourceLens> = {
  A: "family-first",
  B: "debt-first",
  C: "invest-first",
  D: "experience-first",
};

export const AESTHETIC_LENS_BY_ANSWER: Record<AnswerId, AestheticLens> = {
  A: "monochrome-minimal",
  B: "warmth-heritage",
  C: "solo-elevated",
  D: "maker-disheveled",
};

// Q8 is the identity statement, so it counts double.
const QUESTION_WEIGHT: Partial<Record<QuestionId, number>> = { Q8: 2 };

// Equal scores are settled by who scored on these questions, in this order.
const TIEBREAK_QUESTIONS: readonly QuestionId[] = ["Q8", "Q7", "Q5"];

export type QuizResult = {
  primary: Archetype;
  secondary: Archetype;
  resourceLens: ResourceLens;
  aestheticLens: AestheticLens;
  scores: Record<Archetype, number>;
  // All eight, best first, with ties already broken. ranking[0] is primary.
  ranking: Archetype[];
};

function isAnswerId(value: unknown): value is AnswerId {
  return (
    typeof value === "string" &&
    (ANSWER_IDS as readonly string[]).includes(value)
  );
}

export function isComplete(answers: PartialAnswers): answers is Answers {
  return QUESTION_IDS.every((id) => isAnswerId(answers[id]));
}

// Keeps only well-formed answers. Used for anything read back from storage.
export function sanitizeAnswers(input: unknown): PartialAnswers {
  if (typeof input !== "object" || input === null) return {};
  const record = input as Record<string, unknown>;
  const answers: PartialAnswers = {};
  for (const id of QUESTION_IDS) {
    const value = record[id];
    if (isAnswerId(value)) answers[id] = value;
  }
  return answers;
}

// Strict: all eight questions answered, or null. Used at the API boundary.
export function parseAnswers(input: unknown): Answers | null {
  const answers = sanitizeAnswers(input);
  return isComplete(answers) ? answers : null;
}

export function scoreQuiz(answers: Answers): QuizResult {
  const scores = {} as Record<Archetype, number>;
  const hits = {} as Record<Archetype, Partial<Record<QuestionId, number>>>;
  const earliestHit = {} as Record<Archetype, number>;

  for (const archetype of ARCHETYPES) {
    scores[archetype] = 0;
    hits[archetype] = {};
    earliestHit[archetype] = Number.POSITIVE_INFINITY;
  }

  QUESTION_IDS.forEach((questionId, index) => {
    const weight = QUESTION_WEIGHT[questionId] ?? 1;
    for (const archetype of SCORING_MAP[questionId][answers[questionId]]) {
      scores[archetype] += weight;
      hits[archetype][questionId] = weight;
      if (index < earliestHit[archetype]) earliestHit[archetype] = index;
    }
  });

  const ranking = [...ARCHETYPES].sort((left, right) => {
    if (scores[right] !== scores[left]) return scores[right] - scores[left];

    for (const questionId of TIEBREAK_QUESTIONS) {
      const rightHit = hits[right][questionId] ?? 0;
      const leftHit = hits[left][questionId] ?? 0;
      if (rightHit !== leftHit) return rightHit - leftHit;
    }

    if (earliestHit[left] !== earliestHit[right]) {
      return earliestHit[left] - earliestHit[right];
    }

    return ARCHETYPES.indexOf(left) - ARCHETYPES.indexOf(right);
  });

  return {
    primary: ranking[0],
    secondary: ranking[1],
    resourceLens: RESOURCE_LENS_BY_ANSWER[answers.Q2],
    aestheticLens: AESTHETIC_LENS_BY_ANSWER[answers.Q4],
    scores,
    ranking,
  };
}
