import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileFrame } from "@/components/guest/MobileFrame";
import { StatusBar } from "@/components/guest/StatusBar";
import { AppSwitcher } from "@/components/AppSwitcher";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { authSignUpWithEmail } from "@/app/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

// Always dynamic: reads the session cookie + initialises Supabase at
// request time.
export const dynamic = "force-dynamic";

// New accounts land on the profiling step. The /onboard form already
// captures name / birthday / country and currently navigates on its own.
const GUEST_AFTER_SIGNUP = "/guest/onboard";

export default async function GuestSignUpPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/guest/discover/swipe");

  const action = authSignUpWithEmail.bind(null, GUEST_AFTER_SIGNUP);

  return (
    <MobileFrame>
      <StatusBar />
      <div className="px-4 pt-3">
        <AppSwitcher />
      </div>
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
