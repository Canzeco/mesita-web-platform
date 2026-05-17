import { Clock } from "lucide-react";
import { SectionLabel } from "./SectionLabel";
import type { VenueHour, Weekday } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

export function HoursBlock({
  hours,
  today,
  closesAt,
}: {
  hours: VenueHour[];
  today: Weekday;
  closesAt: string;
}) {
  return (
    <section>
      <SectionLabel
        title="Hours"
        icon={<Clock className="h-3.5 w-3.5" />}
        trailing={
          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
            Open · closes {closesAt}
          </span>
        }
      />
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {hours.map((h) => {
          const isToday = h.day === today;
          return (
            <div
              key={h.day}
              className={cn(
                "flex items-center justify-between px-4 py-3 text-sm",
                isToday && "bg-secondary/10",
              )}
            >
              <span className={cn("font-medium", isToday && "font-bold text-secondary")}>
                {h.label}
                {isToday && <span className="ml-1 text-secondary"> · Today</span>}
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  isToday ? "font-bold text-foreground" : "text-muted-foreground",
                )}
              >
                {h.range}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
