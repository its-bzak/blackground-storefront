import "server-only";

import { ARCHETYPES, archetypeSlug, type Archetype } from "@/lib/archetypes";
import type { Answers, QuizResult } from "@/lib/quiz/scoring";

import { ShopifyError, admin, type UserError } from "./client";

// The Storefront API can't write customer tags or metafields, so this goes
// through the Admin API. Requires the write_customers scope.
//
//   custom.archetype       single-line text, the source of truth
//   custom.archetype_quiz  JSON, the full result for later use
//   tag archetype:<slug>   for customer segments and email tools
//
// Root fields of a mutation run in order, so the old tags are gone before the
// new one is added.
export const SAVE_ARCHETYPE_MUTATION = /* GraphQL */ `
  mutation SaveArchetype(
    $id: ID!
    $metafields: [MetafieldsSetInput!]!
    $add: [String!]!
    $remove: [String!]!
  ) {
    metafieldsSet(metafields: $metafields) {
      userErrors { field message code }
    }
    tagsRemove(id: $id, tags: $remove) {
      userErrors { field message }
    }
    tagsAdd(id: $id, tags: $add) {
      userErrors { field message }
    }
  }
`;

const METAFIELD_NAMESPACE = "custom";

export function archetypeTag(archetype: Archetype): string {
  return `archetype:${archetypeSlug(archetype)}`;
}

type Payload = { userErrors: UserError[] } | null;

export async function saveArchetype(
  customerId: string,
  answers: Answers,
  result: QuizResult,
): Promise<void> {
  const profile = {
    version: 1,
    primary: result.primary,
    secondary: result.secondary,
    resourceLens: result.resourceLens,
    aestheticLens: result.aestheticLens,
    scores: result.scores,
    answers,
    completedAt: new Date().toISOString(),
  };

  const data = await admin<{
    metafieldsSet: Payload;
    tagsRemove: Payload;
    tagsAdd: Payload;
  }>(SAVE_ARCHETYPE_MUTATION, {
    id: customerId,
    metafields: [
      {
        ownerId: customerId,
        namespace: METAFIELD_NAMESPACE,
        key: "archetype",
        type: "single_line_text_field",
        value: result.primary,
      },
      {
        ownerId: customerId,
        namespace: METAFIELD_NAMESPACE,
        key: "archetype_quiz",
        type: "json",
        value: JSON.stringify(profile),
      },
    ],
    add: [archetypeTag(result.primary)],
    remove: ARCHETYPES.filter((a) => a !== result.primary).map(archetypeTag),
  });

  const errors = [data.metafieldsSet, data.tagsAdd].flatMap(
    (payload) => payload?.userErrors ?? [],
  );
  if (errors.length > 0) {
    throw new ShopifyError(errors.map((e) => e.message).join("; "));
  }

  // Clearing old tags is housekeeping. Most of them won't be on the customer,
  // and a complaint about that must not undo a result that did save.
  const cleanup = data.tagsRemove?.userErrors ?? [];
  if (cleanup.length > 0) {
    console.warn(
      "Archetype saved, but old tags were not cleared:",
      cleanup.map((e) => e.message).join("; "),
    );
  }
}
