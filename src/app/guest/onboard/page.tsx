import { redirect } from "next/navigation";
import { MobileFrame } from "@/components/guest/MobileFrame";
import { StatusBar } from "@/components/guest/StatusBar";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiFetchGuestProfile } from "@/lib/api/tickets";
import { OnboardForm } from "./OnboardForm";

// Guest onboarding — server-side gated. The middleware already blocks
// signed-out users from /guest/profile and friends, but onboard sits
// between sign-up and the actual app, so it has its own checks:
//
//   - signed out          → /guest/sign-in (with next=/guest/onboard)
//   - already onboarded   → /guest/discover/swipe (don't re-collect data)
//   - signed in, no name  → render the form
//
// AppSwitcher is intentionally absent: a new guest who's literally
// filling out the welcome form shouldn't see the manager / validator
// surfaces. They came here to use Mesita as a guest.
export const dynamic = "force-dynamic";

export default async function GuestOnboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/guest/sign-in?next=/guest/onboard");

  // guest-get-profile auto-creates the row on first call, so we can
  // safely treat a thrown response as "treat them as not-onboarded".
  try {
    const profile = await apiFetchGuestProfile(supabase);
    if (profile.full_name) {
      redirect("/guest/discover/swipe");
    }
  } catch (err) {
    // Profile fetch failed — render the form. The submit handler will
    // surface a real error if persistence is broken.
    console.error("[guest/onboard] guest-get-profile:", err);
  }

  return (
    <MobileFrame>
      <StatusBar />
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-6">
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-peacock text-xl shadow-glow">
            🦚
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Tell us about you</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A few details to personalize Mesita.
          </p>
        </div>

        <OnboardForm />
      </div>
    </MobileFrame>
  );
}
