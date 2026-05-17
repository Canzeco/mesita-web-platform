import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  trend,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  spark?: number[];
}) {
  const points = spark ?? [0.2, 0.4, 0.35, 0.6, 0.55, 0.8, 0.9];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold leading-none tracking-tight">{value}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            trend === "up" ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive",
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta}
        </span>
        <svg viewBox="0 0 100 30" className="h-7 w-24 text-secondary">
          <polyline
            points={points
              .map((p, i) => `${(i / (points.length - 1)) * 100},${30 - p * 28}`)
              .join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
