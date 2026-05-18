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

export type Venue = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  vibe: string | null;
  price_level: number | null;
  listing_type: VenueListingType;
  status: VenueStatus;
  lat: number | null;
  lng: number | null;
  address: string | null;
  closes_at: string | null;
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
  created_at: string;
};

export type MyVenue = Venue & {
  phone: string | null;
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
};

type ListResponse = { ok: true; venues: Venue[] } | { ok: false; error: string };
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
  const { data, error } = await client.functions.invoke<ListResponse>("venues-list", {
    body: { limit },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "venues-list failed");
  return data.venues.map(stripInsecurePhotos);
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
    "places-autocomplete",
    { body: { input: trimmed, sessionToken } },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "autocomplete failed");
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
    "venues-enrich-create",
    { body: { placeId } },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "venues-enrich-create failed");
  return { venue: data.venue, enrichment: data.enrichment };
}

export type UpdateVenueInput = {
  id: string;
  name?: string;
  category?: string | null;
  vibe?: string | null;
  price_level?: number | null;
  status?: "active" | "paused" | "archived";
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
};

type UpdateResponse =
  | { ok: true; venue: Venue & { phone: string | null; updated_at: string } }
  | { ok: false; error: string; code?: string | null };

export async function apiUpdateVenue(
  client: SupabaseClient,
  input: UpdateVenueInput,
): Promise<Venue & { phone: string | null; updated_at: string }> {
  const { data, error } = await client.functions.invoke<UpdateResponse>("venues-update", {
    body: input,
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "venues-update failed");
  return data.venue;
}
