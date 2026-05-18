"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  Wallet,
  Sparkles,
  ChevronDown,
  Instagram,
  AlertTriangle,
  Loader2,
  Upload,
  Calendar,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  apiSubmitStory,
  formatCurrency,
  ticketHasReservation,
  ticketIsFormal,
  ticketRequiresStory,
  workflowSteps,
  type GuestProfile,
  type GuestTicket,
  type WorkflowStep,
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

  // The "active" ticket is the most recent non-terminal one. It surfaces
  // its step timeline at the top of the page so the guest sees exactly
  // where the flow is. If everything is terminal, we don't pin one.
  const activeTicket = useMemo(() => {
    return (
      tickets.find(
        (t) =>
          t.status === "pending_pay" ||
          t.status === "awaiting_story" ||
          t.status === "revealed" ||
          (t.status === "paid" &&
            ticketRequiresStory(t.kind) &&
            (t.story_status === "pending" ||
              t.story_status === "submitted" ||
              t.story_status === "ai_rejected")),
      ) ?? null
    );
  }, [tickets]);

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
            aria-label={copied ? "Code copied" : "Copy code"}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-base font-bold tracking-[0.2em] tabular-nums text-foreground transition hover:bg-muted"
          >
            {profile.code}
            {copied ? (
              <Check className="h-3.5 w-3.5 text-secondary" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
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

      {activeTicket && (
        <ActiveTicketCard ticket={activeTicket} />
      )}

      <RecentTickets tickets={tickets} />
    </div>
  );
}

// ─── Active ticket: timeline + story upload affordance ───────────────────

function ActiveTicketCard({ ticket }: { ticket: GuestTicket }) {
  const steps = useMemo(() => workflowSteps(ticket), [ticket]);
  const isFormal = ticketIsFormal(ticket.kind);
  const requiresStory = ticketRequiresStory(ticket.kind);
  const hasReservation = ticketHasReservation(ticket.kind);
  const venue = ticket.venue;

  // The story upload affordance shows when:
  //   - the kind requires a story
  //   - the story isn't already verified
  //   - the story isn't terminally rejected
  const showStoryUpload =
    requiresStory &&
    ticket.story_status !== "ai_verified" &&
    ticket.story_status !== "waiter_verified" &&
    ticket.story_status !== "waiter_rejected";

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            Active ticket
          </p>
          <h3 className="mt-0.5 truncate font-display text-base font-semibold tracking-tight">
            {venue?.name ?? "Venue"}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isFormal ? "Cashback flow" : "Discount flow"}
            {hasReservation && " · Reservation"}
            {requiresStory && " · Story required"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {hasReservation && <Calendar className="h-3.5 w-3.5 text-secondary" />}
          {requiresStory && <Instagram className="h-3.5 w-3.5 text-secondary" />}
        </div>
      </header>

      <ol className="flex flex-col gap-0 px-4 py-3">
        {steps.map((s, i) => (
          <StepItem key={s.id} step={s} isLast={i === steps.length - 1} />
        ))}
      </ol>

      {showStoryUpload && (
        <div className="border-t border-border px-4 py-3">
          <StoryUpload ticketId={ticket.id} status={ticket.story_status} />
        </div>
      )}

      {!isFormal && ticket.story_status === "waiter_rejected" && (
        <div className="border-t border-border bg-destructive/5 px-4 py-3">
          <p className="inline-flex items-start gap-1.5 text-[11px] text-destructive">
            <AlertTriangle className="mt-0.5 h-3 w-3" />
            Story rejected. The discount was already applied at the bill — this
            is informational only.
          </p>
        </div>
      )}
    </section>
  );
}

function StepItem({ step, isLast }: { step: WorkflowStep; isLast: boolean }) {
  return (
    <li className="relative flex gap-3 pb-4">
      {!isLast && (
        <span
          aria-hidden
          className={cn(
            "absolute left-3 top-7 bottom-0 w-px",
            step.done ? "bg-primary" : "bg-border",
          )}
        />
      )}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          step.done && "bg-primary text-white",
          step.current && "bg-primary text-white ring-4 ring-primary/15",
          !step.done && !step.current && "bg-muted text-muted-foreground",
        )}
      >
        {step.done ? <Check className="h-3 w-3" strokeWidth={3} /> : ""}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] font-semibold leading-tight",
            step.done && "text-muted-foreground line-through",
          )}
        >
          {step.title}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[11px] leading-snug text-muted-foreground",
            step.done && "line-through",
          )}
        >
          {step.sub}
        </p>
      </div>
    </li>
  );
}

function StoryUpload({
  ticketId,
  status,
}: {
  ticketId: string;
  status: GuestTicket["story_status"];
}) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a public URL to your story screenshot.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await apiSubmitStory(supabase, { ticketId, screenshotUrl: trimmed });
      setUrl("");
      // The page is a server component above us — refresh to pull the new
      // status. (window.location.reload keeps us in this surface without
      // needing useRouter.)
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit story.");
    } finally {
      setPending(false);
    }
  };

  const banner =
    status === "submitted"
      ? "We're checking your story now. Re-upload if you got the wrong one."
      : status === "ai_rejected"
        ? "Our auto-check couldn't see the tag. Re-upload, or the waiter will confirm at the table."
        : "Post your story tagging the venue, then drop the screenshot URL here.";

  return (
    <div className="flex flex-col gap-2">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-secondary">
        <Instagram className="h-3 w-3" />
        Story screenshot
      </p>
      <p className="text-[11px] text-muted-foreground">{banner}</p>
      <div className="flex items-stretch gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          type="url"
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          disabled={pending}
          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/40"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={pending}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-pink-gradient px-3 text-[12px] font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Submit
        </button>
      </div>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Recent visits list ──────────────────────────────────────────────────

function RecentTickets({ tickets }: { tickets: GuestTicket[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? tickets : tickets.slice(0, 3);
  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Recent visits
        </h3>
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
            <RecentRow key={t.id} ticket={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentRow({ ticket }: { ticket: GuestTicket }) {
  const venue = ticket.venue;
  const isFormal = ticketIsFormal(ticket.kind);
  const earned = ticket.cashback_cents ?? 0;
  const redeemed = ticket.redeem_cents ?? 0;
  const discount = ticket.discount_cents ?? 0;
  const statusLabel =
    ticket.status === "paid"
      ? "Settled"
      : ticket.status === "pending_pay"
        ? "Awaiting payment"
        : ticket.status === "awaiting_story"
          ? "Awaiting story"
          : ticket.status === "revealed"
            ? "Discount applied"
            : ticket.status === "cancelled"
              ? "Cancelled"
              : ticket.status;
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
        {venue?.photos?.[0] ? (
          <Image
            src={venue.photos[0]}
            alt={venue.name ?? "Venue"}
            width={40}
            height={40}
            className="h-10 w-10 object-cover"
          />
        ) : (
          <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {venue?.name ?? "Unknown venue"}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {formatCurrency(ticket.total_cents)} ·{" "}
          {new Date(ticket.created_at).toLocaleDateString([], {
            day: "numeric",
            month: "short",
          })}
        </p>
      </div>
      <div className="text-right">
        {isFormal ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              +{formatCurrency(earned)}
            </p>
            {redeemed > 0 && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                −{formatCurrency(redeemed)}
              </p>
            )}
          </>
        ) : (
          <p className="text-[10px] font-bold uppercase tracking-wider text-tier-gold">
            −{formatCurrency(discount)}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">{statusLabel}</p>
      </div>
    </li>
  );
}
