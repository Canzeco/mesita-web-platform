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

  const tickets = await apiFetchMyTickets(supabase, 10).catch(() => []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SimpleHeader title="My QR" />
      <div className="flex-1 overflow-y-auto">
        <MyQrClient profile={profile} tickets={tickets} />
        <p className="px-6 pb-8 text-center text-[11px] text-muted-foreground">
          Need help?{" "}
          <Link href="/guest/profile" className="font-semibold text-foreground hover:underline">
            Account &amp; balance
          </Link>
        </p>
      </div>
    </div>
  );
}
