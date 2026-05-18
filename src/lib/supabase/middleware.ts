import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

// Paths that require an authenticated session. Anything starting with one
// of these prefixes — and NOT in PUBLIC_AUTH_PATHS below — gets bounced to
// the matching sign-in page with a ?next= pointing back here. Keeps client-
// rendered pages (like /manager/promos) protected without each page needing
// its own server-side gate.
const PROTECTED_PREFIXES: Array<{ prefix: string; signIn: string }> = [
  { prefix: "/manager", signIn: "/manager/sign-in" },
  { prefix: "/validator", signIn: "/manager/sign-in" },
  { prefix: "/admin", signIn: "/manager/sign-in" },
];

// Within a protected prefix, these subpaths stay public (sign-in / sign-up
// itself, OAuth callback). Anything else is gated.
const PUBLIC_AUTH_PATHS = new Set([
  "/manager/sign-in",
  "/manager/sign-up",
]);

function shouldGate(pathname: string): { signIn: string } | null {
  if (PUBLIC_AUTH_PATHS.has(pathname)) return null;
  for (const { prefix, signIn } of PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { signIn };
    }
  }
  return null;
}

// Refreshes Supabase auth cookies on every request. Env vars are read at
// call time (not module load) so middleware code is import-safe during the
// build's page-data collection.
export async function updateSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    // Don't kill the request just because env vars aren't injected (e.g. on
    // a preview build that hasn't been wired up yet). Pass it through; the
    // auth-dependent pages will surface a clear error themselves.
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the user record so the SSR client refreshes the access token cookie
  // when it's near expiry. Per Supabase SSR docs: do NOT add code between
  // createServerClient() and getUser() — random logouts otherwise.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const gate = shouldGate(request.nextUrl.pathname);
  if (gate && !user) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = gate.signIn;
    signInUrl.search = `?next=${encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search,
    )}`;
    return NextResponse.redirect(signInUrl);
  }

  return response;
}
