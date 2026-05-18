"use client";

import { useActionState, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import type { AuthFormState } from "@/app/auth/actions";
import { authSignInWithMagicLink } from "@/app/auth/actions";
import {
  ERROR_BOX_CLASS,
  INFO_BOX_CLASS,
  INPUT_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import { OAuthButtons } from "./OAuthButtons";

type BoundAction = (
  prev: AuthFormState,
  formData: FormData,
) => Promise<AuthFormState>;

export function EmailAuthForm({
  action,
  submitLabel,
  passwordAutoComplete = "current-password",
  redirectAfter,
  // Sign-in pages want the "Email me a sign-in link" fallback. Sign-up
  // pages don't (the user is intentionally creating an account, not
  // trying to sign in).
  showMagicLink = passwordAutoComplete === "current-password",
}: {
  action: BoundAction;
  submitLabel: string;
  passwordAutoComplete?: "current-password" | "new-password";
  redirectAfter: string;
  showMagicLink?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    null,
  );

  // Magic-link is bound to the same redirectAfter so post-signin handles
  // onboard-vs-not consistently across both paths.
  const magicAction = authSignInWithMagicLink.bind(null, redirectAfter);
  const [magicState, magicFormAction, magicPending] = useActionState<AuthFormState, FormData>(
    magicAction,
    null,
  );

  // Cache the email the user typed so the magic-link form can reuse it
  // without making them type it twice.
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <OAuthButtons redirectAfter={redirectAfter} />
      <form action={formAction} className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            maxLength={72}
            autoComplete={passwordAutoComplete}
            className={INPUT_CLASS}
            placeholder="••••••••"
          />
        </label>

        {state?.error && (
          <p className={`${ERROR_BOX_CLASS} leading-relaxed`}>
            {state.error}
          </p>
        )}
        {state?.info && (
          <p className={INFO_BOX_CLASS}>
            {state.info}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={cn(PRIMARY_BUTTON_CLASS, "mt-2")}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </button>
      </form>

      {showMagicLink && (
        // Second form, separate action — Supabase sends a one-tap link to
        // the same email. Useful when the guest doesn't remember the
        // password and doesn't want to do the full reset flow.
        <form action={magicFormAction} className="mt-1 flex flex-col gap-2">
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={magicPending || !email}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border bg-card text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
            title={
              email
                ? "We'll email you a one-tap sign-in link"
                : "Type your email above first"
            }
          >
            {magicPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            Email me a sign-in link instead
          </button>
          {magicState?.info && (
            <p className={INFO_BOX_CLASS}>
              {magicState.info}
            </p>
          )}
          {magicState?.error && (
            <p className={ERROR_BOX_CLASS}>
              {magicState.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
