import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileFrame } from "@/components/guest/MobileFrame";
import { StatusBar } from "@/components/guest/StatusBar";
import { AppSwitcher } from "@/components/AppSwitcher";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { authSignInWithEmail } from "@/app/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

// Always dynamic: this page reads the session cookie to decide whether to
// redirect signed-in users, and the Supabase client is only initialised at
// request time.
export const dynamic = "force-dynamic";

// Route through post-signin so first-time Google sign-ins land on
// /guest/onboard (full_name=null) while returning users go straight to
// discover. Direct ?next=... overrides this.
const GUEST_AFTER_AUTH = "/auth/post-signin?audience=guest";

// Honour ?next= so a guest landing from a venue page returns to that page
// after signing in. Only same-origin paths are accepted.
function safeNext(raw: string | undefined): string {
  if (!raw) return GUEST_AFTER_AUTH;
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : GUEST_AFTER_AUTH;
}

export default async function GuestSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const next = safeNext((await searchParams).next);
  if (user) redirect(next);

  const action = authSignInWithEmail.bind(null, next);

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
          redirectAfter={next}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to Mesita?{" "}
          <Link href="/guest/sign-up" className="font-semibold text-foreground hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Forgot your password?{" "}
          <Link href="/auth/forgot" className="font-semibold text-foreground hover:underline">
            Reset it
          </Link>
        </p>
      </div>
    </MobileFrame>
  );
}
