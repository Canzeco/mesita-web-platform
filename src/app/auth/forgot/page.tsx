import Link from "next/link";
import { authResetPassword } from "@/app/auth/actions";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

// Always dynamic — initialises Supabase per request inside the action.
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  // Pull `from` only to render the back link; it doesn't change behaviour.
  void searchParams;
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
            Reset your password
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter the email on your account. We&apos;ll send a one-time reset link.
          </p>
        </div>

        <ForgotPasswordForm action={authResetPassword} />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Remembered it?{" "}
          <Link href="/manager/sign-in" className="font-semibold text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
