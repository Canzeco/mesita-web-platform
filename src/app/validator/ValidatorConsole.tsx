"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  Loader2,
  Check,
  ScanLine,
  CircleDollarSign,
  Receipt,
  RotateCw,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  apiCreateTicket,
  apiFetchVenueTickets,
  apiMarkTicketPaid,
  formatCurrency,
  type VenueTicket,
} from "@/lib/api/tickets";
import { cn } from "@/lib/utils";

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";

type VenueOption = { id: string; name: string; cashback_percent: number | null };

export function ValidatorConsole({
  venues,
  activeVenueId,
}: {
  venues: VenueOption[];
  activeVenueId: string;
}) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [venueId, setVenueId] = useState(activeVenueId);
  const active = venues.find((v) => v.id === venueId) ?? venues[0];

  const [tickets, setTickets] = useState<VenueTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  // Bumped after each mutation so the load effect re-runs.
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Loads tickets on first mount, on venue change, and on every reload bump.
  // All setState lives inside the async IIFE so it never runs synchronously
  // inside the effect body (React 19's lint rule).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingTickets(true);
      setTicketsError(null);
      try {
        const rows = await apiFetchVenueTickets(supabase, venueId, 30);
        if (!cancelled) setTickets(rows);
      } catch (err) {
        if (!cancelled) {
          setTicketsError(err instanceof Error ? err.message : "Couldn't load tickets.");
        }
      } finally {
        if (!cancelled) setLoadingTickets(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, venueId, reloadKey]);

  return (
    <div className="flex flex-col gap-6">
      {venues.length > 1 && (
        <VenueSwitcher venues={venues} active={venueId} onChange={setVenueId} />
      )}

      <NewTicketCard
        supabase={supabase}
        venue={active}
        onCreated={() => void reload()}
      />

      <section className="rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">Recent tickets</h3>
            <p className="text-[11px] text-muted-foreground">
              Last 30 at {active.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            aria-label="Reload"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
          >
            <RotateCw className={cn("h-3.5 w-3.5", loadingTickets && "animate-spin")} />
          </button>
        </header>
        {ticketsError ? (
          <p className="px-4 py-6 text-sm text-destructive">{ticketsError}</p>
        ) : tickets.length === 0 && !loadingTickets ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No tickets yet. Open one above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {tickets.map((t) => (
              <TicketRow key={t.id} ticket={t} supabase={supabase} onChanged={() => void reload()} />
            ))}
            {loadingTickets && tickets.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function VenueSwitcher({
  venues,
  active,
  onChange,
}: {
  venues: VenueOption[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="-mx-1 flex flex-wrap gap-2">
      {venues.map((v) => {
        const on = v.id === active;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              on
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {v.name}
          </button>
        );
      })}
    </nav>
  );
}

function NewTicketCard({
  supabase,
  venue,
  onCreated,
}: {
  supabase: ReturnType<typeof createBrowserSupabase>;
  venue: VenueOption;
  onCreated: () => void;
}) {
  const [guestCode, setGuestCode] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [tip, setTip] = useState("");
  const [pending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const subtotalNum = Number(subtotal || "0");
  const tipNum = Number(tip || "0");
  const total = Number.isFinite(subtotalNum) && Number.isFinite(tipNum) ? subtotalNum + tipNum : 0;
  const cashback = Math.floor((total * (venue.cashback_percent ?? 0)) / 100);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const code = guestCode.trim().toUpperCase();
    if (code.length < 4) {
      setError("Enter the guest's 6-character code.");
      return;
    }
    if (!Number.isFinite(subtotalNum) || subtotalNum <= 0) {
      setError("Check subtotal must be a positive number (whole pesos).");
      return;
    }
    if (!Number.isFinite(tipNum) || tipNum < 0) {
      setError("Tip must be 0 or a positive number.");
      return;
    }

    startSubmit(async () => {
      try {
        const res = await apiCreateTicket(supabase, {
          venueId: venue.id,
          guestCode: code,
          // Whole pesos in the UI; cents in the API.
          checkSubtotalCents: Math.round(subtotalNum * 100),
          tipCents: Math.round(tipNum * 100),
        });
        setSuccessMsg(
          `Ticket opened for ${res.guest.full_name ?? res.guest.code}. ${formatCurrency(res.ticket.cashback_cents)} cashback pending.`,
        );
        setGuestCode("");
        setSubtotal("");
        setTip("");
        onCreated();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't open ticket.");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Open a ticket</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Scan or type the guest&apos;s 6-character code, enter the check, and mark paid when
            the guest&apos;s payment lands.
          </p>
        </div>
        <span className="rounded-full bg-pink-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          {venue.cashback_percent ?? 0}% cashback
        </span>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Guest code" hint="6 characters. Letters + numbers, from the guest's QR screen.">
          <div className="relative">
            <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={guestCode}
              onChange={(e) => setGuestCode(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={10}
              className={cn(INPUT, "pl-10 tracking-[0.2em] uppercase")}
              placeholder="MES123"
              disabled={pending}
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Check subtotal" hint="Whole pesos.">
            <input
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              className={INPUT}
              placeholder="500"
              disabled={pending}
            />
          </Field>
          <Field label="Tip" hint="Optional.">
            <input
              value={tip}
              onChange={(e) => setTip(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              className={INPUT}
              placeholder="50"
              disabled={pending}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-3 text-xs">
          <Stat label="Check total" value={formatCurrency(Math.round(total * 100))} />
          <Stat label="Cashback to guest" value={formatCurrency(cashback * 100)} />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
        )}
        {successMsg && (
          <p className="rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">{successMsg}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pink-gradient text-sm font-semibold text-white shadow-glow disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening…
            </>
          ) : (
            <>
              <CircleDollarSign className="h-4 w-4" />
              Open ticket
            </>
          )}
        </button>
      </form>
    </section>
  );
}

function TicketRow({
  ticket,
  supabase,
  onChanged,
}: {
  ticket: VenueTicket;
  supabase: ReturnType<typeof createBrowserSupabase>;
  onChanged: () => void;
}) {
  const [pending, startAction] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const markPaid = () => {
    setError(null);
    startAction(async () => {
      try {
        await apiMarkTicketPaid(supabase, ticket.id);
        onChanged();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't mark paid.");
      }
    });
  };

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="truncate text-sm font-semibold">
            {ticket.guest?.full_name ?? ticket.guest?.code ?? "Unknown guest"}
          </p>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            {ticket.guest?.code}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {formatCurrency(ticket.total_cents)} · {ticket.cashback_percent}%
          cashback → {formatCurrency(ticket.cashback_cents)}
          {" · "}
          {new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:ml-3">
        <StatusPill status={ticket.status} />
        {ticket.status === "pending_pay" && (
          <button
            type="button"
            onClick={markPaid}
            disabled={pending}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[11px] font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Mark paid
          </button>
        )}
      </div>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-2 py-1 text-[11px] text-destructive sm:ml-3">
          {error}
        </p>
      )}
    </li>
  );
}

function StatusPill({ status }: { status: VenueTicket["status"] }) {
  const styles: Record<VenueTicket["status"], string> = {
    open: "bg-muted text-muted-foreground",
    pending_pay: "bg-yellow-500/95 text-black",
    paid: "bg-green-500/95 text-white",
    cancelled: "bg-foreground/75 text-background",
  };
  const labels: Record<VenueTicket["status"], string> = {
    open: "Draft",
    pending_pay: "Pending",
    paid: "Paid",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-display text-base font-semibold tabular-nums">{value}</p>
    </div>
  );
}

