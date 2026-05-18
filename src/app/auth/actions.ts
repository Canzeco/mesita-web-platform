"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { isEmail } from "@/lib/validators";

export type AuthFormState = {
  error?: string;
  info?: string;
} | null;

export async function authSignInWithEmail(
  redirectTo: string,
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Supabase returns a generic "Invalid login credentials" for both
    // wrong-password and unknown-email — by design (so an attacker
    // can't enumerate accounts). We rewrite it to a friendlier message
    // that signposts the two real recovery paths (sign up vs reset).
    const lower = error.message.toLowerCase();
    if (lower.includes("invalid login credentials") || lower.includes("invalid_grant")) {
      return {
        error:
          "We couldn't sign you in with that email and password. If you haven't created an account yet, use the sign-up link below — or hit \"Reset it\" if you forgot your password.",
      };
    }
    if (lower.includes("email not confirmed")) {
      return {
        error:
          "Your account exists but the email hasn't been confirmed yet. Check your inbox for the confirmation link.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

// Magic-link sign-in. Useful when the guest doesn't remember their
// password — Supabase emails them a one-tap link. Re-uses the same
// redirectTo so /auth/post-signin routes them through onboard-vs-not.
export async function authSignInWithMagicLink(
  redirectTo: string,
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter the email on your account." };
  if (!isEmail(email)) {
    return { error: "That doesn't look like a valid email." };
  }
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      // The OTP link returns to /auth/callback, which exchanges the
      // code + forwards to redirectTo (post-signin handles onboarded).
      emailRedirectTo: absoluteUrl(`/auth/callback?next=${encodeURIComponent(redirectTo)}`),
    },
  });
  if (error) {
    // Don't leak "user not found" — surface the same friendly info.
    return {
      info: "If that email is on a Mesita account, we just emailed you a one-tap sign-in link.",
    };
  }
  return {
    info: "Check your inbox — we just sent you a one-tap sign-in link.",
  };
}

// Helper: build an absolute URL from a path, using NEXT_PUBLIC_SITE_URL if
// set, else falling back to the request's origin (works in production +
// Vercel previews). Server-side only; for client-side build the URL from
// window.location.origin instead.
function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mesita.ai";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function authSignUpWithEmail(
  redirectTo: string,
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (!isEmail(email)) {
    return { error: "That doesn't look like a valid email." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password.length > 72) {
    return { error: "Password is too long — keep it under 72 characters." };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("already") || lower.includes("registered") || lower.includes("exists")) {
      return {
        error:
          "An account with this email already exists. Sign in instead, or use 'Reset it' below if you don't remember your password.",
      };
    }
    if (lower.includes("password")) {
      return { error: error.message };
    }
    return { error: error.message };
  }

  // If email confirmations are enabled on the project, signUp returns a user
  // without a session — surface that so the user knows to check their inbox.
  if (!data.session) {
    return {
      info: "Account created. Check your inbox to confirm your email, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function authSignOut(redirectTo: string, _formData: FormData) {
  // `_formData` is unused but required so this satisfies React's form-action
  // signature `(formData: FormData) => void | Promise<void>` after binding
  // the leading `redirectTo` argument.
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

// Send a password-reset email. We always return the same friendly info string
// (no "user not found" leak) so an attacker can't enumerate accounts.
export async function authResetPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Enter the email on your account." };
  }
  const supabase = await createServerSupabase();
  await supabase.auth.resetPasswordForEmail(email);
  return {
    info: "If that email is on a Mesita account, we just sent a reset link. Check your inbox.",
  };
}
