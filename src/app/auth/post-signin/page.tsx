import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiGetManagerProfile } from "@/lib/api/manager";
import { apiFetchGuestProfile } from "@/lib/api/tickets";

// Post-signin router. The OAuth callback (and any landing after sign-in)
// hits this page with ?audience=guest|manager. We then check whether the
// caller has finished the corresponding onboarding and forward them to
// either the onboard wizard or their normal home.
//
// Why a dedicated page: the OAuth provider doesn't know whether the user
// was on /guest/sign-in or /manager/sign-in. The sign-in page picks the
// audience and passes it as `next=/auth/post-signin?audience=...`. The
// callback handler trades the code for a session and then redirects here.
//
// Both guest-get-profile and manager-get-profile lazily create their
// respective rows on first call, so even brand-new Google sign-ins end
// up with a row — we just check whether full_name has been filled.

export const dynamic = "force-dynamic";

export default async function PostSigninPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string; next?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/manager/sign-in");

  const params = await searchParams;
  const audience = params.audience === "guest" ? "guest" : "manager";
  const explicitNext = params.next?.startsWith("/") && !params.next.startsWith("//")
    ? params.next
    : null;

  // If a specific destination was requested (e.g. /guest/qr), honour it.
  if (explicitNext) redirect(explicitNext);

  if (audience === "manager") {
    try {
      const m = await apiGetManagerProfile(supabase);
      redirect(m.full_name ? "/manager/console" : "/manager/onboard");
    } catch {
      // Profile fetch failed (rare). Best fallback: send them through
      // onboard so they at least get a chance to fill the form.
      redirect("/manager/onboard");
    }
  } else {
    try {
      const g = await apiFetchGuestProfile(supabase);
      redirect(g.full_name ? "/guest/discover/swipe" : "/guest/onboard");
    } catch {
      redirect("/guest/onboard");
    }
  }
}
