import { useSyncExternalStore } from "react";

import { sanitizeAnswers, type PartialAnswers } from "./scoring.ts";

// Quiz answers live outside React so they survive a refresh and the trip
// through the login page. sessionStorage is the backing store; if it is
// unavailable the answers still work from memory.
const STORAGE_KEY = "blackground:quiz-answers";
const EMPTY: PartialAnswers = {};

let answers: PartialAnswers | null = null;
const listeners = new Set<() => void>();

function load(): PartialAnswers {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeAnswers(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): PartialAnswers {
  answers ??= load();
  return answers;
}

function getServerSnapshot(): PartialAnswers {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setStoredAnswers(next: PartialAnswers) {
  answers = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked or full; the in-memory copy is enough for this visit.
  }
  for (const listener of listeners) listener();
}

export function useStoredAnswers(): PartialAnswers {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
