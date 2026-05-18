"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  Loader2,
  Check,
  ScanLine,
  CircleDollarSign,
  Receipt,
  RotateCw,
  Wallet,
  X,
  Percent,
  Instagram,
  Calendar,
  Sparkles,
  AlertTriangle,
  ImageIcon,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  apiCancelTicket,
  apiCreateTicket,
  apiFetchVenueTickets,
  apiLookupGuest,
  apiMarkTicketPaid,
  apiVerifyStory,
  formatCurrency,
  KIND_LABEL,
  ticketIsFormal,
  ticketRequiresStory,
  ticketHasReservation,
  type CreateTicketInput,
  type FiscalType,
  type TicketKind,
  type VenueTicket,
} from "@/lib/api/tickets";
import { cn } from "@/lib/utils";

// ── Local types ────────────────────────────────────────────────────────

type GuestPreview = {
  id: string;
  code: string;
  full_name: string | null;
  cashback_balance_cents: number;
};

type VenueOption = {
  id: string;
  name: string;
  cashback_percent: number | null;
  fiscal_type: FiscalType;
};

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";

// Sanitise a decimal input: strip non-numerics, collapse multiple decimal
// points to the first one, cap fractional to two digits.
function sanitiseAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  const intPart = cleaned.slice(0, firstDot);
  const fracPart = cleaned.slice(firstDot + 1).replace(/\./g, "");
  return `${intPart}.${fracPart.slice(0, 2)}`;
}

// Two kind menus per fiscal type — the validator picks among the four
// actionable kinds (None is "no transaction", so we never show it as a
// pickable option).
const FORMAL_KIND_OPTIONS: { value: TicketKind; label: string; hint: string }[] = [
  { value: "p_c", label: "Payment → Cashback", hint: "Just pay; cashback lands after." },
  { value: "s_p_sf_c", label: "Story → Payment → Cashback", hint: "Story-tagged before paying, verified after." },
  { value: "r_p_c", label: "Reservation → Payment → Cashback", hint: "Came in with a Mesita reservation." },
  { value: "r_s_p_sf_c", label: "Reservation → Story → Payment → Cashback", hint: "Reserved + story + pay." },
];
const INFORMAL_KIND_OPTIONS: { value: TicketKind; label: string; hint: string }[] = [
  { value: "dp", label: "Discounted payment", hint: "Discount revealed, cash settles off-rail." },
  { value: "s_dp_sf", label: "Story → Discounted payment", hint: "Story required (verified post-checkout)." },
  { value: "r_dp", label: "Reservation → Discounted payment", hint: "Came in with a reservation." },
  { value: "r_s_dp_sf", label: "Reservation → Story → Discounted payment", hint: "Reservation + story + cash discount." },
];

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

  // Stories awaiting waiter verification: anything submitted by the guest
  // or kicked back by the AI on tickets that need post-payment confirmation.
  // The 'submitted' / 'ai_rejected' filter already excludes the terminal
  // waiter_verified / waiter_rejected states.
  const storyQueue = useMemo(
    () =>
      tickets.filter(
        (t) =>
          ticketRequiresStory(t.kind) &&
          (t.story_status === "submitted" || t.story_status === "ai_rejected"),
      ),
    [tickets],
  );

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

      {storyQueue.length > 0 && (
        <StoryQueueCard
          tickets={storyQueue}
          supabase={supabase}
          onChanged={() => void reload()}
        />
      )}

      <section className="rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">Recent tickets</h3>
            <p className="text-[11px] text-muted-foreground">
              Last 30 at {active.name} · {active.fiscal_type === "formal" ? "cashback" : "discount"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            aria-label="Reload tickets"
            disabled={loadingTickets}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:opacity-60"
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
              <TicketRow
                key={t.id}
                ticket={t}
                supabase={supabase}
                onChanged={() => void reload()}
              />
            ))}
            {loadingTickets && tickets.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Loading…
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

// ── Venue switcher ─────────────────────────────────────────────────────

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

// ── New ticket card (branches by fiscal_type) ──────────────────────────

function NewTicketCard({
  supabase,
  venue,
  onCreated,
}: {
  supabase: ReturnType<typeof createBrowserSupabase>;
  venue: VenueOption;
  onCreated: () => void;
}) {
  const isFormal = venue.fiscal_type === "formal";
  const kindOptions = isFormal ? FORMAL_KIND_OPTIONS : INFORMAL_KIND_OPTIONS;
  const [kind, setKind] = useState<TicketKind>(kindOptions[0].value);

  // If the venue switches under us (formal ↔ informal) the previously
  // selected kind may no longer be valid. Detect that during render and
  // schedule a microtask reset — keeps the React 19 set-state-in-effect
  // lint happy and avoids a synchronous render-time write.
  if (!kindOptions.some((o) => o.value === kind)) {
    void Promise.resolve().then(() => setKind(kindOptions[0].value));
  }

  const requiresStory = ticketRequiresStory(kind);
  const hasReservation = ticketHasReservation(kind);

  const [guestCode, setGuestCode] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [tip, setTip] = useState("");
  const [redeem, setRedeem] = useState("");
  const [pending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [guest, setGuest] = useState<GuestPreview | null>(null);
  const [guestLookupError, setGuestLookupError] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const lookupSeq = useRef(0);

  useEffect(() => {
    const code = guestCode.trim().toUpperCase();
    const seq = ++lookupSeq.current;
    if (code.length < 4) {
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
  const total =
    Number.isFinite(subtotalNum) && Number.isFinite(tipNum)
      ? subtotalNum + tipNum
      : 0;
  const ratePercent = venue.cashback_percent ?? 0;
  const cashback = isFormal ? Math.floor((total * ratePercent) / 100) : 0;
  const discount = !isFormal ? Math.floor((total * ratePercent) / 100) : 0;

  const guestBalancePesos = guest ? guest.cashback_balance_cents / 100 : 0;
  const maxRedeem = isFormal ? Math.min(guestBalancePesos, Math.max(0, total)) : 0;
  const redeemRequestedNum = Number(redeem || "0");
  const redeemValid =
    Number.isFinite(redeemRequestedNum) && redeemRequestedNum >= 0;
  const redeemTooHigh = redeemRequestedNum > maxRedeem + 0.001;
  const effectiveRedeem =
    isFormal && redeemValid && !redeemTooHigh ? redeemRequestedNum : 0;
  const guestPays = isFormal
    ? Math.max(0, total - effectiveRedeem)
    : Math.max(0, total - discount);

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
    if (isFormal) {
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
    }

    startSubmit(async () => {
      try {
        const body: CreateTicketInput = {
          venueId: venue.id,
          guestCode: code,
          kind,
          checkSubtotalCents: Math.round(subtotalNum * 100),
          tipCents: Math.round(tipNum * 100),
          ...(isFormal
            ? { redeemCents: Math.round(effectiveRedeem * 100) }
            : {}),
        };
        const res = await apiCreateTicket(supabase, body);
        const earnLine = isFormal
          ? `${formatCurrency(res.ticket.cashback_cents)} cashback pending`
          : `${formatCurrency(res.ticket.discount_cents)} discount applied`;
        const redeemLine =
          isFormal && res.ticket.redeem_cents
            ? ` · ${formatCurrency(res.ticket.redeem_cents)} redeem applied`
            : "";
        const storyLine = requiresStory
          ? " · story still needed"
          : "";
        setSuccessMsg(
          `${res.guest.full_name ?? res.guest.code}: ${earnLine}${redeemLine}${storyLine}.`,
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
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Open a ticket
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isFormal
              ? "Cashback flow — payment runs through Mesita."
              : "Discount flow — discount is revealed to you, the bill settles in cash."}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm",
            isFormal
              ? "bg-pink-gradient text-white"
              : "bg-tier-gold text-black",
          )}
          title={isFormal ? "Formal venue — cashback" : "Informal venue — instant discount"}
        >
          {isFormal ? `${ratePercent}% cashback` : `${ratePercent}% discount`}
        </span>
      </div>

      {isFormal && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-medium text-destructive">
          <AlertTriangle className="h-3 w-3" />
          Cashback only lands if the guest pays by card via Mesita. Cash at the
          table = no cashback.
        </p>
      )}
      {hasReservation && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-medium text-secondary">
          <Calendar className="h-3 w-3" />
          Reservation flow — guest arrived with a Mesita booking.
        </p>
      )}
      {requiresStory && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-gradient/15 px-3 py-1 text-[11px] font-medium text-foreground">
          <Instagram className="h-3 w-3" />
          Story required — guest must post an IG story tagging the venue.
        </p>
      )}
      {!isFormal && requiresStory && (
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-medium text-destructive">
          <AlertTriangle className="h-3 w-3" />
          Discount applies BEFORE story is verified — no reversal if story fails.
        </p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Ticket kind">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as TicketKind)}
            className={INPUT}
            disabled={pending}
          >
            {kindOptions.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-muted-foreground/80">
            {kindOptions.find((k) => k.value === kind)?.hint}
          </span>
        </Field>

        <Field
          label="Guest code"
          hint="6 characters. Letters + numbers, from the guest's QR screen."
        >
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
            showBalance={isFormal}
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

        {isFormal && (
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
        )}

        <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-background p-3 text-xs">
          <Stat label="Check total" value={formatCurrency(Math.round(total * 100))} />
          <Stat
            label="Guest pays"
            value={formatCurrency(Math.round(guestPays * 100))}
          />
          <Stat
            label={isFormal ? "Earns" : "Discount"}
            value={formatCurrency(Math.round((isFormal ? cashback : discount) * 100))}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {successMsg && (
          <p className="rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
            {successMsg}
          </p>
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
          ) : isFormal ? (
            <>
              <CircleDollarSign className="h-4 w-4" />
              Open ticket
            </>
          ) : (
            <>
              <Percent className="h-4 w-4" />
              Reveal discount
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
  showBalance,
}: {
  guest: GuestPreview | null;
  loading: boolean;
  error: string | null;
  visible: boolean;
  showBalance: boolean;
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
      {showBalance && (
        <>
          <span className="text-muted-foreground">·</span>
          <span>{formatCurrency(guest.cashback_balance_cents)} available</span>
        </>
      )}
    </p>
  );
}

// ── Story verification queue ────────────────────────────────────────────

function StoryQueueCard({
  tickets,
  supabase,
  onChanged,
}: {
  tickets: VenueTicket[];
  supabase: ReturnType<typeof createBrowserSupabase>;
  onChanged: () => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="flex items-center gap-1.5 font-display text-base font-semibold tracking-tight">
            <Instagram className="h-4 w-4 text-secondary" />
            Stories to verify
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
              {tickets.length}
            </span>
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Confirm the screenshot tagged your venue. Approve releases the
            cashback (formal). Reject sticks it in the rejected pile.
          </p>
        </div>
      </header>
      <ul className="divide-y divide-border">
        {tickets.map((t) => (
          <StoryQueueRow
            key={t.id}
            ticket={t}
            supabase={supabase}
            onChanged={onChanged}
          />
        ))}
      </ul>
    </section>
  );
}

function StoryQueueRow({
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
  const isFormal = ticketIsFormal(ticket.kind);
  const informalVulnerable =
    !isFormal && ticket.story_status === "submitted";

  const decide = (decision: "approve" | "reject") => {
    setError(null);
    startAction(async () => {
      try {
        await apiVerifyStory(supabase, { ticketId: ticket.id, decision });
        onChanged();
      } catch (err) {
        setError(err instanceof Error ? err.message : `Couldn't ${decision}.`);
      }
    });
  };

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-3">
        {ticket.story_screenshot_url ? (
          <a
            href={ticket.story_screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block h-14 w-14 overflow-hidden rounded-xl border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticket.story_screenshot_url}
              alt={`Story screenshot from ${ticket.guest?.full_name ?? ticket.guest?.code ?? "guest"}`}
              className="h-full w-full object-cover"
            />
          </a>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {ticket.guest?.full_name ?? ticket.guest?.code ?? "Unknown guest"}{" "}
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            {ticket.guest?.code}
          </span>
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {KIND_LABEL[ticket.kind]} ·{" "}
          {ticket.story_status === "ai_rejected"
            ? "AI couldn't confirm the tag"
            : "Screenshot submitted"}
        </p>
        {informalVulnerable && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-destructive">
            <AlertTriangle className="h-3 w-3" /> Discount already applied —
            rejection is informational only.
          </p>
        )}
        {error && (
          <p className="mt-1 rounded-lg bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => decide("approve")}
          disabled={pending}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-secondary px-3 text-[11px] font-semibold text-secondary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ShieldCheck className="h-3 w-3" />
          )}
          Approve
        </button>
        <button
          type="button"
          onClick={() => decide("reject")}
          disabled={pending}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] font-semibold text-muted-foreground transition hover:text-destructive disabled:opacity-60"
        >
          <ShieldX className="h-3 w-3" />
          Reject
        </button>
      </div>
    </li>
  );
}

// ── Recent tickets row ─────────────────────────────────────────────────

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
  const isFormal = ticketIsFormal(ticket.kind);

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

  // Build the secondary line. Discount tickets show "discount applied" not
  // cashback. Formal tickets still show cashback + redeem.
  const moneyLine = isFormal
    ? (() => {
        const redeem =
          ticket.redeem_cents && ticket.redeem_cents > 0
            ? ` · ${formatCurrency(ticket.redeem_cents)} redeem`
            : "";
        return `${formatCurrency(ticket.total_cents)} · ${ticket.cashback_percent}% cashback → ${formatCurrency(ticket.cashback_cents)}${redeem}`;
      })()
    : `${formatCurrency(ticket.total_cents)} · ${ticket.discount_percent ?? 0}% discount → ${formatCurrency(ticket.discount_cents)}`;

  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="truncate text-sm font-semibold">
            {ticket.guest?.full_name ?? ticket.guest?.code ?? "Unknown guest"}
          </p>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            {ticket.guest?.code}
          </span>
          <KindBadge kind={ticket.kind} />
          {ticket.story_status !== "not_required" && (
            <StoryStatusBadge status={ticket.story_status} />
          )}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {moneyLine}
          {" · "}
          {new Date(ticket.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:ml-3">
        <StatusPill status={ticket.status} />
        {/* Formal: pending_pay → Mark paid + Cancel */}
        {isFormal && ticket.status === "pending_pay" && !confirmCancel && (
          <>
            <button
              type="button"
              onClick={markPaid}
              disabled={pendingAction}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[11px] font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {pendingAction ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
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
        {isFormal && ticket.status === "pending_pay" && confirmCancel && (
          <>
            <span className="text-[11px] text-muted-foreground">Cancel?</span>
            <button
              type="button"
              onClick={cancel}
              disabled={pendingAction}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-destructive px-3 text-[11px] font-semibold text-destructive-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {pendingAction ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Yes, cancel"
              )}
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
        {/* Informal: revealed status is terminal from the validator's view. */}
        {!isFormal && ticket.status === "revealed" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-tier-gold/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            <Sparkles className="h-3 w-3" />
            Cash settles off-rail
          </span>
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

function KindBadge({ kind }: { kind: TicketKind }) {
  // Compact glyph version: R / S / P / C / D / SF flags.
  const flags: string[] = [];
  if (kind.startsWith("r_")) flags.push("R");
  if (kind.includes("s_") && kind !== "p_c" && kind !== "r_p_c" && kind !== "dp" && kind !== "r_dp") {
    flags.push("S");
  }
  if (kind === "dp" || kind.endsWith("_dp") || kind.endsWith("_dp_sf")) flags.push("DP");
  else flags.push("P");
  if (kind.endsWith("_c")) flags.push("C");
  return (
    <span
      title={KIND_LABEL[kind]}
      className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-foreground"
    >
      {flags.join("+")}
    </span>
  );
}

function StoryStatusBadge({ status }: { status: VenueTicket["story_status"] }) {
  const styles: Record<VenueTicket["story_status"], string> = {
    not_required: "",
    pending: "bg-muted text-muted-foreground",
    submitted: "bg-secondary/15 text-secondary",
    ai_verified: "bg-primary/10 text-primary",
    ai_rejected: "bg-yellow-500/25 text-black",
    waiter_verified: "bg-primary/10 text-primary",
    waiter_rejected: "bg-destructive/10 text-destructive",
  };
  const labels: Record<VenueTicket["story_status"], string> = {
    not_required: "",
    pending: "Story · pending",
    submitted: "Story · submitted",
    ai_verified: "Story · verified",
    ai_rejected: "Story · needs you",
    waiter_verified: "Story · verified",
    waiter_rejected: "Story · rejected",
  };
  if (!labels[status]) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        styles[status],
      )}
    >
      <Instagram className="h-2.5 w-2.5" />
      {labels[status]}
    </span>
  );
}

function StatusPill({ status }: { status: VenueTicket["status"] }) {
  const styles: Record<VenueTicket["status"], string> = {
    open: "bg-muted text-muted-foreground",
    pending_pay: "bg-yellow-500/95 text-black",
    awaiting_story: "bg-secondary/95 text-secondary-foreground",
    paid: "bg-green-500/95 text-white",
    revealed: "bg-tier-gold/80 text-black",
    cancelled: "bg-foreground/75 text-background",
  };
  const labels: Record<VenueTicket["status"], string> = {
    open: "Draft",
    pending_pay: "Pending",
    awaiting_story: "Awaiting story",
    paid: "Paid",
    revealed: "Revealed",
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
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] text-muted-foreground/80">
          {hint}
        </span>
      )}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-display text-base font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}
