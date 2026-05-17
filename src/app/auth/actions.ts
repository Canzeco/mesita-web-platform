"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

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
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
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
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
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
