import Link from "next/link";
import { redirect } from "next/navigation";
import { SimpleHeader } from "@/components/guest/SimpleHeader";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiFetchGuestProfile, apiFetchMyTickets } from "@/lib/api/tickets";
import { MyQrClient } from "./MyQrClient";

export const dynamic = "force-dynamic";

export default async function GuestQrPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/guest/sign-in?next=/guest/qr");

  let profile;
  try {
    profile = await apiFetchGuestProfile(supabase);
  } catch (err) {
    return (
      <div className="flex flex-1 flex-col">
        <SimpleHeader title="My QR" />
        <div className="flex-1 px-4 py-6">
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {err instanceof Error ? err.message : "Couldn't load your profile."}
          </p>
        </div>
      </div>
    );
  }

  let tickets: Awaited<ReturnType<typeof apiFetchMyTickets>> = [];
  let ticketsError: string | null = null;
  try {
    tickets = await apiFetchMyTickets(supabase, 10);
  } catch (err) {
    // Don't fail the whole page — the QR + balance are still useful even if
    // the visit history call hiccups. Show a soft banner so it doesn't look
    // like the user has zero history when they actually do.
    ticketsError = err instanceof Error ? err.message : "Couldn't load recent visits.";
    console.error("[guest/qr] tickets:", ticketsError);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SimpleHeader title="My QR" />
      <div className="flex-1 overflow-y-auto">
        <MyQrClient profile={profile} tickets={tickets} />
        {ticketsError && (
          <p className="mx-4 mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
            Recent visits unavailable: {ticketsError}
          </p>
        )}
        <p className="px-6 pb-8 pt-2 text-center text-[11px] text-muted-foreground">
          Need help?{" "}
          <Link href="/guest/profile" className="font-semibold text-foreground hover:underline">
            Account &amp; balance
          </Link>
        </p>
      </div>
    </div>
  );
}
