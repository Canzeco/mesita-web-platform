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

      <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground md:flex">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Search guests, campaigns, transactions…"
          className="w-48 bg-transparent text-foreground outline-none placeholder:text-muted-foreground lg:w-64"
        />
        <kbd className="rounded-md border border-border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary ring-2 ring-card" />
      </button>

      <button
        type="button"
        aria-label="Ask Copilot"
        className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-pink-gradient px-3 text-[13px] font-semibold text-white shadow-glow md:px-4"
      >
        <Bot className="h-4 w-4" />
        <span className="hidden sm:inline">Ask Copilot</span>
      </button>
    </header>
  );
}
