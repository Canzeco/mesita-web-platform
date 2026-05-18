"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check, Wallet, Sparkles, ChevronDown } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  type GuestProfile,
  type GuestTicket,
} from "@/lib/api/tickets";

export function MyQrClient({
  profile,
  tickets,
}: {
  profile: GuestProfile;
  tickets: GuestTicket[];
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            Your code
          </p>
        </div>
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="rounded-2xl border border-border bg-background p-4">
            <QRCodeSVG
              value={`mesita:${profile.code}`}
              size={184}
              bgColor="transparent"
              fgColor="currentColor"
              level="M"
              marginSize={0}
            />
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-base font-bold tracking-[0.2em] tabular-nums text-foreground transition hover:bg-muted"
          >
            {profile.code}
            {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            Show this to the waiter when you ask for the check.<br />
            They&apos;ll scan it or type the code into their console.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-pink-gradient p-4 text-white shadow-glow">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
            Cashback balance
          </p>
          <p className="mt-0.5 font-display text-2xl font-semibold tabular-nums">
            {formatCurrency(profile.cashback_balance_cents)}
          </p>
        </div>
        <Wallet className="h-7 w-7 text-white/80" />
      </section>

      <RecentTickets tickets={tickets} />
    </div>
  );
}

function RecentTickets({ tickets }: { tickets: GuestTicket[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tickets : tickets.slice(0, 3);
  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h3 className="font-display text-base font-semibold tracking-tight">Recent visits</h3>
        {tickets.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground"
          >
            {expanded ? "Show less" : `Show all (${tickets.length})`}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
      </header>
      {tickets.length === 0 ? (
        <p className="px-4 pb-5 pt-1 text-center text-[12px] text-muted-foreground">
          Your visits will land here once a partner scans your code.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((t) => (
            <TicketRow key={t.id} ticket={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TicketRow({ ticket }: { ticket: GuestTicket }) {
  const venue = ticket.venue;
  const redeemed = ticket.redeem_cents ?? 0;
  const earned = ticket.cashback_cents ?? 0;
  const statusLabel =
    ticket.status === "paid"
      ? "Settled"
      : ticket.status === "pending_pay"
        ? "Awaiting"
        : ticket.status === "cancelled"
          ? "Cancelled"
          : ticket.status;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
        {venue?.photos?.[0] ? (
          <Image
            src={venue.photos[0]}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">
            {venue?.name?.[0]?.toUpperCase() ?? "·"}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{venue?.name ?? "Unknown venue"}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {formatCurrency(ticket.total_cents)} ·{" "}
          {new Date(ticket.created_at).toLocaleDateString([], { day: "numeric", month: "short" })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
          +{formatCurrency(earned)}
        </p>
        {redeemed > 0 && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
            −{formatCurrency(redeemed)}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">{statusLabel}</p>
      </div>
    </li>
  );
}
