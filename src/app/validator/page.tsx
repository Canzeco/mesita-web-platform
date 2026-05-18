import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUnitOverview } from "@/lib/api/unit";
import { ValidatorConsole } from "./ValidatorConsole";

export const dynamic = "force-dynamic";

export default async function ValidatorPage({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/manager/sign-in?next=/validator");
  }

  const params = await searchParams;
  const requestedVenue = params.venue?.toString() ?? null;

  // Distinguish "the overview call blew up" from "you have no venues" — the
  // first case is something we want to retry, the second is an onboarding
  // funnel. Swallowing both into the same empty-state hid real outages.
  let overview: Awaited<ReturnType<typeof getUnitOverview>> | null = null;
  let overviewError: string | null = null;
  try {
    overview = await getUnitOverview(supabase, requestedVenue, 30);
  } catch (err) {
    overviewError = err instanceof Error ? err.message : "Could not load your venues.";
  }

  if (overviewError) {
    return (
      <Shell>
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-destructive">
            Couldn&apos;t load the console
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{overviewError}</p>
          <Link
            href="/validator"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Try again
          </Link>
        </div>
      </Shell>
    );
  }

  if (!overview || overview.venues.length === 0) {
    return (
      <Shell>
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            No venues linked yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The validator console is gated by venue membership. Onboard your venue first, then
            come back to open tickets.
          </p>
          <Link
            href="/manager/create_unit"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Onboard your venue
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <ValidatorConsole
        venues={overview.venues.map((v) => ({
          id: v.id,
          name: v.name,
          cashback_percent: v.cashback_percent,
          fiscal_type: (v as { fiscal_type?: "formal" | "informal" }).fiscal_type ?? "formal",
        }))}
        activeVenueId={overview.active?.venue.id ?? overview.venues[0].id}
        initialTickets={overview.active?.recentTickets ?? []}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peacock text-sm shadow-glow">
              🦚
            </span>
            <span className="font-display text-base font-semibold tracking-tight">mesita.</span>
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Validator
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
