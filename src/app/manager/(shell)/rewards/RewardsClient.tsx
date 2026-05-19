"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Filter,
  GraduationCap,
  Instagram,
  MapPin,
  Users,
} from "lucide-react";
import { type MyVenue } from "@/lib/api/venues";
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

// ─── Client ───────────────────────────────────────────────────────────────

export function RewardsClient({ venue }: { venue: MyVenue }) {
  const isFormal = venue.fiscal_type === "formal";
  const mechanic = mechanicForPlan(venue.plan);
  const currentPlan = PLANS.find((p) => p.id === venue.plan);

  // The plan can drift out of sync with fiscal_type (manager flips fiscal on
  // Membership without picking a new plan). Flag it here too — but send
  // them back to Membership to fix.
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
                href={`/manager/membership?unit=${venue.id}`}
                className="font-semibold underline underline-offset-2"
              >
                Membership
              </Link>
              , otherwise tickets will refuse to open.
            </span>
          </p>
        </section>
      )}

      {mechanic === "None" && (
        <FreePlanBanner fiscalType={venue.fiscal_type} />
      )}

      <SegmentationGroup
        kind="basic"
        title="Basic segmentation"
        blurb="Two levers every venue gets: a Welcome coupon for first-time guests and per-tier rates for returning ones."
      >
        <FirstTimeSection mechanicLabel={mechanicLabel} />
        <ReturningTierGrid mechanicLabel={mechanicLabel} />
      </SegmentationGroup>

      <SegmentationGroup
        kind="advanced"
        title="Advanced segmentation"
        blurb="Stack extra dimensions on top of the basic tier rates — communities, demographics, geography, custom rules. All landing with the segments table."
      >
        <AdvancedSegmentationGrid />
      </SegmentationGroup>
    </div>
  );
}

function SegmentationGroup({
  kind,
  title,
  blurb,
  children,
}: {
  kind: "basic" | "advanced";
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {kind === "advanced" && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Coming soon
            </span>
          )}
        </div>
        <p className="max-w-xl text-[12px] leading-relaxed text-muted-foreground">
          {blurb}
        </p>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
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
            href="/manager/membership"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/50"
          >
            Change <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FreePlanBanner({ fiscalType }: { fiscalType: "formal" | "informal" }) {
  // Thin "won't go live until upgrade" banner shown above the configurator.
  // The UI underneath stays fully interactive so the manager can set their
  // rates before subscribing — it just won't be active for guests yet.
  const mechanic = fiscalType === "formal" ? "cashback" : "discount";
  return (
    <section className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        You&apos;re on <span className="font-semibold text-foreground">Free</span>.
        Set your rates here — they won&apos;t go live for guests until you
        upgrade to a {mechanic}-enabled plan in{" "}
        <Link
          href="/manager/membership"
          className="font-semibold text-foreground underline underline-offset-2"
        >
          Membership
        </Link>
        .
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
      <div className="rounded-2xl bg-primary/5 p-5 ring-1 ring-primary/15">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-welcome-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
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
        <span className="font-display text-5xl font-bold leading-none tracking-tight text-primary">
          {rate}
        </span>
        <span className="font-display text-xl font-semibold text-primary">%</span>
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
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
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

// ─── Advanced segmentation (coming soon) ──────────────────────────────────

type AdvancedAxisMeta = {
  id: string;
  label: string;
  blurb: string;
  examples: string[];
  Icon: typeof Users;
};

const ADVANCED_AXES: AdvancedAxisMeta[] = [
  {
    id: "community",
    label: "Communities",
    blurb: "Email-verified schools and orgs — Tec, UDEM, Stanford, ITAM…",
    examples: ["Tec students only", "Stanford alumni", "ITAM Sundays"],
    Icon: GraduationCap,
  },
  {
    id: "demo",
    label: "Sex & age",
    blurb: "Boost or filter by demographic bands.",
    examples: ["Women 21–28", "Men 30+", "Any sex 25–35"],
    Icon: Users,
  },
  {
    id: "geo",
    label: "Country & city",
    blurb: "Reach visitors from specific places only.",
    examples: ["Visitors from CDMX", "Tourists from US / EU", "Locals only"],
    Icon: MapPin,
  },
  {
    id: "occasion",
    label: "Date & occasion",
    blurb: "Time-window boosts for slow nights or events.",
    examples: ["Mondays only", "Birthday week", "Pride · Día de la Madre"],
    Icon: Calendar,
  },
  {
    id: "custom",
    label: "Custom rules",
    blurb: "Compose AND / OR filters across every axis.",
    examples: ["Gold + Tec + Female", "Silver + birthday + Monday"],
    Icon: Filter,
  },
];

function AdvancedSegmentationGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {ADVANCED_AXES.map((a) => (
        <AdvancedAxisCard key={a.id} axis={a} />
      ))}
    </div>
  );
}

function AdvancedAxisCard({ axis }: { axis: AdvancedAxisMeta }) {
  const Icon = axis.Icon;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm opacity-80">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          <Icon className="h-3 w-3" />
          {axis.label}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          Soon
        </span>
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        {axis.blurb}
      </p>
      <ul className="mt-1 flex flex-col gap-1">
        {axis.examples.map((ex) => (
          <li
            key={ex}
            className="rounded-md bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground"
          >
            {ex}
          </li>
        ))}
      </ul>
    </div>
  );
}

