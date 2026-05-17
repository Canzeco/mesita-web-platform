"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { AuthFormState } from "@/app/auth/actions";
import { OAuthButtons } from "./OAuthButtons";

type BoundAction = (
  prev: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";

export function EmailAuthForm({
  action,
  submitLabel,
  passwordAutoComplete = "current-password",
  redirectAfter,
}: {
  action: BoundAction;
  submitLabel: string;
  passwordAutoComplete?: "current-password" | "new-password";
  redirectAfter: string;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    null,
  );

  return (
    <div className="flex flex-col gap-3">
      <OAuthButtons redirectAfter={redirectAfter} />
      <form action={formAction} className="flex flex-col gap-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          className={INPUT_CLASS}
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete={passwordAutoComplete}
          className={INPUT_CLASS}
          placeholder="••••••••"
        />
      </label>

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
      {state?.info && (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {state.info}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </button>
      </form>
    </div>
  );
}
