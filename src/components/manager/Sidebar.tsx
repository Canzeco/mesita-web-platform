"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Sparkles,
  BarChart3,
  Wallet,
  Users,
  Bot,
  ChevronDown,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VENUE } from "@/lib/manager-data";

const NAV = [
  { href: "/manager", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/manager/place", label: "Place", Icon: Store },
  { href: "/manager/promos", label: "Promos", Icon: Sparkles },
  { href: "/manager/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/manager/wallet", label: "Wallet", Icon: Wallet },
  { href: "/manager/team", label: "Team", Icon: Users },
  { href: "/manager/copilot", label: "AI Copilot", Icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-peacock text-base shadow-glow">
            🦚
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">mesita.</span>
        </Link>

        <button
          type="button"
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-left transition hover:bg-muted"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/15 text-sm">
              🌲
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-tight">
                {VENUE.name}
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-secondary">
                Verified Partner
              </span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-secondary/10 text-secondary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-2 py-3">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LifeBuoy className="h-4 w-4" />
          Help & docs
        </Link>
      </div>
    </aside>
  );
}
