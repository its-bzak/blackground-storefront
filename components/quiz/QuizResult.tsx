"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  AESTHETIC_LENS_COPY,
  ARCHETYPE_COPY,
  RESOURCE_LENS_COPY,
} from "@/lib/archetypes";
import { scoreQuiz, type Answers } from "@/lib/quiz/scoring";

type SaveStatus = "saving" | "saved" | "signed-out" | "error";

type Props = {
  answers: Answers;
  onReview: () => void;
  onRetake: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const action =
  "eyebrow border-b border-bone/40 pb-1 transition-colors hover:border-gold hover:text-gold";

export function QuizResult({ answers, onReview, onRetake }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const [save, setSave] = useState<{ status: SaveStatus; attempt: number }>({
    status: "saving",
    attempt: 0,
  });

  const result = scoreQuiz(answers);
  const primary = ARCHETYPE_COPY[result.primary];
  const secondary = ARCHETYPE_COPY[result.secondary];
  const resource = RESOURCE_LENS_COPY[result.resourceLens];
  const aesthetic = AESTHETIC_LENS_COPY[result.aestheticLens];

  const topScore = result.scores[result.primary];

  // Send the answers, not the result: the server scores them again itself.
  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/quiz/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Save failed: ${response.status}`);
        // 200 with saved: false means nobody is signed in.
        const { saved } = (await response.json()) as { saved: boolean };
        setSave((current) => ({
          ...current,
          status: saved ? "saved" : "signed-out",
        }));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSave((current) => ({ ...current, status: "error" }));
      });

    return () => controller.abort();
  }, [answers, save.attempt]);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-28 pt-10 md:px-10 md:pt-20">
      <motion.p {...rise(0)} className="eyebrow text-gold">
        Your archetype
      </motion.p>
      <motion.h1
        {...rise(0.08)}
        className="mt-5 font-display text-[clamp(3rem,11.5vw,7.5rem)] leading-[0.95]"
      >
        The {result.primary}
      </motion.h1>
      <motion.p
        {...rise(0.16)}
        className="mt-7 max-w-xl text-lg leading-relaxed text-bone/75 md:text-xl"
      >
        {primary.description}
      </motion.p>

      <motion.div {...rise(0.24)} className="mt-8 min-h-6" role="status">
        {save.status === "saving" && (
          <p className="eyebrow text-bone/50">Saving to your profile&hellip;</p>
        )}
        {save.status === "saved" && (
          <p className="eyebrow text-gold">Saved to your profile</p>
        )}
        {save.status === "signed-out" && (
          <Link href="/account/login?next=/quiz" className={action}>
            Sign in to save this to your profile
          </Link>
        )}
        {save.status === "error" && (
          <p className="eyebrow text-bone/60">
            We couldn&rsquo;t save this just now.{" "}
            <button
              type="button"
              className={action}
              onClick={() =>
                setSave((current) => ({
                  status: "saving",
                  attempt: current.attempt + 1,
                }))
              }
            >
              Try again
            </button>
          </p>
        )}
      </motion.div>

      <motion.dl
        {...rise(0.32)}
        className="mt-16 grid gap-px bg-bone/10 md:grid-cols-2"
      >
        <Panel label="Primary read" title={primary.signal}>
          {primary.perspective}
        </Panel>
        <Panel label="Shaped by" title={`The ${result.secondary}`}>
          {secondary.perspective}
        </Panel>
        <Panel label="Resource lens" title={resource.title}>
          {resource.description} {resource.emphasis}
        </Panel>
        <Panel label="Aesthetic lens" title={aesthetic.title}>
          {aesthetic.description} {aesthetic.emphasis}
        </Panel>
      </motion.dl>

      <section className="mt-16" aria-labelledby="spread">
        <h2 id="spread" className="eyebrow text-bone/50">
          How your answers spread
        </h2>
        <ol className="mt-6 space-y-3">
          {result.ranking.map((name) => {
            const score = result.scores[name];
            return (
              <li
                key={name}
                className="grid grid-cols-[9.5rem_1fr_1.5rem] items-center gap-4 text-sm"
              >
                <span
                  className={name === result.primary ? "text-gold" : "text-bone/70"}
                >
                  {name}
                </span>
                <span className="h-px bg-bone/10">
                  <span
                    className="block h-px origin-left bg-gold"
                    style={{ transform: `scaleX(${score / topScore})` }}
                  />
                </span>
                <span className="text-right text-bone/50 tabular-nums">
                  {score}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-16 flex flex-wrap gap-x-10 gap-y-5">
        <Link href="/collections/all" className={`${action} text-gold`}>
          Shop the collection
        </Link>
        <button type="button" onClick={onReview} className={action}>
          Review answers
        </button>
        <button type="button" onClick={onRetake} className={action}>
          Retake the quiz
        </button>
      </div>
    </main>
  );
}

function Panel({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-ink py-8 md:p-10">
      <dt>
        <span className="eyebrow block text-bone/50">{label}</span>
        <span className="mt-4 block font-display text-3xl leading-tight">
          {title}
        </span>
      </dt>
      <dd className="mt-4 text-[0.9375rem] leading-relaxed text-bone/65">
        {children}
      </dd>
    </div>
  );
}
