import { Sparkles } from "lucide-react";
import { SectionLabel } from "./SectionLabel";

export function CouponCard({
  percent,
  title,
  sub,
  status,
}: {
  percent: number;
  title: string;
  sub: string;
  status: "active" | "expired";
}) {
  return (
    <section>
      <SectionLabel
        title="Cashback coupon"
        trailing={
          <span className="font-semibold text-secondary">
            {status === "active" ? "Active" : "Expired"}
          </span>
        }
      />
      <div className="mt-3 flex items-start gap-3 rounded-2xl border border-border bg-[linear-gradient(135deg,oklch(0.97_0.018_10),oklch(0.95_0.030_5))] p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-secondary shadow-sm">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold leading-tight tracking-tight">
            {title}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{sub}</p>
          <span className="mt-2 inline-flex items-center rounded-full bg-pink-gradient px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {percent}% Cashback
          </span>
        </div>
      </div>
    </section>
  );
}
