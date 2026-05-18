import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileFrame } from "@/components/guest/MobileFrame";
import { StatusBar } from "@/components/guest/StatusBar";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { authSignUpWithEmail } from "@/app/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

// Always dynamic: reads the session cookie + initialises Supabase at
// request time.
export const dynamic = "force-dynamic";

// Route through post-signin so onboarding is consistent across email +
// Google sign-up. post-signin sees the freshly-created guest row with
// full_name=null and forwards to /guest/onboard.
const GUEST_AFTER_SIGNUP = "/auth/post-signin?audience=guest";

export default async function GuestSignUpPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Send already-signed-in users through post-signin so onboarded vs.
  // not is checked — direct /guest/discover/swipe was wrong because a
  // signed-in but un-onboarded user would skip the wizard.
  if (user) redirect(GUEST_AFTER_SIGNUP);

  const action = authSignUpWithEmail.bind(null, GUEST_AFTER_SIGNUP);

  return (
    <MobileFrame>
      <StatusBar />
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-6">
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-peacock text-xl shadow-glow">
            🦚
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Email and password. The rest comes next.
          </p>
        </div>

        <EmailAuthForm
          action={action}
          submitLabel="Create account"
          passwordAutoComplete="new-password"
          redirectAfter={GUEST_AFTER_SIGNUP}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/guest/sign-in" className="font-semibold text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </MobileFrame>
  );
}
