import { NextResponse, type NextRequest } from "next/server";

import { parseAnswers, scoreQuiz } from "@/lib/quiz/scoring";
import { getCustomerToken } from "@/lib/session";
import { saveArchetype } from "@/lib/shopify/archetype";
import { getCustomer } from "@/lib/shopify/customer";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients don't send it.
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

// Nobody signed in is an ordinary outcome for this endpoint, not a failure, so
// it answers 200 and the page offers sign-in. (A 401 would also put a red
// network error in every anonymous visitor's console.)
const SIGNED_OUT = { saved: false, reason: "signed-out" } as const;

// Saves the quiz result to the signed-in customer. The browser sends answers
// only; the archetype is always worked out here.
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const answers = parseAnswers(
    typeof body === "object" && body !== null
      ? (body as { answers?: unknown }).answers
      : null,
  );
  if (!answers) {
    return NextResponse.json({ error: "invalid_answers" }, { status: 400 });
  }

  const token = await getCustomerToken();
  if (!token) return NextResponse.json(SIGNED_OUT);

  try {
    // The access token proves who this is; a customer id is never accepted
    // from the client. An expired token resolves to no customer.
    const customer = await getCustomer(token);
    if (!customer) return NextResponse.json(SIGNED_OUT);

    const result = scoreQuiz(answers);
    await saveArchetype(customer.id, answers, result);

    return NextResponse.json({ saved: true, archetype: result.primary });
  } catch (error) {
    console.error("Saving the archetype failed", error);
    return NextResponse.json({ error: "save_failed" }, { status: 502 });
  }
}
