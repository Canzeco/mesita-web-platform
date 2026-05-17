import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function CashbackPill({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-pink-gradient px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm",
        className,
      )}
    >
      {percent}% cashback
    </span>
  );
}

export function PartnerPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur",
        className,
      )}
    >
      <BadgeCheck className="h-3 w-3 text-primary" />
      Partner
    </span>
  );
}
