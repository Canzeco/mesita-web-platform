"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Instagram,
  Mail,
  GraduationCap,
  Lock,
  Filter,
  Clock,
  Zap,
  Gem,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import {
  TIER_CASHBACK,
  NEARBY_NEVER_VISITED,
  COMMUNITIES,
  type GuestType,
} from "@/lib/manager-data";
import { tierBadgeClass } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "MX", flag: "🇲🇽" },
  { code: "US", flag: "🇺🇸" },
  { code: "CO", flag: "🇨🇴" },
  { code: "AR", flag: "🇦🇷" },
  { code: "ES", flag: "🇪🇸" },
  { code: "BR", flag: "🇧🇷" },
];

export default function PromosPage() {
  const [welcome, setWelcome] = useState(20);
  const [tierValues, setTierValues] = useState<Record<string, number>>(
    Object.fromEntries(TIER_CASHBACK.map((t) => [t.tier, t.percent])),
  );

  return (
    <>
      <Topbar
        title="Promos"
        subtitle="Set Mesita cashback for each tier. Everything else is automatic."
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col gap-6">
          {/* ---------- First-time visitors ---------- */}
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              First-time visitors
            </p>
            <div className="rounded-2xl border border-border bg-card-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-gradient-to-r from-fuchsia-400 to-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                    Welcome
                  </span>
                  <p className="mt-2 max-w-md text-[13px] text-muted-foreground">
                    One-time discount to convert a new guest into a regular.
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">First visit only</span>
              </div>

              <div className="mt-3 flex items-end gap-1">
                <span className="font-display text-5xl font-semibold leading-none text-secondary">
                  {welcome}
                </span>
                <span className="mb-1 text-xl text-secondary">%</span>
                <span className="mb-2 ml-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  cashback
                </span>
              </div>

              <div className="mt-3 grid max-w-xs grid-cols-4 gap-1.5">
                {[5, 10, 20, 50].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setWelcome(v)}
                    className={cn(
                      "rounded-full border px-2 py-1 text-[11px] font-semibold transition",
                      welcome === v
                        ? "border-secondary bg-secondary text-secondary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {v}%
                  </button>
                ))}
              </div>

              <div className="mt-4 max-w-sm rounded-xl border border-border bg-card p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-bold tracking-tight">
                    {NEARBY_NEVER_VISITED.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    Guests nearby · never visited
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Identity revealed after first visit.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- Returning visitors · by tier ---------- */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Returning visitors · by tier
              </p>
              <p className="text-[11px] text-muted-foreground">
                You&apos;re paying to win <span className="text-secondary">magnetic</span> or{" "}
                <span className="text-secondary">rich</span> guests.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TIER_CASHBACK.map((t) => {
                const v = tierValues[t.tier];
                return (
                  <div
                    key={t.tier}
                    className="rounded-2xl border border-border bg-card-soft p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          tierBadgeClass(t.tier),
                        )}
                      >
                        {t.tier}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{t.visitsRange}</span>
                    </div>

                    <div className="mt-3 flex items-end gap-1">
                      <span className="font-display text-5xl font-semibold leading-none text-secondary">
                        {v}
                      </span>
                      <span className="mb-1 text-xl text-secondary">%</span>
                      <span className="mb-2 ml-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        cashback
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                      {[5, 10, 20, 50].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setTierValues((s) => ({ ...s, [t.tier]: opt }))
                          }
                          className={cn(
                            "rounded-full border px-1.5 py-1 text-[11px] font-semibold transition",
                            v === opt
                              ? "border-secondary bg-secondary text-secondary-foreground"
                              : "border-border bg-card text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {opt}%
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 rounded-lg bg-secondary/8 p-2 text-[11px] text-muted-foreground">
                      Est. <span className="font-semibold text-secondary">+{Math.floor(v * 1.2)} visits/wk</span>
                    </div>

                    <div className="mt-2">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          {t.audience.toLocaleString()} on Mesita
                        </span>
                        <GuestTypeBadge type={t.guestType} />
                      </div>

                      {t.example ? (
                        <div className="rounded-xl border border-border bg-card p-2">
                          <div className="flex items-center gap-2">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                              <Image
                                src={t.example.avatar}
                                alt={t.example.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12px] font-semibold leading-tight">
                                {t.example.name}
                              </p>
                              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Instagram className="h-2.5 w-2.5" />
                                {t.example.handle} ·{" "}
                                <span className="font-semibold text-secondary">
                                  {t.example.followers}
                                </span>
                              </p>
                            </div>
                          </div>
                          {t.example.spendNote && (
                            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-tier-gold/20 px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                              <Gem className="h-2.5 w-2.5" />
                              {t.example.spendNote}
                            </p>
                          )}
                          {t.alsoHandles.length > 0 && (
                            <p className="mt-1.5 text-[9px] text-muted-foreground">
                              also{" "}
                              {t.alsoHandles.slice(0, 2).join(", ")}
                              {t.alsoHandles.length > 2 && ` +${t.alsoHandles.length - 2}`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-card p-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                            {t.reach}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            High-volume tier · no featured guest
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- Communities (MVP: disabled) ---------- */}
          <ComingSoonSection
            label="Communities · email-verified audiences"
            note="Available after MVP"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Filter & boost by community</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Reach members of specific schools or orgs (Tec, UDEM, Stanford…). Membership
                  requires email verification — only verified members see the boost.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-1 text-[10px] font-semibold text-secondary">
                <Mail className="h-3 w-3" />
                Verified
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COMMUNITIES.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        c.color,
                      )}
                    >
                      <GraduationCap className="h-3 w-3" />
                      {c.name}
                    </span>
                    <div
                      className={cn(
                        "flex h-5 w-9 items-center rounded-full px-0.5",
                        c.on ? "bg-secondary" : "bg-muted",
                      )}
                    >
                      <div className={cn("h-4 w-4 rounded-full bg-white", c.on && "ml-auto")} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-end gap-1">
                    <span
                      className={cn(
                        "font-display text-3xl font-semibold",
                        c.on ? "text-secondary" : "text-muted-foreground",
                      )}
                    >
                      +{c.boost}
                    </span>
                    <span
                      className={cn(
                        "mb-1 text-base",
                        c.on ? "text-secondary" : "text-muted-foreground",
                      )}
                    >
                      %
                    </span>
                    <span className="mb-1.5 ml-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                      boost
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {[5, 10, 15].map((v) => (
                      <span
                        key={v}
                        className={cn(
                          "rounded-full border px-1 py-1 text-center text-[11px] font-semibold",
                          c.boost === v
                            ? "border-secondary bg-secondary text-secondary-foreground"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        +{v}%
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 rounded-md bg-background p-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-sm font-bold">
                        {c.audience.toLocaleString()}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        members nearby
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.handles.slice(0, 3).map((h) => (
                        <span
                          key={h}
                          className="inline-flex items-center gap-0.5 rounded-full bg-card px-1.5 py-0.5 text-[9px] font-medium"
                        >
                          <Instagram className="h-2.5 w-2.5" />
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Boost stacks on top of tier cashback. A Tec-verified Gold guest gets {tierValues.gold}% +
              community boost.
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Note: community boosts don&apos;t apply to the welcome cashback — first-visit reward stays
              flat for everyone.
            </p>
          </ComingSoonSection>

          {/* ---------- Audience filters (MVP: disabled) ---------- */}
          <ComingSoonSection
            label="Audience filters · soft targeting"
            note="Available after MVP"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Who sees this promo</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Narrow distribution by country, age, or sex using guests&apos; profile data. Internal
                  targeting only — guests never see they were filtered. Use responsibly and within
                  local advertising rules.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                <Lock className="h-3 w-3" />
                Manager-only
              </span>
            </div>

            <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Enable audience filters</span>
              </div>
              <div className="flex h-5 w-9 items-center rounded-full bg-muted px-0.5">
                <div className="h-4 w-4 rounded-full bg-white" />
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Countries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {COUNTRIES.map((c, i) => (
                    <span
                      key={c.code}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium",
                        i < 2
                          ? "border-secondary bg-secondary/15 text-secondary"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      <span className="text-sm leading-none">{c.flag}</span>
                      {c.code}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">2 selected</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Age range
                </p>
                <div className="flex items-end gap-1">
                  <span className="font-display text-3xl font-semibold text-secondary">21</span>
                  <span className="mb-1 text-muted-foreground">–</span>
                  <span className="font-display text-3xl font-semibold text-secondary">35</span>
                  <span className="mb-1.5 ml-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                    years
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Min
                    </p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full w-[6%] rounded-full bg-secondary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Max
                    </p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                      <div className="h-full w-[28%] rounded-full bg-secondary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sex
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["All", "Female", "Male"] as const).map((opt, i) => (
                    <span
                      key={opt}
                      className={cn(
                        "rounded-full border px-2 py-2 text-center text-[11px] font-semibold",
                        i === 0
                          ? "border-secondary bg-secondary/15 text-secondary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Based on the guest&apos;s self-declared profile. Optional field — guests who
                  didn&apos;t share are excluded when not &quot;all&quot;.
                </p>
              </div>
            </div>
          </ComingSoonSection>
        </div>
      </div>
    </>
  );
}

function GuestTypeBadge({ type }: { type: GuestType }) {
  const { Icon, label, classes } = {
    Volume: {
      Icon: Users,
      label: "Volume",
      classes: "bg-muted text-muted-foreground",
    },
    Magnetic: {
      Icon: Zap,
      label: "Magnetic",
      classes: "bg-secondary/15 text-secondary",
    },
    Rich: {
      Icon: Gem,
      label: "Rich",
      classes: "bg-tier-gold/30 text-foreground",
    },
    "Magnetic + Rich": {
      Icon: Zap,
      label: "Magnetic + Rich",
      classes: "bg-pink-gradient text-white",
    },
  }[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        classes,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function ComingSoonSection({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        <span className="inline-flex items-center gap-1 rounded-full bg-tier-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground">
          <Clock className="h-2.5 w-2.5" />
          Coming soon
        </span>
      </p>
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card-soft p-5">
        <div className="pointer-events-none select-none opacity-40" aria-hidden>
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-border bg-card/95 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
            🔒 {note}
          </span>
        </div>
      </div>
    </section>
  );
}
