import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ManagerOnboardForm } from "./ManagerOnboardForm";

// Manager onboarding — captures the manager's own name + phone after
// signup. Distinct from venue creation; this is about the *person*, the
// venue gets its own wizard step at /manager/create_unit.
//
// Auth gate already runs in middleware; we still grab the email so the
// onboard form can show "Hi, you@…" while the user fills in the rest.
export const dynamic = "force-dynamic";

export default async function ManagerOnboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/manager/sign-in?next=/manager/onboard");

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-hero px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elev">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-peacock text-base shadow-glow">
              🦚
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">mesita.</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
            Welcome to Mesita
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tell us who you are. You can add your venue right after.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Signed in as {user.email}
          </p>
        </div>

        <ManagerOnboardForm />
      </div>
    </div>
  );
}
