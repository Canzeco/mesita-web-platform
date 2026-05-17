import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileFrame } from "@/components/guest/MobileFrame";
import { StatusBar } from "@/components/guest/StatusBar";
import { AppSwitcher } from "@/components/AppSwitcher";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { authSignInWithEmail } from "@/app/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

const GUEST_AFTER_AUTH = "/guest/discover/swipe";

export default async function GuestSignInPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(GUEST_AFTER_AUTH);

  const action = authSignInWithEmail.bind(null, GUEST_AFTER_AUTH);

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
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to keep your tier, balance, and saved venues.
          </p>
        </div>

        <EmailAuthForm
          action={action}
          submitLabel="Sign in"
          passwordAutoComplete="current-password"
          redirectAfter={GUEST_AFTER_AUTH}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to Mesita?{" "}
          <Link href="/guest/sign-up" className="font-semibold text-foreground hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </MobileFrame>
  );
}
