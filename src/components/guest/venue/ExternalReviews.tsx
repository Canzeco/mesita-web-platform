import { SectionLabel } from "./SectionLabel";
import type { ExternalReview } from "@/lib/guest-data";

const SOURCE_META: Record<
  ExternalReview["source"],
  { label: string; icon: React.ReactNode }
> = {
  google: {
    label: "Google",
    icon: (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, oklch(0.62 0.22 22), oklch(0.86 0.16 88), oklch(0.55 0.18 145), oklch(0.55 0.15 250), oklch(0.62 0.22 22))",
        }}
        aria-hidden
      >
        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-card text-[8px] font-bold text-foreground">
          G
        </span>
      </span>
    ),
  },
  uber: {
    label: "Uber",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[oklch(0.45_0.18_145)] text-[8px] font-bold text-white">
        U
      </span>
    ),
  },
  facebook: {
    label: "Facebook",
    icon: (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[oklch(0.50_0.18_250)] text-[8px] font-bold text-white">
        f
      </span>
    ),
  },
  instagram: {
    label: "Instagram",
    icon: (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-md text-[8px] font-bold text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.70 0.20 30), oklch(0.65 0.22 0), oklch(0.55 0.18 320))",
        }}
        aria-hidden
      >
        IG
      </span>
    ),
  },
};

export function ExternalReviews({ items }: { items: ExternalReview[] }) {
  return (
    <section>
      <SectionLabel title="External reviews" />
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map((r) => {
          const meta = SOURCE_META[r.source];
          return (
            <div key={r.source} className="rounded-2xl border border-border bg-card p-2.5">
              <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                {meta.icon}
                {meta.label}
              </div>
              <p className="mt-1.5 font-display text-xl font-bold leading-none tracking-tight">
                {r.value}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{r.meta}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
