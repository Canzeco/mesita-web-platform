import { MapPin } from "lucide-react";
import { SectionLabel } from "./SectionLabel";

export function LocationBlock({
  name,
  distanceKm,
}: {
  name: string;
  distanceKm: number;
}) {
  return (
    <section>
      <SectionLabel
        title="Location"
        trailing={
          <span className="inline-flex items-center gap-1 font-semibold text-secondary">
            <MapPin className="h-3 w-3" />
            {distanceKm} km
          </span>
        }
      />
      <div className="relative mt-3 h-44 overflow-hidden rounded-2xl border border-border bg-[oklch(0.97_0.012_15)]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="oklch(0.88 0.020 10)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          <path
            d="M-20,80 C80,40 160,90 240,75 C320,60 380,100 420,80"
            stroke="oklch(0.78 0.16 80)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M-20,150 C80,140 160,170 240,160 C320,150 380,180 420,170"
            stroke="oklch(0.70 0.18 260)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            opacity="0.45"
          />
          <circle cx="120" cy="80" r="22" fill="oklch(0.82 0.10 80 / 0.4)" />
          <circle cx="270" cy="135" r="28" fill="oklch(0.78 0.10 260 / 0.4)" />
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-sm">
            <MapPin className="h-3 w-3" />
            {name}
          </span>
        </div>
        <span
          className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-4 ring-card"
          style={{
            background: "linear-gradient(135deg, oklch(0.84 0.16 88), oklch(0.72 0.16 60))",
          }}
        >
          <span className="block h-2 w-2 rounded-full bg-foreground" />
        </span>

        <button
          type="button"
          className="absolute bottom-3 right-3 rounded-full bg-card px-3 py-1.5 text-[12px] font-semibold shadow-sm"
        >
          Open in Maps
        </button>
      </div>
    </section>
  );
}
