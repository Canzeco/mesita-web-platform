import { Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Venue badge that distinguishes Verified Partners (signed up at
// manager.mesita.app, configured a coupon mechanic) from Web-Listed
// venues (scraped from Google Business, no dashboard, no coupons).
export type ListingType = "partner" | "web";

export function PartnerBadge({
  listingType,
  size = "sm",
  className,
}: {
  listingType: ListingType;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const isPartner = listingType === "partner";
  const sizing = {
    xs: "px-1.5 py-0.5 text-[9px] gap-0.5",
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-[11px] gap-1.5",
  }[size];
  const iconSize = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  return (
    <span
      title={isPartner ? "Verified Partner — runs the coupon mechanic" : "Web-Listed — auto-sourced from Google, no coupon"}
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wider shadow-sm",
        isPartner
          ? "bg-tier-gold/95 text-black"
          : "bg-card/95 text-foreground border border-border",
        sizing,
        className,
      )}
    >
      {isPartner ? <Sparkles className={iconSize} /> : <Globe className={iconSize} />}
      {isPartner ? "Verified" : "Web"}
    </span>
  );
}
