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
  Calendar,
  Instagram,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiUpdateVenue, type MyVenue, type VenuePlan } from "@/lib/api/venues";
import { KIND_LABEL, type TicketKind } from "@/lib/api/tickets";
import { FiscalBadge } from "@/components/shared";
import { cn } from "@/lib/utils";

// ─── Plan catalog ────────────────────────────────────────────────────────

type PlanRow = {
  id: VenuePlan;
  label: string;
  priceLabel: string;
  mechanic: "None" | "Cashback" | "Discount";
  visibility: "Minimum" | "Medium" | "Maximum";
  fiscalScope: "any" | "formal" | "informal";
  blurb: string;
};

const PLANS: PlanRow[] = [
  {
    id: "free",
    label: "Free",
    priceLabel: "$0 MX / mo",
    mechanic: "None",
    visibility: "Minimum",
    fiscalScope: "any",
    blurb:
      "Scraped from Google Business. You appear minimally in discovery and accept AI reservations. No coupons, no dashboard writes.",
  },
  {
    id: "formal_pro",
    label: "Formal Pro",
    priceLabel: "$1,000 MX / mo",
    mechanic: "Cashback",
    visibility: "Medium",
    fiscalScope: "formal",
    blurb:
      "Cashback on card payments through Mesita. Normal placement across swipe, map, catalog, AI planner.",
  },
  {
    id: "formal_ultra",
    label: "Formal Ultra",
    priceLabel: "$3,000 MX / mo",
    mechanic: "Cashback",
    visibility: "Maximum",
    fiscalScope: "formal",
    blurb:
      "Cashback on card payments. Top placement on every surface plus featured slots.",
  },
  {
    id: "informal_pro",
    label: "Informal Pro",
    priceLabel: "$2,000 MX / mo",
    mechanic: "Discount",
    visibility: "Medium",
    fiscalScope: "informal",
    blurb:
      "Instant discount on the cash bill. Normal placement. 2× formal price because Mesita captures no wallet / data.",
  },
  {
    id: "informal_ultra",
    label: "Informal Ultra",
    priceLabel: "$6,000 MX / mo",
    mechanic: "Discount",
    visibility: "Maximum",
    fiscalScope: "informal",
    blurb:
      "Instant discount. Top placement + featured slots. 2× formal at this tier.",
  },
];

// ─── 10-ticket reference ─────────────────────────────────────────────────

type KindRef = { kind: TicketKind; layers: string[]; warn?: boolean };

const FORMAL_REFERENCE: KindRef[] = [
  { kind: "none", layers: ["No transaction"] },
  { kind: "p_c", layers: ["Payment", "Cashback"] },
  { kind: "s_p_sf_c", layers: ["Story", "Payment", "Story-Fallback", "Cashback"] },
  { kind: "r_p_c", layers: ["Reservation", "Payment", "Cashback"] },
  {
    kind: "r_s_p_sf_c",
    layers: ["Reservation", "Story", "Payment", "Story-Fallback", "Cashback"],
  },
];

const INFORMAL_REFERENCE: KindRef[] = [
  { kind: "none", layers: ["No transaction"] },
  { kind: "dp", layers: ["Discounted-Payment"] },
  {
    kind: "s_dp_sf",
    layers: ["Story", "Discounted-Payment", "Story-Fallback"],
    warn: true,
  },
  { kind: "r_dp", layers: ["Reservation", "Discounted-Payment"] },
  {
    kind: "r_s_dp_sf",
    layers: ["Reservation", "Story", "Discounted-Payment", "Story-Fallback"],
    warn: true,
  },
];

// ─── Client ──────────────────────────────────────────────────────────────

export function PromosClient({ venue }: { venue: MyVenue }) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);

  // Plan is the row's current persisted value. We update locally on submit
  // so the UI feels fast, then `router.refresh()` re-pulls from the server.
  const [plan, setPlan] = useState<VenuePlan>(venue.plan);
  const [pending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isFormal = venue.fiscal_type === "formal";
  const mechanic = mechanicForPlan(plan);
  const visibility = visibilityForPlan(plan);

  // Plans available for this fiscal type: Free is universal, then either
  // the formal pair or the informal pair. We don't show the mismatched
  // pair at all — picking it is impossible until the manager flips
  // fiscal_type back on the Place page.
  const availablePlans = useMemo(
    () =>
      PLANS.filter(
        (p) =>
          p.fiscalScope === "any" ||
          (isFormal ? p.fiscalScope === "formal" : p.fiscalScope === "informal"),
      ),
    [isFormal],
  );

  // Detect the rare case where the persisted plan no longer fits the
  // venue's fiscal_type (e.g. the manager flipped fiscal_type on the Place
  // tab while a Pro plan was active). Surface a warning so they fix it
  // here before the inconsistency leaks into a ticket.
  const planMatchesFiscal = useMemo(() => {
    if (venue.plan === "free") return true;
    if (isFormal) return venue.plan.startsWith("formal_");
    return venue.plan.startsWith("informal_");
  }, [venue.plan, isFormal]);

  const submit = () => {
    if (plan === venue.plan) return; // no-op
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
      {/* ── Current snapshot ─────────────────────────────────────────── */}
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

      {/* Plan ↔ fiscal mismatch (only shows after a fiscal_type flip). */}
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

      {/* ── Payment rail rule (the one rule that bites most often) ───── */}
      <PaymentRailRule isFormal={isFormal} />

      {/* ── Plan selector ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <header className="mb-4">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Pick a subscription plan
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Plans differ by price and visibility. The mechanic (cashback or
            discount) is pinned by the venue&apos;s fiscal type, so you only see
            the plans that match. Change fiscal type from the Place tab.
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

      {/* ── Rates (cashback for formal, discount for informal) ────────── */}
      <RatesSection venue={venue} mechanic={mechanic} />

      {/* ── 10-ticket reference card ──────────────────────────────────── */}
      <TicketReferenceCard isFormal={isFormal} planMechanic={mechanic} />
    </div>
  );
}

function PlanCard({
  plan,
  selected,
  currentlyActive,
  onSelect,
}: {
  plan: PlanRow;
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
          <Pill icon={plan.mechanic === "Cashback" ? CircleDollarSign : plan.mechanic === "Discount" ? Percent : Sparkles}>
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

function RatesSection({
  venue,
  mechanic,
}: {
  venue: MyVenue;
  mechanic: "None" | "Cashback" | "Discount";
}) {
  if (mechanic === "None") {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
        <p className="font-display text-base font-semibold tracking-tight">
          No coupon mechanic on the Free plan
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upgrade to Pro or Ultra above to start running{" "}
          {venue.fiscal_type === "formal" ? "cashback" : "discount"} coupons.
        </p>
      </section>
    );
  }
  const rate = venue.cashback_percent ?? 0;
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-3">
        <h3 className="font-display text-lg font-semibold tracking-tight">
          {mechanic === "Cashback" ? "Cashback rate" : "Discount rate"}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          The rate snapshot at ticket-open time. Edit it on the Place tab —
          per-tier rates land here once the segments table ships.
        </p>
      </header>
      <div className="flex items-center gap-3 rounded-xl bg-background p-4">
        <span className="font-display text-4xl font-bold tabular-nums">
          {rate}%
        </span>
        <div className="text-[12px] leading-snug">
          <p className="font-semibold">
            {mechanic === "Cashback"
              ? "Of the gross bill, landed to the guest's Mesita balance."
              : "Of the gross bill, taken off at the table."}
          </p>
          <p className="text-muted-foreground">
            {mechanic === "Cashback"
              ? "Earned on what they spent. Redemption is tracked separately at next visit."
              : "Applied immediately, before the guest pays in cash or card."}
          </p>
        </div>
      </div>
    </section>
  );
}

function TicketReferenceCard({
  isFormal,
  planMechanic,
}: {
  isFormal: boolean;
  planMechanic: "None" | "Cashback" | "Discount";
}) {
  const rows = isFormal ? FORMAL_REFERENCE : INFORMAL_REFERENCE;
  const subtitle = isFormal
    ? "Five formal flows — each builds on None by adding Reservation, Story, or both. Cashback never lands until the story is verified, so failed stories cost the guest the cashback (not the venue)."
    : "Five informal flows — each builds on None by adding Reservation, Story, or both. The story is verified post-checkout; if it fails, the discount was already applied at the bill. That's the vulnerability flag below.";
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Your ticket types ({rows.length})
          </h3>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <span className="rounded-full bg-foreground/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          {isFormal ? "Formal" : "Informal"}
        </span>
      </header>

      {planMechanic === "None" && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          On Free the only available flow is{" "}
          <span className="font-semibold">None</span> — no Mesita transaction at
          checkout.
        </p>
      )}

      <ul className="flex flex-col divide-y divide-border">
        {rows.map((row, i) => (
          <li key={row.kind} className="flex items-start gap-3 py-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-sm font-semibold">{KIND_LABEL[row.kind]}</p>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                  {row.kind}
                </span>
                {row.warn && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Vulnerability
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {row.layers.map((l) => (
                  <LayerChip key={l} label={l} isFormal={isFormal} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LayerChip({ label, isFormal }: { label: string; isFormal: boolean }) {
  const tone = (() => {
    if (label === "Reservation") return "bg-secondary/15 text-secondary";
    if (label === "Story") return "bg-pink-gradient/15 text-foreground";
    if (label === "Story-Fallback") return "bg-muted text-muted-foreground";
    if (label === "Payment") return "bg-foreground/10 text-foreground";
    if (label === "Discounted-Payment") return "bg-tier-gold/30 text-black";
    if (label === "Cashback") return isFormal ? "bg-pink-gradient text-white" : "bg-muted text-muted-foreground";
    if (label === "No transaction") return "bg-muted text-muted-foreground";
    return "bg-muted text-muted-foreground";
  })();
  const Icon = (() => {
    if (label === "Reservation") return Calendar;
    if (label === "Story") return Instagram;
    if (label === "Story-Fallback") return Instagram;
    if (label === "Payment") return CreditCard;
    if (label === "Discounted-Payment") return Percent;
    if (label === "Cashback") return CircleDollarSign;
    return ChevronRight;
  })();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        tone,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
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

function mechanicForPlan(p: VenuePlan): "None" | "Cashback" | "Discount" {
  if (p === "free") return "None";
  if (p === "formal_pro" || p === "formal_ultra") return "Cashback";
  return "Discount";
}
function visibilityForPlan(p: VenuePlan): "Minimum" | "Medium" | "Maximum" {
  if (p === "free") return "Minimum";
  if (p === "formal_pro" || p === "informal_pro") return "Medium";
  return "Maximum";
}
