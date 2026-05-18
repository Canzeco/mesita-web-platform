"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import type { AuthFormState } from "@/app/auth/actions";
import {
  ERROR_BOX_CLASS,
  INPUT_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type Action = (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;

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

      {state?.error && <p className={ERROR_BOX_CLASS}>{state.error}</p>}
      {state?.info && (
        // "Reset link sent" reads as positive — use the brand-secondary
        // tone (not the muted INFO box) to give it a touch more weight.
        <p className="rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">{state.info}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(PRIMARY_BUTTON_CLASS, "mt-2")}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send reset link
      </button>
    </form>
  );
}
