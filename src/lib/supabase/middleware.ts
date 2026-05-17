import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

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
  await supabase.auth.getUser();

  return response;
}
