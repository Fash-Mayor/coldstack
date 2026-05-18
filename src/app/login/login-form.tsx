"use client";

import { useActionState, useState } from "react";
import { login, signup } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  FormAlert,
  FormField,
  submitButtonClassName,
} from "@/components/auth/form-field";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = {};

type Mode = "login" | "signup";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState
  );

  const isLogin = mode === "login";
  const state = isLogin ? loginState : signupState;
  const action = isLogin ? loginAction : signupAction;
  const pending = isLogin ? loginPending : signupPending;

  return (
    <AuthShell
      title={isLogin ? "Sign in" : "Create account"}
      subtitle={
        isLogin
          ? "Access your ColdStack workspace with email and password."
          : "Register to manage cold-chain trips, telemetry, and proof of condition."
      }
    >
      <div className="mb-6 flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
            isLogin
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
            !isLogin
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sign up
        </button>
      </div>

      <form action={action} className="space-y-4">
        {state.error ? <FormAlert variant="error" message={state.error} /> : null}
        {state.success ? (
          <FormAlert variant="success" message={state.success} />
        ) : null}

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={8}
          placeholder="Minimum 8 characters"
        />

        {!isLogin ? (
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Re-enter your password"
          />
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={submitButtonClassName}
        >
          {pending
            ? isLogin
              ? "Signing in..."
              : "Creating account..."
            : isLogin
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
