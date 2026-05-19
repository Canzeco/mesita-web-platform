"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Instagram,
  Percent,
} from "lucide-react";
import { type MyVenue } from "@/lib/api/venues";
import { KIND_LABEL, type TicketKind } from "@/lib/api/tickets";
import { FiscalBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { PLANS, mechanicForPlan } from "@/lib/manager/plans";

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

export function RewardsClient({ venue }: { venue: MyVenue }) {
  const isFormal = venue.fiscal_type === "formal";
  const mechanic = mechanicForPlan(venue.plan);
  const currentPlan = PLANS.find((p) => p.id === venue.plan);

  // The plan can drift out of sync with fiscal_type (manager flips fiscal on
  // Subscription without picking a new plan). Flag it here too — but send
  // them back to Subscription to fix.
  const planMatchesFiscal =
    venue.plan === "free" ||
    (isFormal ? venue.plan.startsWith("formal_") : venue.plan.startsWith("informal_"));

  return (
    <div className="flex flex-col gap-6">
      {/* Read-only summary of the subscription state that drives this page.
         The actual knobs live on /manager/subscription. */}
      <ActivePlanBanner
        planLabel={currentPlan?.label ?? venue.plan}
        priceLabel={currentPlan?.priceLabel ?? ""}
        fiscalType={venue.fiscal_type}
        mechanic={mechanic}
      />

      {!planMatchesFiscal && (
        <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <p className="flex items-start gap-2 text-[12px] leading-relaxed">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>
              Your current plan{" "}
              <span className="font-semibold">{currentPlan?.label ?? venue.plan}</span>{" "}
              doesn&apos;t match this venue&apos;s fiscal type (
              <span className="font-semibold">{venue.fiscal_type}</span>). Pick a
              matching plan in{" "}
              <Link
                href={`/manager/subscription?unit=${venue.id}`}
                className="font-semibold underline underline-offset-2"
              >
                Subscription
              </Link>
              , otherwise tickets will refuse to open.
            </span>
          </p>
        </section>
      )}

      <RatesSection venue={venue} mechanic={mechanic} />

      <TicketReferenceCard isFormal={isFormal} planMechanic={mechanic} />
    </div>
  );
}

function ActivePlanBanner({
  planLabel,
  priceLabel,
  fiscalType,
  mechanic,
}: {
  planLabel: string;
  priceLabel: string;
  fiscalType: "formal" | "informal";
  mechanic: "None" | "Cashback" | "Discount";
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            Active plan
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            {planLabel}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {priceLabel}
            {priceLabel && " · "}
            Mechanic: <span className="font-semibold">{mechanic}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FiscalBadge fiscalType={fiscalType} size="md" />
          <Link
            href="/manager/subscription"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/50"
          >
            Change <ChevronRight className="h-3.5 w-3.5" />
          </Link>
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
          Upgrade to Pro or Ultra in{" "}
          <Link
            href="/manager/subscription"
            className="font-semibold underline underline-offset-2"
          >
            Subscription
          </Link>{" "}
          to start running {venue.fiscal_type === "formal" ? "cashback" : "discount"}{" "}
          coupons.
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
