"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = ["Monterrey", "CDMX", "Guadalajara", "Miami", "New York", "Madrid", "Barcelona", "Tokyo"];
const DATES = ["Tonight", "Tomorrow", "Thu May 14", "Fri May 15", "Sat May 16", "Sun May 17"];
const TIMES = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"];

function formatTimeShort(t: string) {
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/i);
  if (!m) return t;
  const [, h, mm, mer] = m;
  return mm && mm !== "00" ? `${h}:${mm}${mer}` : `${h}${mer}`;
}

export function DiscoverHeader() {
  const [open, setOpen] = useState<null | "city" | "when">(null);
  const [city, setCity] = useState("Monterrey");
  const [whenDate, setWhenDate] = useState("Tonight");
  const [whenTime, setWhenTime] = useState("8:00 PM");

  return (
    <div className="border-b border-border/60 px-3 pb-2.5 pt-2">
      <div className="flex items-center gap-2">
        <Link
          href="/guest/profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-peacock text-lg shadow-glow"
          aria-label="Profile"
        >
          🦚
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full border border-border bg-card/70 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => setOpen(open === "city" ? null : "city")}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-3 py-1.5 text-left transition",
              open === "city" ? "bg-muted" : "hover:bg-muted/50",
            )}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
            <div className="min-w-0 flex-1">
              <div className="text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80 leading-none">
                Where
              </div>
              <div className="mt-0.5 truncate font-display text-[13px] font-semibold leading-none text-foreground">
                {city}
              </div>
            </div>
          </button>
          <div className="h-6 w-px bg-border/70" />
          <button
            type="button"
            onClick={() => setOpen(open === "when" ? null : "when")}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-3 py-1.5 text-left transition",
              open === "when" ? "bg-muted" : "hover:bg-muted/50",
            )}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0 text-secondary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80 leading-none">
                  When
                </span>
                <span className="truncate font-display text-[10px] font-semibold leading-none text-muted-foreground/70">
                  {formatTimeShort(whenTime)}
                </span>
              </div>
              <div className="mt-0.5 truncate font-display text-[13px] font-semibold leading-none text-foreground">
                {whenDate}
              </div>
            </div>
          </button>
        </div>
        <Link
          href="/guest/qr"
          aria-label="My QR"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
        >
          <span className="text-base">⌑</span>
        </Link>
      </div>

      {open === "city" && (
        <div className="mt-2 max-h-44 overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-md scrollbar-hide">
          {CITIES.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                setCity(opt);
                setOpen(null);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] transition hover:bg-muted/60",
                opt === city ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              <span>{opt}</span>
              {opt === city && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}

      {open === "when" && (
        <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-card p-2 shadow-md">
          <div>
            <div className="px-1 pb-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Date
            </div>
            <div className="max-h-40 space-y-0.5 overflow-y-auto pr-0.5 scrollbar-hide">
              {DATES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setWhenDate(d)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[12px] transition hover:bg-muted/60",
                    d === whenDate ? "bg-muted font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>{d}</span>
                  {d === whenDate && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="px-1 pb-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Time
            </div>
            <div className="max-h-40 space-y-0.5 overflow-y-auto pr-0.5 scrollbar-hide">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWhenTime(t)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[12px] transition hover:bg-muted/60",
                    t === whenTime ? "bg-muted font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span>{t}</span>
                  {t === whenTime && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
