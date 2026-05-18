import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Store, Sparkles } from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUnitOverview } from "@/lib/api/unit";
import { FiscalBadge } from "@/components/shared";

// /manager/console — the dashboard root. Branches by venue count:
//
//   0 venues   → CTA to /manager/create_unit
//   1 venue    → the venue's overview + jump-offs to Place / Promos / etc.
//   2+ venues  → unit switcher (via ?unit=<id>) + selected venue overview
//
// This is intentionally a thin dashboard — Place, Promos, etc. remain at
// their own routes and the console links into them. Once the schema spec
// arrives the console can absorb more inline panels.

export const dynamic = "force-dynamic";

export default async function ManagerConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/manager/sign-in?next=/manager/console");

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
        <Topbar title="Console" subtitle="Your venues, at a glance." />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-10 text-center">
              <h2 className="font-display text-xl font-semibold tracking-tight text-destructive">
                Couldn&apos;t load your console
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {overviewError}
              </p>
              <Link
                href="/manager/console"
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

  const venues = overview?.venues ?? [];

  // 0 venues — onboarding funnel.
  if (venues.length === 0) {
    return (
      <>
        <Topbar title="Console" subtitle="Let's get your first unit live." />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Store className="h-5 w-5 text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                No units yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                A unit is one venue — bar, café, restaurant, club. Create your
                first one and Mesita pulls everything from Google + your
                website automatically.
              </p>
              <Link
                href="/manager/create_unit"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Create your first unit
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 1+ venues — pick active. Multi-unit operators see a switcher row up top.
  const active = overview?.active?.venue ?? venues[0];

  return (
    <>
      <Topbar title={active.name} subtitle="Console — your unit at a glance." />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
          {venues.length > 1 && (
            <UnitSwitcher
              venues={venues.map((v) => ({ id: v.id, name: v.name }))}
              activeId={active.id}
            />
          )}

          <ActiveUnitCard
            venue={{
              id: active.id,
              name: active.name,
              category: active.category,
              vibe: active.vibe,
              fiscal_type: active.fiscal_type,
              cashback_percent: active.cashback_percent,
              status: active.status,
            }}
          />

          <QuickActions activeId={active.id} />

          <Link
            href="/manager/create_unit"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add another unit
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Subviews ────────────────────────────────────────────────────────────

function UnitSwitcher({
  venues,
  activeId,
}: {
  venues: { id: string; name: string }[];
  activeId: string;
}) {
  return (
    <nav className="-mx-1 flex flex-wrap gap-2">
      {venues.map((v) => {
        const on = v.id === activeId;
        return (
          <Link
            key={v.id}
            href={`/manager/console?unit=${v.id}`}
            className={
              on
                ? "rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
                : "rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            }
          >
            {v.name}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveUnitCard({
  venue,
}: {
  venue: {
    id: string;
    name: string;
    category: string | null;
    vibe: string | null;
    fiscal_type: "formal" | "informal";
    cashback_percent: number | null;
    status: string;
  };
}) {
  const subtitle = [venue.vibe, venue.category]
    .filter(Boolean)
    .join(" · ")
    .toLowerCase();
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            Active unit
          </p>
          <h2 className="mt-1 truncate font-display text-2xl font-semibold tracking-tight">
            {venue.name}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FiscalBadge fiscalType={venue.fiscal_type} size="sm" />
            {venue.cashback_percent != null && venue.cashback_percent > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
                <Sparkles className="h-2.5 w-2.5" />
                {venue.cashback_percent}%{" "}
                {venue.fiscal_type === "formal" ? "cashback" : "discount"}
              </span>
            )}
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {venue.status}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActions({ activeId }: { activeId: string }) {
  const tabs: { href: string; label: string; sub: string }[] = [
    {
      href: `/manager/place?unit=${activeId}`,
      label: "Place",
      sub: "Photos, hours, channels, story",
    },
    {
      href: `/manager/promos?unit=${activeId}`,
      label: "Promos",
      sub: "Plan + cashback / discount + ticket types",
    },
    {
      href: `/validator`,
      label: "Validator",
      sub: "Open tickets, verify stories",
    },
  ];
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="rounded-2xl border border-border bg-card p-4 transition hover:border-foreground/30"
        >
          <p className="font-display text-base font-semibold tracking-tight">
            {t.label}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">{t.sub}</p>
        </Link>
      ))}
    </section>
  );
}
