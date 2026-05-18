import { Search, Bell, Bot } from "lucide-react";
import { AppSwitcher } from "@/components/AppSwitcher";

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

      <div className="hidden lg:block">
        <AppSwitcher />
      </div>

      <div
        className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground opacity-60 md:flex"
        aria-label="Global search (coming soon)"
        title="Search ships once analytics is wired up"
      >
        <Search className="h-4 w-4" />
        <input
          type="text"
          name="topbar-search"
          aria-label="Search"
          placeholder="Search guests, campaigns, transactions…"
          disabled
          className="w-48 bg-transparent text-foreground outline-none placeholder:text-muted-foreground lg:w-64"
        />
        <kbd className="rounded-md border border-border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <button
        type="button"
        aria-label="Notifications (coming soon)"
        title="No notifications yet"
        disabled
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground/60 transition"
      >
        <Bell className="h-4 w-4" />
      </button>

      <button
        type="button"
        aria-label="Ask Copilot (coming soon)"
        title="The Copilot ships after the analytics tables land"
        disabled
        className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-pink-gradient/70 px-3 text-[13px] font-semibold text-white/90 shadow-glow md:px-4"
      >
        <Bot className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Copilot</span>
      </button>
    </header>
  );
}
