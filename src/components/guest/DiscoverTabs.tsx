"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LayoutGrid, Map as MapIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/guest/discover/swipe", label: "Swipe", Icon: Flame },
  { href: "/guest/discover/catalog", label: "Catalog", Icon: LayoutGrid },
  { href: "/guest/discover/map", label: "Map", Icon: MapIcon },
  { href: "/guest/discover/ai", label: "AI", Icon: Sparkles },
];

export function DiscoverTabs() {
  const pathname = usePathname();
  return (
    <div className="px-3 pt-2 pb-1">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 shadow-sm backdrop-blur">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-[12px] font-medium transition",
                active
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
