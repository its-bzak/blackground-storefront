"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { setStoredAnswers, useStoredAnswers } from "@/lib/quiz/answer-store";
import {
  QUESTIONS,
  type QuizOption,
  type QuizQuestion,
} from "@/lib/quiz/questions";
import { isComplete, type AnswerId } from "@/lib/quiz/scoring";

import { QuizResult } from "./QuizResult";

const TOTAL = QUESTIONS.length;
const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = 1 | -1;
// step is null until the visitor moves; until then the quiz resumes wherever
// the stored answers leave off.
type View = { step: number | null; direction: Direction };

export function Quiz() {
  const answers = useStoredAnswers();
  const reduceMotion = useReducedMotion() ?? false;
  const [view, setView] = useState<View>({ step: null, direction: 1 });

  const firstOpen = QUESTIONS.findIndex((question) => !answers[question.id]);
  const step = view.step ?? (firstOpen === -1 ? TOTAL : firstOpen);

  const go = (next: number, direction: Direction) =>
    setView({ step: next, direction });

  if (step >= TOTAL && isComplete(answers)) {
    return (
      <QuizResult
        answers={answers}
        onReview={() => go(TOTAL - 1, -1)}
        onRetake={() => {
          setStoredAnswers({});
          go(0, -1);
        }}
      />
    );
  }

  const index = Math.min(step, TOTAL - 1);
  const question = QUESTIONS[index];
  const selected = answers[question.id];
  const isLast = index === TOTAL - 1;

  const choose = (answer: AnswerId) => {
    // Pin the step so choosing an answer doesn't jump ahead on its own.
    setView((current) => ({ ...current, step: index }));
    setStoredAnswers({ ...answers, [question.id]: answer });
  };

  const offset = reduceMotion ? 0 : 28;
  const variants = {
    enter: (direction: Direction) => ({ opacity: 0, y: direction * offset }),
    center: { opacity: 1, y: 0 },
    exit: (direction: Direction) => ({ opacity: 0, y: direction * -offset }),
  };

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-4xl flex-col px-5 pb-8 pt-8 md:px-10 md:pb-12 md:pt-14">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow text-gold tabular-nums" aria-live="polite">
          Question {String(index + 1).padStart(2, "0")} /{" "}
          {String(TOTAL).padStart(2, "0")}
        </p>
        <p className="eyebrow text-bone/50">{question.theme}</p>
      </div>

      <div className="mt-4 h-px bg-bone/15" aria-hidden>
        <motion.div
          className="h-px origin-left bg-gold"
          initial={false}
          animate={{ scaleX: (index + (selected ? 1 : 0)) / TOTAL }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      <form
        className="flex flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          if (selected) go(index + 1, 1);
        }}
      >
        <div className="flex flex-1 flex-col justify-center py-10 md:py-14">
          <AnimatePresence mode="wait" initial={false} custom={view.direction}>
            <motion.fieldset
              key={question.id}
              custom={view.direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
              className="min-w-0"
            >
              <legend className="font-display text-[clamp(2rem,6.2vw,3.75rem)] leading-[1.05] text-balance">
                {question.stem}
              </legend>

              {question.visual ? (
                <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-4">
                  {question.options.map((option) => (
                    <VisualOption
                      key={option.id}
                      question={question}
                      option={option}
                      checked={selected === option.id}
                      onChoose={choose}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-10 border-t border-bone/15">
                  {question.options.map((option) => (
                    <TextOption
                      key={option.id}
                      question={question}
                      option={option}
                      checked={selected === option.id}
                      onChoose={choose}
                    />
                  ))}
                </div>
              )}
            </motion.fieldset>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => go(index - 1, -1)}
            disabled={index === 0}
            className="eyebrow py-3 text-bone/70 transition-colors hover:text-gold disabled:pointer-events-none disabled:opacity-0"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!selected}
            className="eyebrow rounded-full border border-bone/30 px-8 py-3.5 transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30"
          >
            {isLast ? "See my result" : "Next"}
          </button>
        </div>
      </form>
    </main>
  );
}

type OptionProps = {
  question: QuizQuestion;
  option: QuizOption;
  checked: boolean;
  onChoose: (answer: AnswerId) => void;
};

const focusRing =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-gold";

function TextOption({ question, option, checked, onChoose }: OptionProps) {
  return (
    <label
      className={`flex cursor-pointer items-baseline gap-5 border-b border-bone/15 py-5 text-bone/80 transition-colors hover:text-bone has-[:checked]:text-gold ${focusRing}`}
    >
      <input
        type="radio"
        name={question.id}
        value={option.id}
        checked={checked}
        onChange={() => onChoose(option.id)}
        className="peer sr-only"
      />
      <span className="eyebrow w-4 shrink-0 text-bone/40 peer-checked:text-gold">
        {option.id}
      </span>
      <span className="text-lg leading-snug md:text-xl">{option.text}</span>
      <span
        aria-hidden
        className="ml-auto size-1.5 shrink-0 self-center rounded-full bg-gold opacity-0 transition-opacity peer-checked:opacity-100"
      />
    </label>
  );
}

function VisualOption({ question, option, checked, onChoose }: OptionProps) {
  return (
    <label className={`block cursor-pointer ${focusRing}`}>
      <input
        type="radio"
        name={question.id}
        value={option.id}
        checked={checked}
        onChange={() => onChoose(option.id)}
        className="peer sr-only"
      />
      <span className="relative block aspect-[3/4] overflow-hidden bg-coal ring-1 ring-bone/10 transition-shadow peer-checked:ring-2 peer-checked:ring-gold">
        {option.image ? (
          <Image
            src={option.image}
            alt={option.description ?? option.text}
            fill
            unoptimized
            sizes="(min-width: 768px) 22vw, 46vw"
            className="object-cover"
          />
        ) : (
          // Stand-in until the photograph for this answer is supplied.
          <span className="absolute inset-0 flex items-end p-4 text-sm leading-snug text-bone/50">
            {option.description}
          </span>
        )}
      </span>
      <span className="eyebrow mt-3 flex gap-3 text-bone/70 peer-checked:text-gold">
        <span className="text-bone/40">{option.id}</span>
        {option.text}
      </span>
    </label>
  );
}
