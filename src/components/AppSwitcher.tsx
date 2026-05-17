"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle, Store, ScanLine, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const APPS = [
  { href: "/guest/onboard", match: "/guest", label: "Guest", Icon: UserCircle },
  { href: "/manager", match: "/manager", label: "Manager", Icon: Store },
  { href: "/validator", match: "/validator", label: "Validator", Icon: ScanLine },
  { href: "/admin", match: "/admin", label: "Admin", Icon: Shield },
];

export function AppSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-border bg-card/80 p-1 text-[11px] shadow-sm backdrop-blur",
        className,
      )}
    >
      {APPS.map(({ href, match, label, Icon }) => {
        const active = pathname.startsWith(match);
        return (
          <Link
            key={match}
            href={href}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 font-medium transition",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
