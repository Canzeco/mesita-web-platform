import { FileText, ChevronRight } from "lucide-react";
import { SectionLabel } from "./SectionLabel";

export function MenuCard({ pages, updated }: { pages: number; updated: string }) {
  return (
    <section>
      <SectionLabel title="Menu" />
      <button
        type="button"
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:bg-muted/40"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground text-background">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold tracking-tight">View menu</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            PDF · {pages} pages · updated {updated}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </section>
  );
}
