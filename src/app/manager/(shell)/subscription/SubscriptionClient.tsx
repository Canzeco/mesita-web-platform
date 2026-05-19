"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  CircleDollarSign,
  Percent,
  AlertTriangle,
  CreditCard,
  Loader2,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiUpdateVenue, type MyVenue, type VenuePlan } from "@/lib/api/venues";
import { FiscalBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { PLANS, mechanicForPlan, visibilityForPlan } from "@/lib/manager/plans";

export function SubscriptionClient({ venue }: { venue: MyVenue }) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);

  // Plan is the row's current persisted value. Update locally on submit so
  // the UI feels fast, then `router.refresh()` re-pulls from the server.
  const [plan, setPlan] = useState<VenuePlan>(venue.plan);
  const [pending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Fiscal type is the upstream lever for the mechanic. Changing it triggers
  // a save + refresh so the plan list re-narrows to the matching pair.
  const [fiscalPending, startFiscalSave] = useTransition();
  const [fiscalError, setFiscalError] = useState<string | null>(null);
  const switchFiscal = (next: "formal" | "informal") => {
    if (next === venue.fiscal_type || fiscalPending) return;
    setFiscalError(null);
    startFiscalSave(async () => {
      try {
        await apiUpdateVenue(supabase, { id: venue.id, fiscal_type: next });
        router.refresh();
      } catch (err) {
        setFiscalError(err instanceof Error ? err.message : "Couldn't save.");
      }
    });
  };

  const isFormal = venue.fiscal_type === "formal";
  const mechanic = mechanicForPlan(plan);
  const visibility = visibilityForPlan(plan);

  const availablePlans = useMemo(
    () =>
      PLANS.filter(
        (p) =>
          p.fiscalScope === "any" ||
          (isFormal ? p.fiscalScope === "formal" : p.fiscalScope === "informal"),
      ),
    [isFormal],
  );

  // Rare case: persisted plan no longer fits venue's fiscal_type (e.g. the
  // manager flipped fiscal_type while a Pro plan was active). Surface a
  // warning so they fix it here before the inconsistency leaks into a ticket.
  const planMatchesFiscal = useMemo(() => {
    if (venue.plan === "free") return true;
    if (isFormal) return venue.plan.startsWith("formal_");
    return venue.plan.startsWith("informal_");
  }, [venue.plan, isFormal]);

  const submit = () => {
    if (plan === venue.plan) return;
    setError(null);
    setSaved(false);
    startSubmit(async () => {
      try {
        await apiUpdateVenue(supabase, { id: venue.id, plan });
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save the plan.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Current plan
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {PLANS.find((p) => p.id === venue.plan)?.label ?? venue.plan}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {PLANS.find((p) => p.id === venue.plan)?.priceLabel}
              {" · "}
              Mechanic: <span className="font-semibold">{mechanicForPlan(venue.plan)}</span>
              {" · "}
              Visibility: <span className="font-semibold">{visibilityForPlan(venue.plan)}</span>
            </p>
          </div>
          <FiscalBadge fiscalType={venue.fiscal_type} size="md" />
        </div>
      </section>

      {!planMatchesFiscal && (
        <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="flex items-start gap-2 text-[12px] leading-relaxed">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>
              Your current plan{" "}
              <span className="font-semibold">
                {PLANS.find((p) => p.id === venue.plan)?.label ?? venue.plan}
              </span>{" "}
              doesn&apos;t match this venue&apos;s fiscal type (
              <span className="font-semibold">{venue.fiscal_type}</span>). Pick a
              matching plan below and save, otherwise tickets will refuse to open.
            </span>
          </p>
        </section>
      )}

      <FiscalSelector
        current={venue.fiscal_type}
        pending={fiscalPending}
        error={fiscalError}
        onSwitch={switchFiscal}
      />

      <PaymentRailRule isFormal={isFormal} />

      <section className="rounded-2xl border border-border bg-card p-5">
        <header className="mb-4">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Pick a plan
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Plans differ by price and visibility. The mechanic (cashback or
            discount) is pinned by your fiscal type above, so you only see the
            plans that match. Switch fiscal type at the top of this page if you
            need the other set.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {availablePlans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              selected={plan === p.id}
              currentlyActive={venue.plan === p.id}
              onSelect={() => setPlan(p.id)}
            />
          ))}
        </ul>

        {error && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {saved && (
          <p className="mt-3 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
            Plan saved.
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            Selected:{" "}
            <span className="font-semibold text-foreground">
              {PLANS.find((p) => p.id === plan)?.label}
            </span>
            {" — "}
            {mechanic} mechanic, {visibility} visibility.
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={pending || plan === venue.plan}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-pink-gradient px-4 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {plan === venue.plan ? "Saved" : "Save plan"}
          </button>
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  plan,
  selected,
  currentlyActive,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  selected: boolean;
  currentlyActive: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col items-stretch gap-2 rounded-2xl border p-4 text-left transition",
          selected
            ? "border-secondary bg-secondary/5 ring-2 ring-secondary/30"
            : "border-border bg-background hover:border-foreground/30",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-base font-semibold tracking-tight">
            {plan.label}
          </p>
          {currentlyActive && (
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
              Active
            </span>
          )}
        </div>
        <p className="font-display text-xl font-bold tabular-nums">
          {plan.priceLabel}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill
            icon={
              plan.mechanic === "Cashback"
                ? CircleDollarSign
                : plan.mechanic === "Discount"
                  ? Percent
                  : Sparkles
            }
          >
            {plan.mechanic}
          </Pill>
          <Pill icon={Sparkles}>{plan.visibility} visibility</Pill>
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {plan.blurb}
        </p>
      </button>
    </li>
  );
}

function FiscalSelector({
  current,
  pending,
  error,
  onSwitch,
}: {
  current: "formal" | "informal";
  pending: boolean;
  error: string | null;
  onSwitch: (next: "formal" | "informal") => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-4">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          Fiscal type
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Are you a venue that always invoices, or one that usually doesn&apos;t?
          This pins your mechanic — Formal runs cashback, Informal runs instant
          discount — and which plans show up below.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FiscalOption
          tone="formal"
          label="Formal"
          headline="I always issue an invoice."
          body="Every ticket invoiced, VAT charged, reported to SAT. Cashback fits cleanly — Mesita touches the payment rail and the % comes back to the guest's wallet."
          selected={current === "formal"}
          pending={pending}
          onSelect={() => onSwitch("formal")}
        />
        <FiscalOption
          tone="informal"
          label="Informal"
          headline="I usually don't invoice."
          body="Most tickets paid in cash, never invoiced. Instant discount applies directly at the bill — Mesita stays out of the payment flow."
          selected={current === "informal"}
          pending={pending}
          onSelect={() => onSwitch("informal")}
        />
      </div>
      {error && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}

function FiscalOption({
  tone,
  label,
  headline,
  body,
  selected,
  pending,
  onSelect,
}: {
  tone: "formal" | "informal";
  label: string;
  headline: string;
  body: string;
  selected: boolean;
  pending: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={selected || pending}
      className={cn(
        "flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition disabled:cursor-default",
        selected
          ? "border-foreground bg-background shadow-elev"
          : "border-border bg-background hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            tone === "formal"
              ? "bg-pink-gradient text-white"
              : "bg-tier-gold text-black",
          )}
        >
          {label}
        </span>
        {selected && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-secondary">
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            {pending ? "Saving" : "Active"}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold">{headline}</p>
      <p className="text-[12px] leading-relaxed text-muted-foreground">{body}</p>
    </button>
  );
}

function PaymentRailRule({ isFormal }: { isFormal: boolean }) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-4",
        isFormal
          ? "border-destructive/30 bg-destructive/5"
          : "border-tier-gold/40 bg-tier-gold/10",
      )}
    >
      <div className="flex items-start gap-3">
        {isFormal ? (
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        ) : (
          <Percent className="mt-0.5 h-5 w-5 shrink-0 text-black" />
        )}
        <div className="text-[12px] leading-relaxed">
          <p className="font-display text-sm font-semibold tracking-tight">
            Payment rail rule
          </p>
          {isFormal ? (
            <p className="mt-1 text-foreground/80">
              Cashback is{" "}
              <span className="font-semibold">only valid when the guest pays by card through Mesita&apos;s flow</span>.
              If the guest pays in cash at the table, the coupon is invalid and no
              cashback is issued. Your waiter sends the Stripe link from the QR
              scan; the cashback lands once payment clears (and the story
              verifies, when required).
            </p>
          ) : (
            <p className="mt-1 text-foreground/80">
              Discount is{" "}
              <span className="font-semibold">applied directly to the bill — cash or card, either works</span>.
              Mesita stays out of the payment flow. The waiter scans the QR, the
              discount is revealed and applied at the bill, and the guest pays you
              directly. No Stripe, no wallet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Pill({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
      <Icon className="h-2.5 w-2.5" />
      {children}
    </span>
  );
}
