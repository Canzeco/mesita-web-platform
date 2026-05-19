import Link from "next/link";
import { redirect } from "next/navigation";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { authSignInWithEmail } from "@/app/auth/actions";
import { createServerSupabase } from "@/lib/supabase/server";

// Always dynamic: reads the session cookie + initialises Supabase at
// request time.
export const dynamic = "force-dynamic";

// Default destination after sign-in. /auth/post-signin checks whether
// the manager has finished onboarding and routes accordingly:
//   no profile yet → /manager/onboard
//   profile in place → /manager/home
const MANAGER_AFTER_AUTH = "/auth/post-signin?audience=manager";

// Honour a ?next= path so deep links land where the user was headed
// instead of going through post-signin. Only same-origin paths are
// accepted — anything that doesn't start with "/" is dropped to avoid
// open-redirect abuse.
function safeNext(raw: string | undefined): string {
  if (!raw) return MANAGER_AFTER_AUTH;
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : MANAGER_AFTER_AUTH;
}

export default async function ManagerSignInPage({
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
            Access your venue console, rewards, and wallet.
          </p>
        </div>

        <EmailAuthForm
          action={action}
          submitLabel="Sign in"
          passwordAutoComplete="current-password"
          redirectAfter={next}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New partner?{" "}
          <Link href="/manager/sign-up" className="font-semibold text-foreground hover:underline">
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
    </div>
  );
}
