// Frontend API surface for venue Edge Functions.
//
// Architectural constraints honoured:
// - Clients NEVER query the database directly. Every read or write goes
//   through an Edge Function via `supabase.functions.invoke`.
// - Each helper here calls exactly one Edge Function and never composes
//   multiple Edge Functions (composition belongs inside the function).

import type { SupabaseClient } from "@supabase/supabase-js";

export type VenueListingType = "partner" | "web";
export type VenueStatus = "lead" | "active" | "paused" | "archived";

export type FiscalType = "formal" | "informal";
export type VenuePlan =
  | "free"
  | "formal_pro"
  | "formal_ultra"
  | "informal_pro"
  | "informal_ultra";

export type Venue = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  vibe: string | null;
  price_level: number | null;
  listing_type: VenueListingType;
  status: VenueStatus;
  fiscal_type: FiscalType;
  plan: VenuePlan;
  lat: number | null;
  lng: number | null;
  address: string | null;
  closes_at: string | null;
  phone: string | null;
  pitch: string | null;
  story: string | null;
  cashback_percent: number | null;
  photos: string[];
  website_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  whatsapp_url: string | null;
  opentable_url: string | null;
  resy_url: string | null;
  uber_eats_url: string | null;
  rappi_url: string | null;
  x_url: string | null;
  youtube_url: string | null;
  threads_url: string | null;
  reddit_url: string | null;
  didi_food_url: string | null;
  tripadvisor_url: string | null;
  google_maps_url: string | null;
  email: string | null;
  created_at: string;
};

export type MyVenue = Venue & {
  my_role: "owner" | "manager" | "staff";
  updated_at?: string;
};

export type PlacePrediction = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

export type EnrichmentReport = {
  google: boolean;
  photoCount: number;
  firecrawl: boolean;
  perplexity: boolean;
  openai: boolean;
  openaiError?: string | null;
  /** Number of channel columns (URLs + email) auto-classified from the
   *  enrichment pass. Lets the UI brag "We pulled 9 of your channels". */
  channelCount?: number;
};

type ListResponse = { ok: true; venues: Venue[] } | { ok: false; error: string };
type GetResponse = { ok: true; venue: Venue } | { ok: false; error: string };
type AutocompleteResponse =
  | { ok: true; predictions: PlacePrediction[] }
  | { ok: false; error: string };
type EnrichCreateResponse =
  | {
      ok: true;
      venue: { id: string; slug: string; name: string; status: VenueStatus };
      enrichment: EnrichmentReport;
    }
  | { ok: false; error: string; code?: string | null };

export async function apiFetchPublicVenues(
  client: SupabaseClient,
  limit = 50,
): Promise<Venue[]> {
  const { data, error } = await client.functions.invoke<ListResponse>("guest-list-venues", {
    body: { limit },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "guest-list-venues failed");
  return data.venues.map(stripInsecurePhotos);
}

export async function apiGetVenue(
  client: SupabaseClient,
  idOrSlug: string,
): Promise<Venue | null> {
  const { data, error } = await client.functions.invoke<GetResponse>("guest-get-venue", {
    body: looksLikeUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
  });
  if (error) {
    // 404 surfaces here as a FunctionsHttpError; treat as "not found" rather
    // than throwing so the page can show a friendly empty state.
    if (/404/.test(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data?.ok) return null;
  return stripInsecurePhotos(data.venue);
}

function looksLikeUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

// Older venue rows may contain http:// photos (e.g. an old website scrape).
// Next.js Image throws on insecure URLs and would break the entire page —
// filter to https here so legacy rows don't kill the surface.
function stripInsecurePhotos<T extends { photos: string[] }>(v: T): T {
  return { ...v, photos: v.photos.filter((p) => p.startsWith("https://")) };
}

export async function apiPlacesAutocomplete(
  client: SupabaseClient,
  input: string,
  sessionToken: string,
): Promise<PlacePrediction[]> {
  const trimmed = input.trim();
  if (trimmed.length < 2) return [];
  const { data, error } = await client.functions.invoke<AutocompleteResponse>(
    "manager-suggest-places",
    { body: { input: trimmed, sessionToken } },
  );
  // The Edge Function always responds 200 (even on Google failures) and uses
  // the body's `ok: false` shape to carry the real error. `error` here would
  // only fire on a transport-layer problem — surface what we can.
  if (error) {
    const inner = await readInvokeError(error);
    throw new Error(inner ?? error.message);
  }
  if (!data?.ok) throw new Error(data?.error ?? "Couldn't search venues right now.");
  return data.predictions;
}

export async function apiEnrichCreateVenue(
  client: SupabaseClient,
  placeId: string,
): Promise<{
  venue: { id: string; slug: string; name: string; status: VenueStatus };
  enrichment: EnrichmentReport;
}> {
  const { data, error } = await client.functions.invoke<EnrichCreateResponse>(
    "manager-create-unit",
    { body: { placeId } },
  );
  if (error) {
    const inner = await readInvokeError(error);
    throw new Error(inner ?? error.message);
  }
  if (!data?.ok) {
    throw new Error(data?.error ?? "Couldn't create that venue.");
  }
  return { venue: data.venue, enrichment: data.enrichment };
}

// supabase-js wraps non-2xx responses in a FunctionsHttpError whose default
// `.message` is the generic "Edge Function returned a non-2xx status code".
// The real body (the EF's `{ ok: false, error: "…" }`) lives on
// `error.context.response`. This helper peels that off so the UI gets a
// useful message instead of the wrapper text.
async function readInvokeError(error: unknown): Promise<string | null> {
  try {
    const ctx = (error as { context?: { response?: Response } }).context;
    const res = ctx?.response;
    if (!res) return null;
    // Cloning lets the caller still inspect the original response later.
    const body = await res.clone().json().catch(() => null);
    if (body && typeof body === "object" && "error" in body) {
      const msg = (body as { error?: string }).error;
      if (typeof msg === "string" && msg.length > 0) return msg;
    }
    const text = await res.clone().text().catch(() => null);
    if (text && text.length < 500) return text;
    return null;
  } catch {
    return null;
  }
}

export type UpdateVenueInput = {
  id: string;
  name?: string;
  category?: string | null;
  vibe?: string | null;
  price_level?: number | null;
  status?: "active" | "paused" | "archived";
  fiscal_type?: FiscalType;
  plan?: VenuePlan;
  address?: string | null;
  closes_at?: string | null;
  phone?: string | null;
  pitch?: string | null;
  story?: string | null;
  cashback_percent?: number | null;
  photos?: string[];
  website_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  facebook_url?: string | null;
  whatsapp_url?: string | null;
  opentable_url?: string | null;
  resy_url?: string | null;
  uber_eats_url?: string | null;
  rappi_url?: string | null;
  x_url?: string | null;
  youtube_url?: string | null;
  threads_url?: string | null;
  reddit_url?: string | null;
  didi_food_url?: string | null;
  tripadvisor_url?: string | null;
  google_maps_url?: string | null;
  email?: string | null;
};

type UpdateResponse =
  | { ok: true; venue: Venue & { phone: string | null; updated_at: string } }
  | { ok: false; error: string; code?: string | null };

export async function apiUpdateVenue(
  client: SupabaseClient,
  input: UpdateVenueInput,
): Promise<Venue & { phone: string | null; updated_at: string }> {
  const { data, error } = await client.functions.invoke<UpdateResponse>("manager-update-unit", {
    body: input,
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "manager-update-unit failed");
  return data.venue;
}
