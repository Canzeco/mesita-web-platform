// Frontend API surface for ticket / cashback Edge Functions.
//
// Same constraints as api/venues.ts: clients call exactly one Edge Function
// per helper; helpers never compose multiple Edge Functions.

import type { SupabaseClient } from "@supabase/supabase-js";

export type GuestProfile = {
  id: string;
  code: string;
  full_name: string | null;
  phone: string | null;
  cashback_balance_cents: number;
};

export type GuestOnboardingInput = {
  full_name: string;
  sex: "male" | "female" | "other";
  birthday: string; // YYYY-MM-DD
  country: string;
  phone: string;
};

export type GuestFullProfile = GuestProfile & {
  sex: string | null;
  birthday: string | null;
  country: string | null;
};

type UpdateGuestProfileRes =
  | { ok: true; guest: GuestFullProfile }
  | { ok: false; error: string; code?: string };

export async function apiUpdateGuestProfile(
  client: SupabaseClient,
  input: GuestOnboardingInput,
): Promise<GuestFullProfile> {
  const { data, error } = await client.functions.invoke<UpdateGuestProfileRes>(
    "guest-update-profile",
    { body: input },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "guest-update-profile failed");
  return data.guest;
}

export type TicketStatus = "open" | "pending_pay" | "paid" | "cancelled";

export type Ticket = {
  id: string;
  status: TicketStatus;
  check_subtotal_cents: number | null;
  tip_cents: number | null;
  total_cents: number | null;
  cashback_percent: number;
  cashback_cents: number | null;
  redeem_cents: number | null;
  currency: string;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
  cancel_reason?: string | null;
};

export type GuestTicket = Ticket & {
  venue: { id: string; name: string; slug: string; photos: string[] } | null;
};

export type VenueTicket = Ticket & {
  guest: { id: string; code: string; full_name: string | null } | null;
};

type GuestProfileRes = { ok: true; guest: GuestProfile } | { ok: false; error: string };
type MyTicketsRes = { ok: true; tickets: GuestTicket[] } | { ok: false; error: string };
type VenueTicketsRes = { ok: true; tickets: VenueTicket[] } | { ok: false; error: string };
type CreateTicketRes =
  | {
      ok: true;
      ticket: Ticket;
      venue: { id: string; name: string };
      guest: { id: string; code: string; full_name: string | null };
    }
  | { ok: false; error: string };
type MarkPaidRes =
  | {
      ok: true;
      ticket: { id: string; status: TicketStatus; paid_at: string | null; cashback_cents: number | null };
      cashbackCreditedCents: number;
      cashbackRedeemedCents: number;
      guestBalanceAfterCents: number;
      alreadyPaid?: boolean;
    }
  | { ok: false; error: string; code?: string };
type LookupGuestRes =
  | { ok: true; guest: { id: string; code: string; full_name: string | null; cashback_balance_cents: number } }
  | { ok: false; error: string };
type CancelTicketRes =
  | {
      ok: true;
      ticket?: { id: string; status: TicketStatus; cancelled_at: string | null; cancel_reason: string | null };
      alreadyCancelled?: boolean;
    }
  | { ok: false; error: string };

export async function apiFetchGuestProfile(client: SupabaseClient): Promise<GuestProfile> {
  const { data, error } = await client.functions.invoke<GuestProfileRes>("guest-profile", {
    body: {},
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "guest-profile failed");
  return data.guest;
}

export async function apiFetchMyTickets(
  client: SupabaseClient,
  limit = 20,
): Promise<GuestTicket[]> {
  const { data, error } = await client.functions.invoke<MyTicketsRes>("tickets-mine", {
    body: { limit },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "tickets-mine failed");
  return data.tickets;
}

export async function apiFetchVenueTickets(
  client: SupabaseClient,
  venueId: string,
  limit = 20,
): Promise<VenueTicket[]> {
  const { data, error } = await client.functions.invoke<VenueTicketsRes>("tickets-venue-recent", {
    body: { venueId, limit },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "tickets-venue-recent failed");
  return data.tickets;
}

export async function apiCreateTicket(
  client: SupabaseClient,
  input: {
    venueId: string;
    guestCode: string;
    checkSubtotalCents: number;
    tipCents: number;
    redeemCents?: number;
  },
): Promise<{
  ticket: Ticket;
  venue: { id: string; name: string };
  guest: { id: string; code: string; full_name: string | null };
}> {
  const { data, error } = await client.functions.invoke<CreateTicketRes>(
    "tickets-venue-create",
    { body: input },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "tickets-venue-create failed");
  return { ticket: data.ticket, venue: data.venue, guest: data.guest };
}

export async function apiMarkTicketPaid(
  client: SupabaseClient,
  ticketId: string,
): Promise<{
  ticket: { id: string; status: TicketStatus; paid_at: string | null; cashback_cents: number | null };
  cashbackCreditedCents: number;
  cashbackRedeemedCents: number;
  guestBalanceAfterCents: number;
  alreadyPaid: boolean;
}> {
  const { data, error } = await client.functions.invoke<MarkPaidRes>("tickets-mark-paid", {
    body: { ticketId },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "tickets-mark-paid failed");
  return {
    ticket: data.ticket,
    cashbackCreditedCents: data.cashbackCreditedCents,
    cashbackRedeemedCents: data.cashbackRedeemedCents ?? 0,
    guestBalanceAfterCents: data.guestBalanceAfterCents,
    alreadyPaid: data.alreadyPaid ?? false,
  };
}

export async function apiLookupGuest(
  client: SupabaseClient,
  code: string,
): Promise<{
  id: string;
  code: string;
  full_name: string | null;
  cashback_balance_cents: number;
}> {
  const { data, error } = await client.functions.invoke<LookupGuestRes>(
    "manager-lookup-guest",
    { body: { code } },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "manager-lookup-guest failed");
  return data.guest;
}

export async function apiCancelTicket(
  client: SupabaseClient,
  ticketId: string,
  reason?: string,
): Promise<void> {
  const { data, error } = await client.functions.invoke<CancelTicketRes>(
    "manager-cancel-ticket",
    { body: { ticketId, reason } },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "manager-cancel-ticket failed");
}

// ── Display helpers ───────────────────────────────────────────────────────

export function formatCurrency(cents: number | null | undefined, currency = "MXN"): string {
  if (cents == null) return "—";
  const value = cents / 100;
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toFixed(0)} ${currency}`;
  }
}
