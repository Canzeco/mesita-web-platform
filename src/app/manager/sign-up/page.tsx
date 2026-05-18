import Link from "next/link";
import { redirect } from "next/navigation";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { authSignUpWithEmail } from "@/app/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

// Always dynamic: reads the session cookie + initialises Supabase at
// request time.
export const dynamic = "force-dynamic";

// Route through post-signin so the onboarded-vs-not check is uniform
// across email + Google + Apple sign-up paths. post-signin sees the
// freshly-created profile row with full_name=null and forwards to
// /manager/onboard.
const MANAGER_AFTER_SIGNUP = "/auth/post-signin?audience=manager";

export default async function ManagerSignUpPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(MANAGER_AFTER_SIGNUP);

  const action = authSignUpWithEmail.bind(null, MANAGER_AFTER_SIGNUP);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peacock text-base shadow-glow">
              🦚
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">mesita.</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
            Become a partner
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Email and password to start. You can add your venue right after.
          </p>
        </div>

        <EmailAuthForm
          action={action}
          submitLabel="Create account"
          passwordAutoComplete="new-password"
          redirectAfter={MANAGER_AFTER_SIGNUP}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already a partner?{" "}
          <Link href="/manager/sign-in" className="font-semibold text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
