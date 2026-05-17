import Image from "next/image";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Instagram,
  Phone,
} from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { KpiCard } from "@/components/manager/KpiCard";
import {
  KPIS,
  VENUE,
  VISITS_BY_DAY,
  FUNNEL,
  RECENT_VISITS,
  UPCOMING_RESERVATIONS,
} from "@/lib/manager-data";
import { tierBadgeClass } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

export default function ManagerDashboardPage() {
  const maxVisits = Math.max(...VISITS_BY_DAY.map((d) => d.count), 1);
  const maxFunnel = FUNNEL[0].value;

  return (
    <>
      <Topbar
        title={`Welcome back, ${VENUE.name}`}
        subtitle={`${VENUE.area} · ${VENUE.city} · this week at a glance`}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KPIS.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Visits this week
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tracking-tight">
                    {VISITS_BY_DAY.reduce((sum, d) => sum + d.count, 0)}
                    <span className="ml-2 text-[12px] font-medium text-secondary">
                      Sat is your strongest day
                    </span>
                  </p>
                </div>
                <select className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium">
                  <option>This week</option>
                  <option>Last week</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              <div className="mt-6 flex h-44 items-end gap-2">
                {VISITS_BY_DAY.map((d) => {
                  const h = (d.count / maxVisits) * 100;
                  const isPeak = d.count === maxVisits;
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={cn(
                            "w-full rounded-xl transition-all",
                            isPeak ? "bg-pink-gradient" : "bg-muted",
                          )}
                          style={{ height: `${Math.max(h, 4)}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-semibold">{d.count}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {d.day}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Discovery → Visit funnel
                </p>
                <span className="text-[11px] font-semibold text-secondary">May</span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {FUNNEL.map((f) => {
                  const pct = (f.value / maxFunnel) * 100;
                  return (
                    <div key={f.stage}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12px] text-foreground">{f.stage}</span>
                        <span className="font-display text-sm font-bold tabular-nums">
                          {f.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-pink-gradient"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Recent visits
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-secondary"
                >
                  See all <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <table className="mt-3 w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 font-medium">Guest</th>
                    <th className="py-2 font-medium">Bill</th>
                    <th className="py-2 font-medium">Cashback</th>
                    <th className="py-2 font-medium">Story</th>
                    <th className="py-2 text-right font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_VISITS.map((v) => (
                    <tr key={v.id} className="border-t border-border text-sm">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase",
                              tierBadgeClass(v.tier),
                            )}
                          >
                            {v.tier}
                          </span>
                          <span className="font-medium">{v.guest}</span>
                        </div>
                      </td>
                      <td className="py-2.5 tabular-nums">MX${v.amount.toLocaleString()}</td>
                      <td className="py-2.5 tabular-nums text-secondary">
                        −MX${v.cashback.toLocaleString()}
                      </td>
                      <td className="py-2.5">
                        {v.story ? (
                          <span className="inline-flex items-center gap-1 text-secondary">
                            <Instagram className="h-3 w-3" />
                            Posted
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">{v.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Upcoming reservations
                </p>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 flex flex-col gap-2.5">
                {UPCOMING_RESERVATIONS.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase",
                        tierBadgeClass(r.tier),
                      )}
                    >
                      {r.tier[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.guest}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {r.party} guests · {r.when}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        r.status === "confirmed"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-tier-gold/30 text-foreground",
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-peacock p-5 text-white shadow-glow lg:col-span-2">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] opacity-80">
                <Sparkles className="h-3.5 w-3.5" />
                AI Copilot
              </div>
              <p className="mt-2 font-display text-2xl font-semibold leading-tight">
                Your Thursdays are warming up — push a +5% Diamond boost?
              </p>
              <p className="mt-2 text-[13px] opacity-85">
                Diamond visits jumped 41% on Thursdays this month. A targeted boost would likely
                lock that pattern in before competitors react.
              </p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-foreground">
                  Open in Copilot
                </button>
                <button className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[13px] font-semibold">
                  Dismiss
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Need help?
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <a
                  href="tel:+528112345678"
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"
                >
                  <Phone className="h-4 w-4 text-secondary" />
                  Your success lead: Mariana M.
                </a>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left"
                >
                  <Image
                    src={VENUE.photos[0]}
                    alt="Setup"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-md object-cover"
                  />
                  <span>Refresh cover photos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
