"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame, GraduationCap, Instagram } from "lucide-react";
import { SectionLabel } from "./SectionLabel";
import { tierBadgeClass } from "@/lib/guest-data";
import type { VenueVisitor } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

const FILTERS = ["Top", "Recent", "Highest rated", "Most followed", "Gold tier"];

export function VisitorsRow({ visitors }: { visitors: VenueVisitor[] }) {
  const [filter, setFilter] = useState("Top");
  return (
    <section>
      <SectionLabel
        title="Mesita visitors"
        trailing={
          <span className="inline-flex items-center gap-1 font-semibold text-secondary">
            <Flame className="h-3 w-3" />
            Top 10
          </span>
        }
      />
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition",
              filter === f
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
        <span className="mx-1 h-5 w-px shrink-0 bg-border" />
        <button
          type="button"
          className="shrink-0 rounded-full bg-pink-gradient px-3 py-1 text-[12px] font-semibold text-white shadow-sm"
        >
          All
        </button>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {visitors.map((v) => (
          <div
            key={v.handle}
            className="w-[260px] shrink-0 rounded-2xl border border-border bg-card p-3"
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image src={v.avatar} alt={v.name} fill sizes="48px" className="object-cover" />
                </div>
                <span
                  className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase",
                    tierBadgeClass(v.tier),
                  )}
                >
                  {v.tier}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold leading-tight tracking-tight">
                  {v.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{v.handle}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-secondary">
                  <Instagram className="h-3 w-3" />
                  {v.followers}
                </p>
                {v.community && (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[oklch(0.30_0.15_260)] px-2 py-0.5 text-[10px] font-semibold text-white">
                    <GraduationCap className="h-3 w-3" />
                    {v.community}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-[12px] italic leading-snug text-foreground">
              &ldquo;{v.quote}&rdquo;
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5 rounded-xl bg-muted/40 p-1.5">
              {[
                { l: "Food", v: v.ratings.food },
                { l: "Service", v: v.ratings.service },
                { l: "Atm.", v: v.ratings.atm },
                { l: "Value", v: v.ratings.value },
              ].map((m) => (
                <div key={m.l} className="text-center">
                  <p className="text-[9px] text-muted-foreground">{m.l}</p>
                  <p className="font-display text-sm font-bold leading-none">{m.v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
