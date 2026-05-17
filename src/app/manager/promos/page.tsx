"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Crown,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Users as UsersIcon,
  Globe,
  GraduationCap,
  Info,
  Power,
} from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { tierBadgeClass, type Tier } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

const TIERS: Tier[] = ["bronze", "silver", "gold", "diamond"];

// Mesita cashback ladder. Hard cap on what a manager can set anywhere in the
// product. Keeps the comparison signal across the catalog tight.
const CASHBACK_OPTIONS = [5, 10, 20, 50] as const;

type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
const DAY_LABEL: Record<Day, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

type SegmentFilters = {
  classes?: Tier[];
  sexes?: ("female" | "male")[];
  ageMin?: number;
  ageMax?: number;
  countries?: string[];
  communities?: string[];
  days?: Day[];
  timeStart?: string;
  timeEnd?: string;
};

type Segment = {
  id: string;
  name: string;
  cashbackPercent: number;
  filters: SegmentFilters;
  active: boolean;
};

const STARTER_SEGMENTS: Segment[] = [
  {
    id: "weekend-girls",
    name: "Weekend girls 17–23",
    cashbackPercent: 20,
    filters: {
      sexes: ["female"],
      ageMin: 17,
      ageMax: 23,
      days: ["fri", "sat", "sun"],
    },
    active: true,
  },
  {
    id: "tec-thursdays",
    name: "Tec Thursdays",
    cashbackPercent: 10,
    filters: {
      communities: ["Tec de Monterrey"],
      days: ["thu"],
    },
    active: true,
  },
  {
    id: "diamond-cdmx",
    name: "CDMX Diamond locals",
    cashbackPercent: 50,
    filters: {
      classes: ["diamond"],
      countries: ["MX"],
    },
    active: false,
  },
];

export default function PromosPage() {
  const [promosActive, setPromosActive] = useState(false);
  const [welcome, setWelcome] = useState(20);
  const [tierValues, setTierValues] = useState<Record<Tier, number>>({
    bronze: 5,
    silver: 10,
    gold: 20,
    diamond: 50,
  });
  const [advancedEnabled, setAdvancedEnabled] = useState(true);
  const [segments, setSegments] = useState<Segment[]>(STARTER_SEGMENTS);

  const subtitle = promosActive
    ? "You're featured in discovery. Set what guests earn back."
    : "Currently off — standard listing, no cashback to guests.";

  return (
    <>
      <Topbar title="Promos" subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
          <MasterToggle
            active={promosActive}
            onToggle={() => setPromosActive((v) => !v)}
          />

          {promosActive && (
            <>
              <BasicSection
                welcome={welcome}
                setWelcome={setWelcome}
                tierValues={tierValues}
                setTierValues={setTierValues}
              />

              <AdvancedSection
                enabled={advancedEnabled}
                onToggle={() => setAdvancedEnabled((v) => !v)}
                segments={segments}
                onToggleSegment={(id) =>
                  setSegments((s) =>
                    s.map((seg) =>
                      seg.id === id ? { ...seg, active: !seg.active } : seg,
                    ),
                  )
                }
                onDelete={(id) => setSegments((s) => s.filter((x) => x.id !== id))}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Master toggle
// ---------------------------------------------------------------------------

function MasterToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        active
          ? "border-secondary/30 bg-[linear-gradient(135deg,oklch(0.97_0.018_10),oklch(0.95_0.030_5))]"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition",
            active
              ? "bg-pink-gradient text-white shadow-glow"
              : "bg-muted text-muted-foreground",
          )}
        >
          {active ? <Sparkles className="h-5 w-5" /> : <Power className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Account-wide
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            Promos {active ? "active" : "off"}
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            When active, you pay cashback to guests and Mesita pushes your venue further up in
            Discover, Swipe and AI search. Turn off any time to fall back to a standard
            listing.
          </p>
        </div>
        <Switch checked={active} onClick={onToggle} />
      </div>
    </section>
  );
}

function Switch({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-pink-gradient" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Basic promos
// ---------------------------------------------------------------------------

function BasicSection({
  welcome,
  setWelcome,
  tierValues,
  setTierValues,
}: {
  welcome: number;
  setWelcome: (n: number) => void;
  tierValues: Record<Tier, number>;
  setTierValues: (v: Record<Tier, number>) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Basic promos"
        title="Welcome offer + tier cashback"
        sub="Set once. Mesita applies the right rate based on the guest's class."
      />
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CashbackCard
          label="Welcome"
          badge={
            <span className="rounded-full bg-pink-gradient px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
              First visit
            </span>
          }
          subtle="One-time, all classes"
          value={welcome}
          onChange={setWelcome}
        />
        {TIERS.map((t) => (
          <CashbackCard
            key={t}
            label={t[0].toUpperCase() + t.slice(1)}
            badge={
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  tierBadgeClass(t),
                )}
              >
                {t}
              </span>
            }
            subtle={tierVisitsRange(t)}
            value={tierValues[t]}
            onChange={(n) => setTierValues({ ...tierValues, [t]: n })}
          />
        ))}
      </div>
    </section>
  );
}

function tierVisitsRange(t: Tier): string {
  switch (t) {
    case "bronze":
      return "0 – 2 visits";
    case "silver":
      return "3 – 6 visits";
    case "gold":
      return "7 – 19 visits";
    case "diamond":
      return "20+ visits";
  }
}

function CashbackCard({
  label,
  badge,
  subtle,
  value,
  onChange,
}: {
  label: string;
  badge: React.ReactNode;
  subtle: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        {badge}
        <p className="text-[10px] text-muted-foreground">{subtle}</p>
      </div>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight">{label}</p>
      <p className="mt-1 flex items-baseline gap-0.5">
        <span className="font-display text-4xl font-bold leading-none text-secondary">
          {value}
        </span>
        <span className="text-lg font-semibold text-secondary">%</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {CASHBACK_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "flex h-7 min-w-[34px] items-center justify-center rounded-full border px-2 text-[11px] font-semibold transition",
              value === opt
                ? "border-secondary bg-secondary text-secondary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {opt}%
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Advanced segments
// ---------------------------------------------------------------------------

function AdvancedSection({
  enabled,
  onToggle,
  segments,
  onToggleSegment,
  onDelete,
}: {
  enabled: boolean;
  onToggle: () => void;
  segments: Segment[];
  onToggleSegment: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Advanced promos"
        title="Custom segments"
        sub="Cashback rules for specific audiences. When segments overlap, the highest cashback wins."
        trailing={<Switch checked={enabled} onClick={onToggle} />}
      />

      {!enabled ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <Layers className="mx-auto h-6 w-6 text-muted-foreground/60" />
          <p className="mt-2 text-sm font-medium">Advanced segments are off</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Flip the switch above to add custom rules on top of the basic tiers.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-secondary/30 bg-secondary/5 px-3 py-2 text-[12px] text-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
            <p>
              <span className="font-semibold">Best cashback wins.</span> If a guest matches the
              tier rule and a segment, they get the higher of the two — never both stacked.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {segments.map((s) => (
              <SegmentCard
                key={s.id}
                segment={s}
                onToggle={() => onToggleSegment(s.id)}
                onDelete={() => onDelete(s.id)}
              />
            ))}
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/40 py-4 text-[13px] font-semibold text-muted-foreground transition hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
            >
              <Plus className="h-4 w-4" />
              New segment
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function SegmentCard({
  segment,
  onToggle,
  onDelete,
}: {
  segment: Segment;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const pills = useMemo(() => filterPills(segment.filters), [segment.filters]);
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 transition",
        !segment.active && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            segment.active
              ? "bg-pink-gradient text-white shadow-sm"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Layers className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold tracking-tight">
            {segment.name}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {pills.map((p, i) => (
              <Pill key={i} Icon={p.Icon}>
                {p.label}
              </Pill>
            ))}
          </div>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="font-display text-2xl font-bold leading-none text-secondary">
            {segment.cashbackPercent}
          </span>
          <span className="text-sm font-semibold text-secondary">%</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <Switch checked={segment.active} onClick={onToggle} />
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-semibold transition hover:bg-muted"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete segment"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-destructive/5 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function filterPills(f: SegmentFilters): {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] {
  const out: { Icon: React.ComponentType<{ className?: string }>; label: string }[] = [];
  if (f.classes && f.classes.length > 0) {
    out.push({ Icon: Crown, label: `Class: ${f.classes.join(", ")}` });
  }
  if (f.sexes && f.sexes.length > 0) {
    out.push({ Icon: UsersIcon, label: f.sexes.join(" + ") });
  }
  if (f.ageMin != null || f.ageMax != null) {
    out.push({
      Icon: UsersIcon,
      label: `${f.ageMin ?? "?"}–${f.ageMax ?? "?"}`,
    });
  }
  if (f.countries && f.countries.length > 0) {
    out.push({ Icon: Globe, label: f.countries.join(", ") });
  }
  if (f.communities && f.communities.length > 0) {
    out.push({ Icon: GraduationCap, label: f.communities.join(", ") });
  }
  if (f.days && f.days.length > 0) {
    out.push({
      Icon: Calendar,
      label: f.days.map((d) => DAY_LABEL[d]).join(" · "),
    });
  }
  if (f.timeStart || f.timeEnd) {
    out.push({ Icon: Clock, label: `${f.timeStart ?? "00:00"} – ${f.timeEnd ?? "23:59"}` });
  }
  return out;
}

function Pill({
  Icon,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium capitalize">
      <Icon className="h-3 w-3 text-muted-foreground" />
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function SectionHeader({
  eyebrow,
  title,
  sub,
  trailing,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">{sub}</p>
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
