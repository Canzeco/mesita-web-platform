import { CircleDollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

// Coupon rate displayed on cards / modal headers / promo previews.
// The colour scales with the four canonical rates (5 / 10 / 20 / 50). Any
// rate inside a band picks up that band's tone, so a 7% lands in the 5–9
// range with the lowest-saturation pill.
//
// Mechanic decides the label suffix: "cashback" on formal venues,
// "discount" on informal venues. Same component, two readings.

export type Mechanic = "cashback" | "discount";

export function RatePill({
  percent,
  mechanic,
  size = "sm",
  className,
}: {
  percent: number;
  mechanic: Mechanic;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const tone = toneForPercent(percent);
  const Icon = mechanic === "cashback" ? CircleDollarSign : Percent;
  const sizing = {
    xs: "px-1.5 py-0.5 text-[9px] gap-0.5",
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-[11px] gap-1.5",
  }[size];
  const label = mechanic === "cashback" ? "cashback" : "discount";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wider shadow-sm",
        tone,
        sizing,
        className,
      )}
    >
      <Icon className={size === "md" ? "h-3 w-3" : "h-2.5 w-2.5"} />
      {percent}% {label}
    </span>
  );
}

// 5% / 10% / 20% / 50% are Mesita's canonical rungs. Anything below 5 picks
// the muted tone; anything above 50 picks the maxed-out gradient. Bands sit
// between the rungs so a 7% still reads as the 5% tier visually.
function toneForPercent(p: number): string {
  if (p <= 0) return "bg-muted text-muted-foreground";
  if (p < 10) return "bg-secondary/30 text-foreground";
  if (p < 20) return "bg-secondary/60 text-secondary-foreground";
  if (p < 50) return "bg-pink-gradient text-white";
  return "bg-pink-gradient text-white shadow-glow";
}
