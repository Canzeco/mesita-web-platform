// Frontend helper for the unit-overview Edge Function.
//
// Wrapped in React.cache so the manager layout and the active page (which
// both need the bundle) reuse a single Edge Function round trip per render.

import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MyVenue } from "./venues";
import type { VenueTicket } from "./tickets";

export type UnitOverview = {
  user: { id: string; email: string | null };
  venues: MyVenue[];
  active: { venue: MyVenue; recentTickets: VenueTicket[] } | null;
};

type Response =
  | { ok: true; user: UnitOverview["user"]; venues: MyVenue[]; active: UnitOverview["active"] }
  | { ok: false; error: string };

async function fetchUnitOverview(
  client: SupabaseClient,
  activeUnitId: string | null,
  ticketsLimit = 20,
): Promise<UnitOverview> {
  const { data, error } = await client.functions.invoke<Response>("unit-overview", {
    body: { activeUnitId: activeUnitId ?? undefined, ticketsLimit },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "unit-overview failed");
  return { user: data.user, venues: data.venues, active: data.active };
}

// `cache` dedupes by argument identity. Within a single server render pass,
// calling `getUnitOverview(client, "abc")` from the layout and the page both
// resolve to the same Promise — exactly one fetch hits the wire.
export const getUnitOverview = cache(fetchUnitOverview);
