import { createServerSupabase } from "@/lib/supabase/server";
import { apiFetchPublicVenues, type Venue } from "@/lib/api/venues";
import { SwipeDeck } from "./SwipeDeck";

// Fetched on every request: this is a discover surface and freshness matters.
export const dynamic = "force-dynamic";

export default async function SwipePage() {
  const supabase = await createServerSupabase();

  let venues: Venue[] = [];
  let fetchError: string | null = null;
  try {
    venues = await apiFetchPublicVenues(supabase);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load venues.";
  }

  // Partners earn cashback and have richer rows, so they belong up front in
  // the swipe deck. Stable: keep the API's created_at desc order within each
  // bucket so newer venues still get visibility.
  const sorted = [...venues].sort((a, b) => {
    const aRank = a.listing_type === "partner" ? 0 : 1;
    const bRank = b.listing_type === "partner" ? 0 : 1;
    return aRank - bRank;
  });

  return <SwipeDeck venues={sorted} fetchError={fetchError} />;
}
