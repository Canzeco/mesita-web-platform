"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { SectionLabel } from "./SectionLabel";
import type { Weekday } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

const DAY_LABELS: { id: Weekday; label: string }[] = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const HOUR_TICKS = ["7a", "11a", "3p", "7p", "10p"];

export function PopularTimesBlock({
  data,
  defaultDay,
}: {
  data: { day: Weekday; note: string; bars: number[] }[];
  defaultDay: Weekday;
}) {
  const [day, setDay] = useState<Weekday>(defaultDay);
  const current = data.find((d) => d.day === day) ?? data[0];
  const maxBar = Math.max(...current.bars, 1);
  return (
    <section>
      <SectionLabel
        title="Popular times"
        trailing={<span>1–3 hrs typical visit</span>}
      />
      <div className="mt-3 rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {DAY_LABELS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDay(d.id)}
              className={cn(
                "rounded-full px-2 py-1 transition",
                day === d.id ? "bg-foreground text-background" : "hover:text-foreground",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        <p className="mt-3 inline-flex items-center gap-2 text-[12px]">
          <Users className="h-3.5 w-3.5 text-secondary" />
          <span className="font-semibold text-secondary">10p:</span>
          <span className="text-foreground">{current.note}</span>
        </p>

        <div className="mt-3 flex h-16 items-end gap-1">
          {current.bars.map((b, i) => {
            const pct = (b / maxBar) * 100;
            const isPeak = i === current.bars.length - 3;
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-md transition-all",
                  isPeak ? "bg-pink-gradient" : "bg-muted",
                )}
                style={{ height: `${Math.max(pct, 6)}%` }}
              />
            );
          })}
        </div>

        <div className="mt-1 flex justify-between text-[10px] font-medium text-muted-foreground">
          {HOUR_TICKS.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
