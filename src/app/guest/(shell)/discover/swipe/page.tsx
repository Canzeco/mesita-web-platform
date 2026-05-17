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

  return <SwipeDeck venues={venues} fetchError={fetchError} />;
}
