"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import type { AuthFormState } from "@/app/auth/actions";

type Action = (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";

export function ForgotPasswordForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, null);
  return (
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

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
      {state?.info && (
        <p className="rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">{state.info}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send reset link
      </button>
    </form>
  );
}
