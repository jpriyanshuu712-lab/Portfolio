"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "./actions";
import { LOGIN_IDLE } from "@/lib/action-state";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary mt-6 w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(signIn, LOGIN_IDLE);

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="next" value={next} />

      <div className="mb-4">
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="input"
          aria-describedby={state.status === "error" ? "login-error" : undefined}
        />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>

      {state.status === "error" && (
        <p id="login-error" role="alert" className="mt-4 text-sm font-medium text-accent">
          {state.message}
        </p>
      )}

      <SubmitButton />

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Forgotten the password? Reset it from the Supabase dashboard under Authentication → Users.
      </p>
    </form>
  );
}
