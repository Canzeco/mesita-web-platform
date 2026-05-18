import { CircleDollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

// Venue fiscal type — pins the coupon mechanic. Formal venues run cashback
// (Mesita on the payment rail); informal venues run instant discounts
// (Mesita off the rail). Visible on manager surfaces; not exposed to the
// guest.

export type FiscalType = "formal" | "informal";

export function FiscalBadge({
  fiscalType,
  size = "sm",
  className,
}: {
  fiscalType: FiscalType;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const isFormal = fiscalType === "formal";
  const sizing = {
    xs: "px-1.5 py-0.5 text-[9px] gap-0.5",
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-[11px] gap-1.5",
  }[size];
  const iconSize = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wider shadow-sm",
        isFormal ? "bg-pink-gradient text-white" : "bg-tier-gold text-black",
        sizing,
        className,
      )}
      title={
        isFormal
          ? "Formal — cashback via Stripe + Mesita wallet"
          : "Informal — instant discount at the bill, cash settles off-rail"
      }
    >
      {isFormal ? <CircleDollarSign className={iconSize} /> : <Percent className={iconSize} />}
      {isFormal ? "Formal" : "Informal"}
    </span>
  );
}
