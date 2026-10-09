import type { AnswerId, QuestionId } from "./scoring.ts";

export type QuizOption = {
  id: AnswerId;
  text: string;
  // Visual questions only. `description` is the brief for the photograph and
  // doubles as its alt text; `image` is a path under /public once it exists.
  description?: string;
  image?: string;
};

export type QuizQuestion = {
  id: QuestionId;
  theme: string;
  stem: string;
  visual?: boolean;
  options: readonly QuizOption[];
};

export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "Q1",
    theme: "Pace",
    stem: "What does a successful Sunday look like?",
    options: [
      { id: "A", text: "Long brunch with four people I actually like" },
      {
        id: "B",
        text: "Cooking something that took all afternoon, for the people I love",
      },
      { id: "C", text: "Nothing on the calendar. Nothing." },
      { id: "D", text: "Three things back-to-back and I'm thriving" },
    ],
  },
  {
    id: "Q2",
    theme: "Resources",
    stem: "A check for $50K hits tomorrow. What's the first thing you do with it?",
    options: [
      { id: "A", text: "Send some to my mama. Or whoever raised me." },
      { id: "B", text: "Pay off the card. Then breathe." },
      {
        id: "C",
        text: "Most of it goes in investments. I'll find something nice later.",
      },
      {
        id: "D",
        text: "Book the trip I've been talking about for two years.",
      },
    ],
  },
  {
    id: "Q3",
    theme: "Reputation",
    stem: "When people describe you to someone who hasn't met you, what do they say?",
    options: [
      {
        id: "A",
        text: "“They're solid. Always thinking long-term. Someone you can rely on.”",
      },
      { id: "B", text: "“They came up. And they're not done.”" },
      {
        id: "C",
        text: "“They're different. Creative. Hard to put in a box.”",
      },
      {
        id: "D",
        text: "“They're quiet — but when they speak or show up, you feel it.”",
      },
    ],
  },
  {
    id: "Q4",
    theme: "Self-image",
    stem: "Which of these feels most like you right now?",
    visual: true,
    // Add `image: "/quiz/<file>.jpg"` to each option when the photography arrives.
    options: [
      {
        id: "A",
        text: "Monochrome Minimal",
        description:
          "Black subject in fitted all-black, hands in pockets, neutral background, intentional stillness",
      },
      {
        id: "B",
        text: "Warmth Heritage",
        description:
          "Black subject in warm scene, multi-generational gathering, food visible, natural light",
      },
      {
        id: "C",
        text: "Solo Elevated",
        description:
          "Black subject in solo portrait, rooftop or elevated space, golden hour, glass or cigar in hand",
      },
      {
        id: "D",
        text: "Maker Disheveled",
        description:
          "Black subject in candid creative workspace, mid-project, materials around",
      },
    ],
  },
  {
    id: "Q5",
    theme: "Identity",
    stem: "Which question makes you sit with it longest?",
    options: [
      { id: "A", text: "“What did your grandparents do?”" },
      { id: "B", text: "“What are you building?”" },
      { id: "C", text: "“Where are you really from?”" },
      { id: "D", text: "“Who taught you to question that?”" },
    ],
  },
  {
    id: "Q6",
    theme: "Recognition",
    stem: "What compliment would actually mean something to you?",
    options: [
      {
        id: "A",
        text: "“You have the best taste of anyone I know.”",
      },
      { id: "B", text: "“You're the realest person in my life.”" },
      {
        id: "C",
        text: "“I don't know how you do everything you do.”",
      },
      { id: "D", text: "“You make it look easy.”" },
    ],
  },
  {
    id: "Q7",
    theme: "Home",
    stem: "Where's home to you?",
    options: [
      { id: "A", text: "The place that raised me. I carry it with me." },
      {
        id: "B",
        text: "Wherever my family is. That's always been the real answer.",
      },
      { id: "C", text: "A city I chose for myself. Not the one I was given." },
      {
        id: "D",
        text: "Two places. And I'm still negotiating which one wins.",
      },
    ],
  },
  {
    id: "Q8",
    theme: "Completion",
    stem: "Finish this: “My Blackground is the reason I —”",
    options: [
      { id: "A", text: "know exactly who I am." },
      { id: "B", text: "don't stop building." },
      { id: "C", text: "don't need the applause." },
      { id: "D", text: "can walk into any room." },
    ],
  },
];
