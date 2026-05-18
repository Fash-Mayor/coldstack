"use client";

import { useActionState } from "react";
import { completeOnboarding } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  FormAlert,
  FormField,
  SelectField,
  submitButtonClassName,
} from "@/components/auth/form-field";
import { PUBLIC_SIGNUP_ROLES } from "@/lib/auth/constants";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = {};

const ROLE_OPTIONS = [
  { value: "", label: "Select your role" },
  ...PUBLIC_SIGNUP_ROLES.map((role) => ({
    value: role,
    label: role.charAt(0).toUpperCase() + role.slice(1),
  })),
];

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState
  );

  return (
    <AuthShell
      title="Complete your profile"
      subtitle="Tell us who you are in the cold-chain network. Admin accounts are provisioned separately."
    >
      <form action={formAction} className="space-y-4">
        {state.error ? <FormAlert variant="error" message={state.error} /> : null}

        <FormField
          label="Full name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Jane Doe"
        />

        <FormField
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="+1 555 0100"
        />

        <SelectField
          label="Role"
          name="role"
          required
          defaultValue=""
          options={ROLE_OPTIONS}
        />

        <button
          type="submit"
          disabled={pending}
          className={submitButtonClassName}
        >
          {pending ? "Saving profile..." : "Continue to dashboard"}
        </button>
      </form>
    </AuthShell>
  );
}
