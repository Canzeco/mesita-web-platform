"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Megaphone,
  BarChart3,
  Wallet,
  Users,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Check,
  Plus,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UNITS, CURRENT_MANAGER, type Unit } from "@/lib/manager-data";
import { CreateUnitDialog } from "./CreateUnitDialog";

const NAV = [
  { href: "/manager", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/manager/place", label: "Place", Icon: Store },
  { href: "/manager/promos", label: "Promos", Icon: Megaphone },
  { href: "/manager/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/manager/wallet", label: "Wallet", Icon: Wallet },
  { href: "/manager/team", label: "Team", Icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const [unitId, setUnitId] = useState(UNITS[0].id);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const unit = UNITS.find((u) => u.id === unitId) ?? UNITS[0];

  return (
    <>
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="border-b border-border px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peacock text-base shadow-glow">
              🦚
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">mesita.</span>
          </Link>
        </div>

        <div className="px-3 pt-3">
          <UnitTrigger unit={unit} open={open} onToggle={() => setOpen((o) => !o)} />
          {open && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card">
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setUnitId(u.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-muted/40",
                    u.id === unitId && "bg-secondary/5",
                  )}
                >
                  <UnitAvatar emoji={u.emoji} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">{u.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {u.city} · {u.area}
                    </p>
                  </div>
                  {u.id === unitId && <Check className="h-4 w-4 shrink-0 text-secondary" />}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setCreateOpen(true);
                }}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm font-semibold text-secondary transition hover:bg-secondary/5"
              >
                <Plus className="h-4 w-4" />
                Add new unit
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
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

        <div className="space-y-2 border-t border-border p-3">
          <Link
            href="/manager/copilot"
            className="block rounded-2xl border border-border bg-background p-3 transition hover:bg-muted/40"
          >
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
              <Sparkles className="h-3 w-3" />
              AI Copilot
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-foreground">
              Generate your next campaign in 1 click.
            </p>
          </Link>

          <div className="border-t border-border pt-2">
            <SidebarLink Icon={Settings} label="Settings" href="#" />
            <SidebarLink Icon={LifeBuoy} label="Help & docs" href="#" />
          </div>

          <Link
            href="#"
            className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-muted/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-gradient text-sm font-bold text-white">
              {CURRENT_MANAGER.name[0].toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{CURRENT_MANAGER.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {CURRENT_MANAGER.role} · {CURRENT_MANAGER.email}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </aside>

      {createOpen && <CreateUnitDialog onClose={() => setCreateOpen(false)} />}
    </>
  );
}

function SidebarLink({
  Icon,
  label,
  href,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function UnitTrigger({
  unit,
  open,
  onToggle,
}: {
  unit: Unit;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5 text-left transition hover:bg-muted/40"
    >
      <UnitAvatar emoji={unit.emoji} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-semibold leading-tight tracking-tight">
          {unit.name}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {unit.city} · {unit.area}
        </p>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
          open && "rotate-180",
        )}
      />
    </button>
  );
}

function UnitAvatar({ emoji }: { emoji: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-gradient text-lg shadow-sm">
      {emoji}
    </span>
  );
}
