import { Crown, Sparkles, Award, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

// Guest class — the four-tier ladder. Bronze is the default, Silver/Gold
// scale on either Instagram follower count or lifetime Mesita spend, Diamond
// is invite-only or manual appeal.
export type Tier = "bronze" | "silver" | "gold" | "diamond";

const TIER_STYLE: Record<Tier, { tone: string; Icon: typeof Crown }> = {
  bronze: { tone: "bg-tier-bronze/90 text-white", Icon: Medal },
  silver: { tone: "bg-tier-silver text-foreground", Icon: Award },
  gold: { tone: "bg-tier-gold text-black", Icon: Sparkles },
  diamond: { tone: "bg-tier-diamond text-white", Icon: Crown },
};

const TIER_LABEL: Record<Tier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  diamond: "Diamond",
};

export function TierBadge({
  tier,
  size = "sm",
  className,
}: {
  tier: Tier;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const meta = TIER_STYLE[tier];
  const Icon = meta.Icon;
  const sizing = {
    xs: "px-1.5 py-0.5 text-[9px] gap-0.5",
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-[11px] gap-1.5",
  }[size];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wider shadow-sm",
        meta.tone,
        sizing,
        className,
      )}
    >
      <Icon className={size === "md" ? "h-3 w-3" : "h-2.5 w-2.5"} />
      {TIER_LABEL[tier]}
    </span>
  );
}
