"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Loader2,
  Check,
  ScanLine,
  CircleDollarSign,
  Receipt,
  RotateCw,
  Wallet,
  X,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  apiCancelTicket,
  apiCreateTicket,
  apiFetchVenueTickets,
  apiLookupGuest,
  apiMarkTicketPaid,
  formatCurrency,
  type VenueTicket,
} from "@/lib/api/tickets";
import { cn } from "@/lib/utils";

type GuestPreview = {
  id: string;
  code: string;
  full_name: string | null;
  cashback_balance_cents: number;
};

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";

// Sanitise a decimal input: strip non-numerics, collapse multiple decimal points
// to the first one, and cap the fractional part to two digits. Keeps trailing
// "." or "1." while typing so the user can keep editing.
function sanitiseAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  const intPart = cleaned.slice(0, firstDot);
  const fracPart = cleaned.slice(firstDot + 1).replace(/\./g, "");
  return `${intPart}.${fracPart.slice(0, 2)}`;
}

type VenueOption = { id: string; name: string; cashback_percent: number | null };

export function ValidatorConsole({
  venues,
  activeVenueId,
  initialTickets,
}: {
  venues: VenueOption[];
  activeVenueId: string;
  initialTickets: VenueTicket[];
}) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [venueId, setVenueId] = useState(activeVenueId);
  const active = venues.find((v) => v.id === venueId) ?? venues[0];

  // Tickets start populated from the server-rendered unit-overview, then we
  // re-fetch only on venue switch or after mutating actions. No mount-time
  // round-trip.
  const [tickets, setTickets] = useState<VenueTicket[]>(initialTickets);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [loadedVenueId, setLoadedVenueId] = useState<string>(activeVenueId);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Re-fetch when the active venue changes or a mutation bumps reloadKey.
  // Skip the very first mount (server already gave us tickets for the
  // initial venue) by comparing loadedVenueId.
  useEffect(() => {
    if (reloadKey === 0 && venueId === loadedVenueId) return;
    let cancelled = false;
    void (async () => {
      setLoadingTickets(true);
      setTicketsError(null);
      try {
        const rows = await apiFetchVenueTickets(supabase, venueId, 30);
        if (!cancelled) {
          setTickets(rows);
          setLoadedVenueId(venueId);
        }
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
  }, [supabase, venueId, reloadKey, loadedVenueId]);

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
  const [redeem, setRedeem] = useState("");
  const [pending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Guest lookup state — populated by a debounced call to manager-lookup-guest
  // whenever the code reaches at least 4 chars. The chip beside the input
  // shows name + balance so the validator knows who they're charging.
  const [guest, setGuest] = useState<GuestPreview | null>(null);
  const [guestLookupError, setGuestLookupError] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const lookupSeq = useRef(0);

  useEffect(() => {
    const code = guestCode.trim().toUpperCase();
    const seq = ++lookupSeq.current;
    if (code.length < 4) {
      // Defer the reset to a microtask so React isn't asked to re-render
      // synchronously from inside the effect body. Same pattern as the
      // lookup branch below — keeps the set-state-in-effect lint happy.
      void Promise.resolve().then(() => {
        if (seq !== lookupSeq.current) return;
        setGuest(null);
        setGuestLookupError(null);
        setGuestLoading(false);
      });
      return;
    }
    const handle = window.setTimeout(() => {
      void (async () => {
        setGuestLoading(true);
        try {
          const g = await apiLookupGuest(supabase, code);
          if (seq !== lookupSeq.current) return;
          setGuest(g);
          setGuestLookupError(null);
        } catch (err) {
          if (seq !== lookupSeq.current) return;
          setGuest(null);
          setGuestLookupError(err instanceof Error ? err.message : "Lookup failed.");
        } finally {
          if (seq === lookupSeq.current) setGuestLoading(false);
        }
      })();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [guestCode, supabase]);

  const subtotalNum = Number(subtotal || "0");
  const tipNum = Number(tip || "0");
  const total = Number.isFinite(subtotalNum) && Number.isFinite(tipNum) ? subtotalNum + tipNum : 0;
  const cashback = Math.floor((total * (venue.cashback_percent ?? 0)) / 100);

  // Redeem is capped to min(guest balance, check total). Keep the cap in pesos
  // to match what the user types; convert to cents on submit.
  const guestBalancePesos = guest ? guest.cashback_balance_cents / 100 : 0;
  const maxRedeem = Math.min(guestBalancePesos, Math.max(0, total));
  const redeemRequestedNum = Number(redeem || "0");
  const redeemValid = Number.isFinite(redeemRequestedNum) && redeemRequestedNum >= 0;
  const redeemTooHigh = redeemRequestedNum > maxRedeem + 0.001;
  const effectiveRedeem = redeemValid && !redeemTooHigh ? redeemRequestedNum : 0;
  const guestPays = Math.max(0, total - effectiveRedeem);

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
    if (!redeemValid) {
      setError("Redeem must be 0 or a positive number.");
      return;
    }
    if (redeemTooHigh) {
      setError(
        guest
          ? `Redeem can't exceed the guest's balance (${formatCurrency(guest.cashback_balance_cents)}) or the check total.`
          : "Redeem exceeds the check total.",
      );
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
          redeemCents: Math.round(effectiveRedeem * 100),
        });
        const earnedLine = `${formatCurrency(res.ticket.cashback_cents)} cashback pending`;
        const redeemLine = res.ticket.redeem_cents
          ? ` · ${formatCurrency(res.ticket.redeem_cents)} redeem applied`
          : "";
        setSuccessMsg(
          `Ticket opened for ${res.guest.full_name ?? res.guest.code}. ${earnedLine}${redeemLine}.`,
        );
        setGuestCode("");
        setSubtotal("");
        setTip("");
        setRedeem("");
        setGuest(null);
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
          <GuestPreviewChip
            guest={guest}
            loading={guestLoading}
            error={guestLookupError}
            visible={guestCode.trim().length >= 4}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Check subtotal" hint="Whole pesos.">
            <input
              value={subtotal}
              onChange={(e) => setSubtotal(sanitiseAmount(e.target.value))}
              inputMode="decimal"
              className={INPUT}
              placeholder="500"
              disabled={pending}
            />
          </Field>
          <Field label="Tip" hint="Optional.">
            <input
              value={tip}
              onChange={(e) => setTip(sanitiseAmount(e.target.value))}
              inputMode="decimal"
              className={INPUT}
              placeholder="50"
              disabled={pending}
            />
          </Field>
        </div>

        <Field
          label="Redeem cashback"
          hint={
            guest
              ? `Up to ${formatCurrency(guest.cashback_balance_cents)} available — uses guest balance to lower what they pay.`
              : "Available once the guest is matched."
          }
        >
          <div className="flex items-stretch gap-2">
            <input
              value={redeem}
              onChange={(e) => setRedeem(sanitiseAmount(e.target.value))}
              inputMode="decimal"
              className={INPUT}
              placeholder="0"
              disabled={pending || !guest || maxRedeem <= 0}
            />
            <button
              type="button"
              onClick={() => {
                if (!guest || maxRedeem <= 0) return;
                setRedeem(String(Math.floor(maxRedeem)));
              }}
              disabled={pending || !guest || maxRedeem <= 0}
              className="rounded-xl border border-border bg-background px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              Max
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-background p-3 text-xs">
          <Stat label="Check total" value={formatCurrency(Math.round(total * 100))} />
          <Stat label="Guest pays" value={formatCurrency(Math.round(guestPays * 100))} />
          <Stat label="Earns" value={formatCurrency(cashback * 100)} />
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

function GuestPreviewChip({
  guest,
  loading,
  error,
  visible,
}: {
  guest: GuestPreview | null;
  loading: boolean;
  error: string | null;
  visible: boolean;
}) {
  if (!visible) return null;
  if (loading) {
    return (
      <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Looking up…
      </p>
    );
  }
  if (error) {
    return (
      <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-[11px] text-destructive">
        {error}
      </p>
    );
  }
  if (!guest) return null;
  return (
    <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-medium text-secondary">
      <Wallet className="h-3 w-3" />
      <span className="text-foreground">{guest.full_name ?? guest.code}</span>
      <span className="text-muted-foreground">·</span>
      <span>{formatCurrency(guest.cashback_balance_cents)} available</span>
    </p>
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
  const [pendingAction, startAction] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

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

  const cancel = () => {
    setError(null);
    startAction(async () => {
      try {
        await apiCancelTicket(supabase, ticket.id, "validator-cancel");
        onChanged();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't cancel.");
      }
    });
  };

  const redeemLine =
    ticket.redeem_cents && ticket.redeem_cents > 0
      ? ` · ${formatCurrency(ticket.redeem_cents)} redeem`
      : "";

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
          {redeemLine}
          {" · "}
          {new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:ml-3">
        <StatusPill status={ticket.status} />
        {ticket.status === "pending_pay" && !confirmCancel && (
          <>
            <button
              type="button"
              onClick={markPaid}
              disabled={pendingAction}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[11px] font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {pendingAction ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Mark paid
            </button>
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              disabled={pendingAction}
              aria-label="Cancel ticket"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-destructive disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
        {ticket.status === "pending_pay" && confirmCancel && (
          <>
            <span className="text-[11px] text-muted-foreground">Cancel?</span>
            <button
              type="button"
              onClick={cancel}
              disabled={pendingAction}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-destructive px-3 text-[11px] font-semibold text-destructive-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {pendingAction ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes, cancel"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmCancel(false)}
              disabled={pendingAction}
              className="inline-flex h-8 items-center rounded-full border border-border bg-background px-3 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
            >
              Keep
            </button>
          </>
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

