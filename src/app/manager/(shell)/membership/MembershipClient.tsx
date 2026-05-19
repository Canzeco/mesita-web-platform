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
import { PLANS, mechanicForPlan } from "@/lib/manager/plans";

// Single-card Membership picker. The previous incarnation had three nested
// boxes (active-plan hero, fiscal toggle, plan picker) that read as
// fragmented for what is, after the 3-plan model, a tiny piece of state:
// pick one of Free / Formal Pro / Informal Pro + a fiscal-type toggle.
// Everything now lives inside one rounded container with the fiscal
// segmented control top-right, three plan rows in the middle, and the
// payment-rail caption + save button at the bottom.

export function MembershipClient({ venue }: { venue: MyVenue }) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);

  const [plan, setPlan] = useState<VenuePlan>(venue.plan);
  const [pending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  // Mismatch: the selected plan is for the other fiscal type. We show
  // this inline next to the row so the manager sees the cause + fix
  // together, instead of as a separate destructive banner up top.
  const planFiscalScope = useMemo(() => {
    const meta = PLANS.find((p) => p.id === plan);
    return meta?.fiscalScope ?? "any";
  }, [plan]);
  const fiscalMismatch =
    planFiscalScope !== "any" &&
    ((isFormal && planFiscalScope === "informal") ||
      (!isFormal && planFiscalScope === "formal"));

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
      <section className="rounded-2xl border border-border bg-card shadow-sm">
        {/* Header row: title + fiscal segmented toggle on the right. */}
        <header className="flex flex-col gap-3 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
              Membership
            </p>
            <h2 className="mt-0.5 font-display text-xl font-semibold tracking-tight">
              Pick a plan
            </h2>
          </div>
          <FiscalSegmentedToggle
            current={venue.fiscal_type}
            pending={fiscalPending}
            onSwitch={switchFiscal}
          />
        </header>

        {fiscalError && (
          <p className="border-b border-border bg-destructive/5 px-6 py-2 text-xs text-destructive">
            {fiscalError}
          </p>
        )}

        {/* Three plan rows, stacked. Each highlights with a tinted border
            when selected; the persisted plan gets an 'Active' badge. */}
        <ul className="divide-y divide-border">
          {PLANS.map((p) => {
            const selected = plan === p.id;
            const currentlyActive = venue.plan === p.id;
            const scope = p.fiscalScope;
            const wrongFiscal =
              scope !== "any" &&
              ((isFormal && scope === "informal") ||
                (!isFormal && scope === "formal"));
            return (
              <PlanRow
                key={p.id}
                plan={p}
                selected={selected}
                currentlyActive={currentlyActive}
                wrongFiscal={wrongFiscal}
                onSelect={() => setPlan(p.id)}
              />
            );
          })}
        </ul>

        {/* Payment-rail caption + warning + footer save bar. */}
        <div className="flex flex-col gap-3 border-t border-border px-6 py-5">
          <PaymentRailLine isFormal={isFormal} />

          {fiscalMismatch && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] leading-relaxed text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                The plan you picked doesn&apos;t match your fiscal type.
                Switch fiscal at the top or pick a matching plan — otherwise
                tickets refuse to open.
              </span>
            </p>
          )}

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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={pending || plan === venue.plan || fiscalMismatch}
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
        </div>
      </section>

      <TicketTypesCard isFormal={isFormal} planMechanic={mechanic} />
    </div>
  );
}

// ─── Plan row ─────────────────────────────────────────────────────────────

function PlanRow({
  plan,
  selected,
  currentlyActive,
  wrongFiscal,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  selected: boolean;
  currentlyActive: boolean;
  wrongFiscal: boolean;
  onSelect: () => void;
}) {
  const MechanicIcon =
    plan.mechanic === "Cashback"
      ? CircleDollarSign
      : plan.mechanic === "Discount"
        ? Percent
        : Sparkles;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-4 px-6 py-4 text-left transition",
          selected ? "bg-secondary/5" : "hover:bg-muted/40",
          wrongFiscal && "opacity-60",
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
            {wrongFiscal && !currentlyActive && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive">
                Wrong fiscal
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
    </li>
  );
}

// ─── Fiscal toggle + payment-rail caption ────────────────────────────────

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
        active ? tone : "text-muted-foreground hover:text-foreground",
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
