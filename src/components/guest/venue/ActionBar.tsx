import { Ticket, Calendar } from "lucide-react";

export function ActionBar({
  hasCoupon,
  hasReserve = true,
}: {
  hasCoupon: boolean;
  hasReserve?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-3 pt-6">
      <div className="pointer-events-auto flex items-stretch gap-2">
        {hasCoupon && (
          <button
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-secondary/40 bg-card px-3 py-2.5 text-[12px] font-semibold text-secondary shadow-elev transition hover:bg-secondary/5"
          >
            <Ticket className="h-4 w-4" />
            Save Coupon
          </button>
        )}
        {hasCoupon && hasReserve ? (
          <button
            type="button"
            className="flex flex-[1.4] flex-col items-center justify-center gap-0.5 rounded-full bg-pink-gradient px-3 py-2.5 text-[12px] font-bold text-white shadow-glow ring-1 ring-white/40"
          >
            <div className="flex items-center gap-1">
              <Ticket className="h-4 w-4" />
              <span className="text-[10px]">+</span>
              <Calendar className="h-4 w-4" />
            </div>
            Save + Reserve
          </button>
        ) : (
          <button
            type="button"
            className="flex flex-[1.4] flex-col items-center justify-center gap-0.5 rounded-full bg-pink-gradient px-3 py-2.5 text-[12px] font-bold text-white shadow-glow ring-1 ring-white/40"
          >
            {hasCoupon ? (
              <>
                <Ticket className="h-4 w-4" />
                Save Coupon
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Reserve
              </>
            )}
          </button>
        )}
        {hasReserve && (
          <button
            type="button"
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-foreground/15 bg-foreground px-3 py-2.5 text-[12px] font-semibold text-background shadow-elev transition hover:opacity-90"
          >
            <Calendar className="h-4 w-4" />
            Reserve
          </button>
        )}
      </div>
    </div>
  );
}
