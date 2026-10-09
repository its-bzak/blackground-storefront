import type { Metadata } from "next";

import { Quiz } from "@/components/quiz/Quiz";

export const metadata: Metadata = {
  title: "Find your archetype",
  description: "Eight questions. One of eight Blackground archetypes.",
};

export default function QuizPage() {
  return <Quiz />;
}
