"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { MAP_PINS } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Tonight", "Cashback", "Rooftop", "Brunch", "Late night", "Dinner"];

export default function MapPage() {
  const [filter, setFilter] = useState("All");

  return (
    <div className="relative flex h-full flex-col">
      <div className="px-3 pt-2 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-[12px] font-medium transition",
                f === filter
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-3 mb-3 flex-1 overflow-hidden rounded-2xl border border-border bg-[oklch(0.22_0.03_180)]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.30_0.04_180)_1px,transparent_1px),linear-gradient(90deg,oklch(0.30_0.04_180)_1px,transparent_1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {MAP_PINS.map((p) => (
          <Link
            key={p.id}
            href={`/guest/venue/${p.id}`}
            className="absolute flex flex-col items-center"
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -100%)" }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-md">
              {p.emoji}
            </span>
            {p.cashback != null && (
              <span className="-mt-2 rounded-full bg-tier-gold px-2 py-0.5 text-[10px] font-bold text-black shadow-sm">
                {p.cashback}%
              </span>
            )}
          </Link>
        ))}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/95 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
          {MAP_PINS.length} places · {filter}
        </div>
      </div>
    </div>
  );
}
