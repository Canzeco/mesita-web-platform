import { Search, Bell, Bot } from "lucide-react";
import { AppSwitcher } from "@/components/AppSwitcher";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="hidden lg:block">
        <AppSwitcher />
      </div>

      <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <input
          type="text"
          placeholder="Search guests, campaigns, transactions…"
          className="w-64 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded-md border border-border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary ring-2 ring-card" />
      </button>

      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-full bg-pink-gradient px-4 text-[13px] font-semibold text-white shadow-glow"
      >
        <Bot className="h-4 w-4" />
        Ask Copilot
      </button>

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
        IS
      </div>
    </header>
  );
}
