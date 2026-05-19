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
import { TicketTypesCard } from "@/components/manager/TicketTypesCard";
import { cn } from "@/lib/utils";
import { PLANS, mechanicForPlan, visibilityForPlan } from "@/lib/manager/plans";

export function MembershipClient({ venue }: { venue: MyVenue }) {
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
  const currentMeta = PLANS.find((p) => p.id === venue.plan);

  const availablePlans = useMemo(
    () =>
      PLANS.filter(
        (p) =>
          p.fiscalScope === "any" ||
          (isFormal ? p.fiscalScope === "formal" : p.fiscalScope === "informal"),
      ),
    [isFormal],
  );

  // Rare case: persisted plan no longer fits venue's fiscal_type. We surface
  // it inline at the bottom of the hero card; no separate destructive
  // section — it's already next to the lever that fixes it.
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
    <div className="flex flex-col gap-8">
      {/* ── Hero: current plan + fiscal toggle + payment rail in one card ── */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                Active plan
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                {currentMeta?.label ?? venue.plan}
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {currentMeta?.priceLabel}
                {" · "}
                {mechanicForPlan(venue.plan)} mechanic
                {" · "}
                {visibilityForPlan(venue.plan)} visibility
              </p>
            </div>
            <FiscalSegmentedToggle
              current={venue.fiscal_type}
              pending={fiscalPending}
              onSwitch={switchFiscal}
            />
          </div>

          <PaymentRailLine isFormal={isFormal} />

          {fiscalError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {fiscalError}
            </p>
          )}

          {!planMatchesFiscal && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] leading-relaxed text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Plan{" "}
                <span className="font-semibold">
                  {currentMeta?.label ?? venue.plan}
                </span>{" "}
                doesn&apos;t match your fiscal type. Pick a matching plan below
                — otherwise tickets refuse to open.
              </span>
            </p>
          )}
        </div>
      </section>

      {/* ── Plan picker: open layout, no outer card chrome ── */}
      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Pick a plan
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Two options for {isFormal ? "Formal" : "Informal"} venues
          </p>
        </header>

        {/* Compact radio-row picker. Only 2 options per fiscal type — the
            grid-of-cards layout from the 5-plan era was overkill. Each row
            is its own tap target; selected row gets a tinted left border. */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {availablePlans.map((p, i) => (
            <PlanRow
              key={p.id}
              plan={p}
              selected={plan === p.id}
              currentlyActive={venue.plan === p.id}
              onSelect={() => setPlan(p.id)}
              isLast={i === availablePlans.length - 1}
            />
          ))}
        </div>

        {(error || saved) && (
          <p
            className={cn(
              "rounded-lg px-3 py-2 text-xs",
              error
                ? "bg-destructive/10 text-destructive"
                : "bg-secondary/10 text-secondary",
            )}
          >
            {error ?? "Plan saved."}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={submit}
            disabled={pending || plan === venue.plan}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-pink-gradient px-5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
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

      <TicketTypesCard isFormal={isFormal} planMechanic={mechanic} />
    </div>
  );
}

function PlanRow({
  plan,
  selected,
  currentlyActive,
  onSelect,
  isLast,
}: {
  plan: (typeof PLANS)[number];
  selected: boolean;
  currentlyActive: boolean;
  onSelect: () => void;
  isLast: boolean;
}) {
  const MechanicIcon =
    plan.mechanic === "Cashback"
      ? CircleDollarSign
      : plan.mechanic === "Discount"
        ? Percent
        : Sparkles;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-4 p-4 text-left transition",
        !isLast && "border-b border-border",
        selected ? "bg-secondary/5" : "hover:bg-muted/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition",
          selected ? "border-secondary bg-secondary" : "border-muted-foreground/40",
        )}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-background" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-display text-base font-semibold tracking-tight">
            {plan.label}
          </p>
          <p className="font-display text-sm font-semibold tabular-nums text-foreground">
            {plan.priceLabel}
          </p>
          {currentlyActive && (
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary">
              Active
            </span>
          )}
        </div>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
          {plan.blurb}
        </p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <Pill icon={MechanicIcon}>{plan.mechanic}</Pill>
        <Pill icon={Sparkles}>{plan.visibility}</Pill>
      </div>
    </button>
  );
}

// Compact two-up segmented control replacing the old full-section selector.
// Same affordance (tap to switch fiscal_type) at a fraction of the visual
// weight — the hero card can hold this + plan label without feeling busy.
function FiscalSegmentedToggle({
  current,
  pending,
  onSwitch,
}: {
  current: "formal" | "informal";
  pending: boolean;
  onSwitch: (next: "formal" | "informal") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full bg-muted p-0.5">
      <FiscalSegment
        label="Formal"
        active={current === "formal"}
        pending={pending}
        onClick={() => onSwitch("formal")}
        tone="bg-pink-gradient text-white"
      />
      <FiscalSegment
        label="Informal"
        active={current === "informal"}
        pending={pending}
        onClick={() => onSwitch("informal")}
        tone="bg-tier-gold text-black"
      />
    </div>
  );
}

function FiscalSegment({
  label,
  active,
  pending,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  pending: boolean;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={active || pending}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition disabled:cursor-default",
        active
          ? tone
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : active ? (
        <Check className="h-3 w-3" />
      ) : null}
      {label}
    </button>
  );
}

// Single-line payment-rail summary. The previous version was a separate
// destructive-toned section — overkill for a permanent rule. Now it reads
// like a caption directly under the active plan.
function PaymentRailLine({ isFormal }: { isFormal: boolean }) {
  return (
    <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
      {isFormal ? (
        <CreditCard className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      )}
      <span>
        <span className="font-semibold text-foreground">Payment rail:</span>{" "}
        {isFormal
          ? "Cashback only counts when the guest pays by card through Mesita. Cash at the table = no cashback."
          : "Discount is applied directly to the bill — cash or card. Mesita stays out of the payment flow."}
      </span>
    </p>
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
