"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type OAuthProvider = "google" | "apple";

export function OAuthButtons({ redirectAfter }: { redirectAfter: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);

  const handle = (provider: OAuthProvider) => {
    setError(null);
    setActiveProvider(provider);
    startTransition(async () => {
      try {
        const supabase = createBrowserSupabase();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectAfter)}`;
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo },
        });
        if (oauthError) {
          // Most common failure today is "provider not enabled" — translate
          // to something a guest can actually act on (email instead) rather
          // than leaking Supabase admin paths.
          const friendly = /not enabled|provider/i.test(oauthError.message)
            ? `${provider === "google" ? "Google" : "Apple"} sign-in isn't available right now. Use email and password below.`
            : oauthError.message;
          setError(friendly);
          setActiveProvider(null);
        }
        // On success the browser is redirected to the provider; no further work here.
      } catch (err) {
        setError(err instanceof Error ? err.message : "OAuth failed.");
        setActiveProvider(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => handle("google")}
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card text-sm font-medium transition hover:bg-muted disabled:opacity-60"
      >
        {pending && activeProvider === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => handle("apple")}
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-foreground bg-foreground text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {pending && activeProvider === "apple" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AppleIcon className="h-4 w-4" />
        )}
        Continue with Apple
      </button>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}

      <div className="my-1 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.501 12.233c0-.815-.066-1.6-.19-2.352H12.214v4.448h5.788c-.25 1.34-1.01 2.476-2.152 3.235v2.687h3.483c2.038-1.876 3.168-4.638 3.168-8.018z"
        fill="#4285F4"
      />
      <path
        d="M12.214 22.5c2.917 0 5.36-.965 7.146-2.609l-3.483-2.687c-.964.646-2.197 1.03-3.663 1.03-2.814 0-5.198-1.9-6.05-4.45H2.557v2.776A10.297 10.297 0 0 0 12.214 22.5z"
        fill="#34A853"
      />
      <path
        d="M6.164 13.784a6.16 6.16 0 0 1-.323-1.95c0-.677.117-1.335.323-1.95V7.108H2.557A10.295 10.295 0 0 0 1.5 11.834c0 1.664.4 3.237 1.057 4.726l3.607-2.776z"
        fill="#FBBC05"
      />
      <path
        d="M12.214 5.435c1.587 0 3.012.546 4.133 1.617l3.092-3.092C17.572 2.21 15.131 1.166 12.214 1.166 8.05 1.166 4.45 3.567 2.557 7.108L6.164 9.884c.852-2.55 3.236-4.449 6.05-4.449z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.05 12.04c-.03-2.79 2.28-4.13 2.39-4.2-1.31-1.91-3.34-2.17-4.06-2.2-1.73-.18-3.38 1.02-4.26 1.02-.88 0-2.24-.99-3.68-.96-1.89.03-3.64 1.1-4.62 2.78-1.97 3.41-.5 8.46 1.42 11.23.94 1.35 2.06 2.87 3.53 2.82 1.42-.06 1.96-.92 3.68-.92 1.71 0 2.2.92 3.7.89 1.53-.03 2.5-1.38 3.43-2.74 1.08-1.57 1.53-3.09 1.55-3.17-.03-.01-2.97-1.14-3-4.55zM14.3 4.07c.78-.94 1.31-2.25 1.17-3.56-1.13.05-2.5.75-3.31 1.69-.72.83-1.36 2.17-1.19 3.45 1.27.1 2.55-.65 3.33-1.58z" />
    </svg>
  );
}
