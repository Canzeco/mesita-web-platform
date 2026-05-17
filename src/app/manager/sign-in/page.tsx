import Link from "next/link";
import { redirect } from "next/navigation";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { authSignInWithEmail } from "@/app/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

// Always dynamic: reads the session cookie + initialises Supabase at
// request time.
export const dynamic = "force-dynamic";

const MANAGER_AFTER_AUTH = "/manager";

export default async function ManagerSignInPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(MANAGER_AFTER_AUTH);

  const action = authSignInWithEmail.bind(null, MANAGER_AFTER_AUTH);

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
            Manager sign in
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Access your venue console, promos, and wallet.
          </p>
        </div>

        <EmailAuthForm
          action={action}
          submitLabel="Sign in"
          passwordAutoComplete="current-password"
          redirectAfter={MANAGER_AFTER_AUTH}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New partner?{" "}
          <Link href="/manager/sign-up" className="font-semibold text-foreground hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
