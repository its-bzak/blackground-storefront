import assert from "node:assert/strict";
import { test } from "node:test";

import { ARCHETYPES } from "../archetypes.ts";
import {
  ANSWER_IDS,
  QUESTION_IDS,
  SCORING_MAP,
  parseAnswers,
  sanitizeAnswers,
  scoreQuiz,
  type AnswerId,
  type Answers,
} from "./scoring.ts";

function answers(letters: string): Answers {
  assert.equal(letters.length, QUESTION_IDS.length);
  const parsed = parseAnswers(
    Object.fromEntries(QUESTION_IDS.map((id, i) => [id, letters[i]])),
  );
  assert.ok(parsed, `invalid answer string: ${letters}`);
  return parsed;
}

test("all A: Legacy Builder leads, Culture Carrier second", () => {
  const result = scoreQuiz(answers("AAAAAAAA"));

  assert.deepEqual(result.scores, {
    Renaissance: 1,
    "System Breaker": 1,
    "Legacy Builder": 7,
    "Culture Carrier": 5,
    "Quiet Storm": 2,
    "Self-Made": 1,
    "First-Gen": 1,
    "Dual Citizen": 0,
  });
  assert.equal(result.primary, "Legacy Builder");
  assert.equal(result.secondary, "Culture Carrier");
  assert.equal(result.resourceLens, "family-first");
  assert.equal(result.aestheticLens, "monochrome-minimal");
});

test("all B: Self-Made wins on the Q8 double weight", () => {
  const result = scoreQuiz(answers("BBBBBBBB"));

  assert.equal(result.scores["Self-Made"], 5);
  assert.equal(result.scores["First-Gen"], 4);
  assert.equal(result.primary, "Self-Made");
  assert.equal(result.secondary, "First-Gen");
  assert.equal(result.resourceLens, "debt-first");
  assert.equal(result.aestheticLens, "warmth-heritage");
});

test("three-way tie is settled by Q8, then Q7", () => {
  // Renaissance, System Breaker and Legacy Builder all finish on 4.
  const result = scoreQuiz(answers("AACCBADA"));

  assert.equal(result.scores.Renaissance, 4);
  assert.equal(result.scores["System Breaker"], 4);
  assert.equal(result.scores["Legacy Builder"], 4);
  // Legacy Builder scored on Q8; System Breaker scored on Q7; Renaissance on neither.
  assert.equal(result.primary, "Legacy Builder");
  assert.equal(result.secondary, "System Breaker");
  assert.equal(result.resourceLens, "family-first");
  assert.equal(result.aestheticLens, "solo-elevated");
});

test("tie level on Q8 and Q7 is settled by Q5", () => {
  // Legacy Builder and Culture Carrier both finish on 5 and both scored on Q7.
  const result = scoreQuiz(answers("BAABCCAD"));

  assert.equal(result.scores["Legacy Builder"], 5);
  assert.equal(result.scores["Culture Carrier"], 5);
  // Only Culture Carrier scored on Q5, so it beats the earlier-listed Legacy Builder.
  assert.equal(result.primary, "Culture Carrier");
  assert.equal(result.secondary, "Legacy Builder");
  // The ranking lists them in that same order, not by name or map order.
  assert.deepEqual(result.ranking.slice(0, 2), [
    "Culture Carrier",
    "Legacy Builder",
  ]);
});

test("every possible answer sheet scores 18 points and ranks its top scorer first", () => {
  const letters = ANSWER_IDS;
  const total = letters.length ** QUESTION_IDS.length;

  for (let n = 0; n < total; n++) {
    let rest = n;
    const sheet = {} as Record<string, AnswerId>;
    for (const id of QUESTION_IDS) {
      sheet[id] = letters[rest % letters.length];
      rest = Math.floor(rest / letters.length);
    }

    const result = scoreQuiz(sheet as Answers);
    const values = Object.values(result.scores);

    assert.equal(
      values.reduce((sum, value) => sum + value, 0),
      18,
    );
    assert.equal(result.scores[result.primary], Math.max(...values));
    assert.notEqual(result.primary, result.secondary);

    // The ranking holds every archetype once, never rising in score.
    assert.equal(new Set(result.ranking).size, ARCHETYPES.length);
    assert.equal(result.ranking[0], result.primary);
    assert.equal(result.ranking[1], result.secondary);
    for (let i = 1; i < result.ranking.length; i++) {
      assert.ok(
        result.scores[result.ranking[i]] <= result.scores[result.ranking[i - 1]],
      );
    }
  }
});

test("scoring map only names known archetypes, two per answer", () => {
  for (const questionId of QUESTION_IDS) {
    for (const answerId of ANSWER_IDS) {
      const pair = SCORING_MAP[questionId][answerId];
      assert.equal(pair.length, 2);
      assert.notEqual(pair[0], pair[1]);
      for (const archetype of pair) assert.ok(ARCHETYPES.includes(archetype));
    }
  }
});

test("parseAnswers rejects incomplete or malformed input", () => {
  assert.equal(parseAnswers(null), null);
  assert.equal(parseAnswers("AAAAAAAA"), null);
  assert.equal(parseAnswers({ Q1: "A" }), null);
  assert.equal(
    parseAnswers({
      Q1: "A",
      Q2: "A",
      Q3: "A",
      Q4: "A",
      Q5: "A",
      Q6: "A",
      Q7: "A",
      Q8: "E",
    }),
    null,
  );
});

test("sanitizeAnswers keeps valid answers and drops the rest", () => {
  assert.deepEqual(
    sanitizeAnswers({ Q1: "B", Q2: "Z", Q9: "A", extra: true }),
    { Q1: "B" },
  );
});
