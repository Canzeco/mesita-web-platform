import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUnitOverview } from "@/lib/api/unit";
import { RewardsClient } from "./RewardsClient";

// Server shell: loads the active venue (carries fiscal_type + current plan)
// and hands the client component everything it needs to render. Auth-gating
// already happens in middleware; we just resolve the unit overview here.
export const dynamic = "force-dynamic";

export default async function ManagerRewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const supabase = await createServerSupabase();
  const params = await searchParams;
  const requestedUnit = params.unit?.toString() ?? null;

  let overview: Awaited<ReturnType<typeof getUnitOverview>> | null = null;
  let overviewError: string | null = null;
  try {
    overview = await getUnitOverview(supabase, requestedUnit, 0);
  } catch (err) {
    overviewError = err instanceof Error ? err.message : "Could not load your venues.";
  }
  if (overviewError) {
    return (
      <>
        <Topbar title="Rewards" subtitle="Cashback / discount rate and ticket types" />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-10 text-center">
              <h2 className="font-display text-xl font-semibold tracking-tight text-destructive">
                Couldn&apos;t load the venue
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {overviewError}
              </p>
              <Link
                href="/manager/rewards"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Try again
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!overview || overview.venues.length === 0) {
    return (
      <>
        <Topbar title="Rewards" subtitle="Cashback / discount rate and ticket types" />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Store className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                No venue to configure yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Create your first venue, then come back here to set the
                cashback or discount rate.
              </p>
              <Link
                href="/manager/create_unit"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Create your first venue
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const active = overview.active?.venue ?? overview.venues[0];

  return (
    <>
      <Topbar
        title={active.name}
        subtitle="Rewards — cashback / discount rate and ticket types"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
          <RewardsClient venue={active} />
        </div>
      </div>
    </>
  );
}
