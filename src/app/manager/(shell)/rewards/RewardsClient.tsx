"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  GraduationCap,
  Instagram,
  Mail,
  Percent,
  Users,
} from "lucide-react";
import { type MyVenue } from "@/lib/api/venues";
import { KIND_LABEL, type TicketKind } from "@/lib/api/tickets";
import { FiscalBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import { PLANS, mechanicForPlan } from "@/lib/manager/plans";

// ─── Rate picker scale ────────────────────────────────────────────────────

// The four discrete cashback / discount levels. Same scale across the
// Welcome coupon and every tier — matches the product spec.
const RATE_CHOICES = [5, 10, 20, 50] as const;
type RateChoice = (typeof RATE_CHOICES)[number];

// ─── Tier ladder catalog ──────────────────────────────────────────────────

type TierId = "bronze" | "silver" | "gold" | "diamond";

type TierMeta = {
  id: TierId;
  label: string;
  visitRange: string;
  /** Default rate the card lands on when first opened. */
  defaultRate: RateChoice;
  estPerWeek: number;
  /** Mock pool size. Real values land once the segments table ships. */
  onMesita: number;
  /** Where this tier comes from — used as the subtext on the audience
   *  stat at the bottom of each card. */
  source: string;
  /** Sample handles to show under the audience stat (3 plus +N for
   *  overflow). Purely visual — pulled from a shared mock pool later. */
  handles: string[];
  overflowHandles: number;
  /** True for Bronze — no Instagram requirement, no handles shown. */
  publicPool?: boolean;
};

const TIERS: TierMeta[] = [
  {
    id: "bronze",
    label: "Bronze",
    visitRange: "0 – 2 visits",
    defaultRate: 5,
    estPerWeek: 6,
    onMesita: 18_420,
    source: "Everyone",
    handles: [],
    overflowHandles: 0,
    publicPool: true,
  },
  {
    id: "silver",
    label: "Silver",
    visitRange: "3 – 6 visits",
    defaultRate: 10,
    estPerWeek: 12,
    onMesita: 6_240,
    source: "1K+ followers",
    handles: ["@sofip", "@renatak", "@tomasl"],
    overflowHandles: 0,
  },
  {
    id: "gold",
    label: "Gold",
    visitRange: "7 – 19 visits",
    defaultRate: 20,
    estPerWeek: 24,
    onMesita: 1_860,
    source: "5K+ followers",
    handles: ["@valenrose", "@lucasm", "@camivb"],
    overflowHandles: 2,
  },
  {
    id: "diamond",
    label: "Diamond",
    visitRange: "20+ visits",
    defaultRate: 30 as RateChoice, // tier displays default but picker still snaps to the 4 official choices
    estPerWeek: 36,
    onMesita: 184,
    source: "20K+ followers · invite-only",
    handles: ["@valenrose", "@camivb", "@anat"],
    overflowHandles: 1,
  },
];

// ─── Communities (coming soon) ────────────────────────────────────────────

type CommunityMeta = {
  id: string;
  label: string;
  defaultOn: boolean;
  defaultBoost: 5 | 10 | 15;
  membersOnMesita: number;
};

const COMMUNITIES: CommunityMeta[] = [
  { id: "tec", label: "Tec de Monterrey", defaultOn: true, defaultBoost: 5, membersOnMesita: 1840 },
  { id: "udem", label: "UDEM", defaultOn: true, defaultBoost: 5, membersOnMesita: 980 },
  { id: "stanford", label: "Stanford", defaultOn: false, defaultBoost: 10, membersOnMesita: 712 },
  { id: "itam", label: "ITAM", defaultOn: false, defaultBoost: 5, membersOnMesita: 640 },
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

// ─── Client ───────────────────────────────────────────────────────────────

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

  // Mechanic label — drives copy across the Welcome card + per-tier cards.
  // "Cashback" for Formal partners (Mesita wallet credit on next visit),
  // "Discount" for Informal (applied directly at the bill).
  const mechanicLabel = mechanic === "Discount" ? "Discount" : "Cashback";

  return (
    <div className="flex flex-col gap-6">
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

      {mechanic === "None" ? (
        <FreePlanNotice fiscalType={venue.fiscal_type} />
      ) : (
        <>
          <FirstTimeSection mechanicLabel={mechanicLabel} />
          <ReturningTierGrid mechanicLabel={mechanicLabel} />
          <CommunitiesSection />
        </>
      )}

      <TicketReferenceCard isFormal={isFormal} planMechanic={mechanic} />
    </div>
  );
}

// ─── Subviews ─────────────────────────────────────────────────────────────

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

function FreePlanNotice({ fiscalType }: { fiscalType: "formal" | "informal" }) {
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
        to start running {fiscalType === "formal" ? "cashback" : "discount"}{" "}
        coupons.
      </p>
    </section>
  );
}

function FirstTimeSection({ mechanicLabel }: { mechanicLabel: "Cashback" | "Discount" }) {
  const [rate, setRate] = useState<RateChoice>(20);
  return (
    <section className="flex flex-col gap-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        First-time visitors
      </p>
      <div className="rounded-2xl bg-pink-gradient/5 p-5 ring-1 ring-pink-gradient/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-pink-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Welcome
            </span>
            <p className="mt-2 text-sm text-foreground">
              One-time {mechanicLabel.toLowerCase()} to convert a new guest into
              a regular.
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground">First visit only</span>
        </div>

        <RatePicker label={mechanicLabel} rate={rate} onChange={setRate} />

        <AudienceStat
          count={12_480}
          countLabel="Guests nearby · never visited"
          sub="Identity revealed after first visit."
        />
      </div>
    </section>
  );
}

function ReturningTierGrid({
  mechanicLabel,
}: {
  mechanicLabel: "Cashback" | "Discount";
}) {
  return (
    <section className="flex flex-col gap-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Returning visitors · by tier
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((t) => (
          <TierCard key={t.id} tier={t} mechanicLabel={mechanicLabel} />
        ))}
      </div>
    </section>
  );
}

function TierCard({
  tier,
  mechanicLabel,
}: {
  tier: TierMeta;
  mechanicLabel: "Cashback" | "Discount";
}) {
  // The default rate for Diamond (30) isn't in the 4-rate scale, so we
  // snap to the nearest matching scale value when seeding state.
  const initial: RateChoice = (RATE_CHOICES.find((r) => r >= tier.defaultRate) ??
    50) as RateChoice;
  const [rate, setRate] = useState<RateChoice>(initial);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <TierChip tier={tier.id} label={tier.label} />
        <span className="text-[11px] text-muted-foreground">{tier.visitRange}</span>
      </div>

      <RatePicker label={mechanicLabel} rate={rate} onChange={setRate} />

      <p className="text-[11px] text-muted-foreground">
        Est. <span className="font-semibold text-secondary">+{tier.estPerWeek} visits/wk</span>
      </p>

      <AudienceStat
        count={tier.onMesita}
        countLabel="On Mesita"
        sub={tier.source}
        handles={tier.handles}
        overflowHandles={tier.overflowHandles}
        publicPool={tier.publicPool}
      />
    </div>
  );
}

function RatePicker({
  label,
  rate,
  onChange,
}: {
  label: "Cashback" | "Discount";
  rate: RateChoice;
  onChange: (next: RateChoice) => void;
}) {
  return (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-bold leading-none tracking-tight text-pink-600">
          {rate}
        </span>
        <span className="font-display text-xl font-semibold text-pink-600">%</span>
        <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {RATE_CHOICES.map((c) => {
          const on = c === rate;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                on
                  ? "bg-pink-gradient text-white shadow-sm"
                  : "border border-border bg-background text-foreground hover:border-foreground/30",
              )}
            >
              {c}%
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AudienceStat({
  count,
  countLabel,
  sub,
  handles,
  overflowHandles,
  publicPool,
}: {
  count: number;
  countLabel: string;
  sub: string;
  handles?: string[];
  overflowHandles?: number;
  publicPool?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-lg font-bold tabular-nums">
          {count.toLocaleString()}
        </p>
        <p className="max-w-[55%] text-right text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {countLabel}
        </p>
      </div>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-pink-600">
        {sub}
      </p>
      {publicPool && (
        <p className="mt-1 text-[10px] text-muted-foreground">
          No social profile shared
        </p>
      )}
      {handles && handles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {handles.map((h) => (
            <span
              key={h}
              className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
            >
              <Instagram className="h-2.5 w-2.5 text-muted-foreground" />
              {h}
            </span>
          ))}
          {overflowHandles != null && overflowHandles > 0 && (
            <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              +{overflowHandles}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TierChip({ tier, label }: { tier: TierId; label: string }) {
  const tone = (() => {
    switch (tier) {
      case "bronze":
        return "bg-tier-bronze text-white";
      case "silver":
        return "bg-tier-silver text-foreground";
      case "gold":
        return "bg-tier-gold text-black";
      case "diamond":
        return "bg-tier-diamond text-white";
    }
  })();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm",
        tone,
      )}
    >
      {label}
    </span>
  );
}

// ─── Communities (coming soon) ────────────────────────────────────────────

function CommunitiesSection() {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Communities · email-verified audiences
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          Coming soon
        </span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm opacity-90">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-semibold tracking-tight">
              Filter &amp; boost by community
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Reach members of specific schools or orgs (Tec, UDEM, Stanford…).
              Membership requires email verification — only verified members
              see the boost.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-semibold text-secondary">
            <Mail className="h-3 w-3" />
            Verified
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COMMUNITIES.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunityCard({ community }: { community: CommunityMeta }) {
  const [on, setOn] = useState(community.defaultOn);
  const [boost, setBoost] = useState<5 | 10 | 15>(community.defaultBoost);
  const CHOICES: (5 | 10 | 15)[] = [5, 10, 15];
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          <GraduationCap className="h-3 w-3" />
          {community.label}
        </span>
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          role="switch"
          aria-checked={on}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
            on ? "bg-pink-gradient" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition",
              on ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </button>
      </div>

      <p className={cn("mt-2 flex items-baseline gap-1", !on && "opacity-50")}>
        <span className="font-display text-3xl font-bold leading-none tracking-tight text-pink-600">
          +{boost}
        </span>
        <span className="font-display text-base font-semibold text-pink-600">%</span>
        <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Boost
        </span>
      </p>

      <div className={cn("mt-2 flex flex-wrap gap-1.5", !on && "opacity-50")}>
        {CHOICES.map((c) => {
          const active = c === boost;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setBoost(c)}
              disabled={!on}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold transition",
                active
                  ? "bg-pink-gradient text-white shadow-sm"
                  : "border border-border bg-background text-foreground hover:border-foreground/30",
                !on && "cursor-not-allowed",
              )}
            >
              +{c}%
            </button>
          );
        })}
      </div>

      <p className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Users className="h-3 w-3" />
        <span className="font-semibold text-foreground">
          {community.membersOnMesita.toLocaleString()}
        </span>{" "}
        verified members on Mesita
      </p>
    </div>
  );
}

// ─── Ticket types reference (kept at bottom — manager education) ─────────

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
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">{subtitle}</p>
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
    if (label === "Cashback")
      return isFormal ? "bg-pink-gradient text-white" : "bg-muted text-muted-foreground";
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

