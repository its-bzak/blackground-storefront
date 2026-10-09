"use client";

import { useActionState, useState } from "react";

import {
  login,
  register,
  type AuthState,
} from "@/app/(shop)/account/login/actions";

const INITIAL: AuthState = {};

const input =
  "w-full border-b border-bone/25 bg-transparent py-3 text-base text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-gold";
const labelText = "eyebrow block text-bone/50";

export function AuthForms({ next }: { next: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginAction, loggingIn] = useActionState(login, INITIAL);
  const [registerState, registerAction, registering] = useActionState(
    register,
    INITIAL,
  );

  const isLogin = mode === "login";
  const state = isLogin ? loginState : registerState;
  const pending = isLogin ? loggingIn : registering;

  return (
    <>
      <h1 className="font-display text-[clamp(3rem,10vw,5rem)] leading-none">
        {isLogin ? "Sign in" : "Create account"}
      </h1>

      <form
        // Remount on switch so each mode starts with clean fields.
        key={mode}
        action={isLogin ? loginAction : registerAction}
        className="mt-12 space-y-8"
      >
        <input type="hidden" name="next" value={next} />

        {!isLogin && (
          <div className="grid grid-cols-2 gap-5">
            <label>
              <span className={labelText}>First name</span>
              <input name="firstName" autoComplete="given-name" className={input} />
            </label>
            <label>
              <span className={labelText}>Last name</span>
              <input name="lastName" autoComplete="family-name" className={input} />
            </label>
          </div>
        )}

        <label className="block">
          <span className={labelText}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.email}
            className={input}
          />
        </label>

        <label className="block">
          <span className={labelText}>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={isLogin ? undefined : 5}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className={input}
          />
        </label>

        <p role="alert" className="min-h-5 text-sm text-gold">
          {!pending && state.error}
        </p>

        <button
          type="submit"
          disabled={pending}
          className="eyebrow w-full bg-gold px-8 py-4.5 text-ink transition-colors hover:bg-bone disabled:opacity-60"
        >
          {pending ? "One moment…" : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(isLogin ? "register" : "login")}
        className="eyebrow mt-8 border-b border-bone/40 pb-1 text-bone/70 transition-colors hover:border-gold hover:text-gold"
      >
        {isLogin ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </>
  );
}
