// Minimal manager topbar: just the page title + optional subtitle.
// Everything else (AppSwitcher, global search, notifications, Copilot)
// was either disabled placeholder UI or surface clutter — removed until
// real implementations exist.
export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 pl-14 backdrop-blur md:gap-4 md:px-6 md:pl-6">
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-base font-semibold leading-tight tracking-tight md:text-xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground md:text-[12px]">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
