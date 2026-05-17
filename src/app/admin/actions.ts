"use server";

export type CreateVenueState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; message: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function optional(v: string): string | null {
  return v.length === 0 ? null : v;
}

export async function createVenue(
  _prev: CreateVenueState,
  formData: FormData,
): Promise<CreateVenueState> {
  const name = str(formData.get("name"));
  const slug = str(formData.get("slug")).toLowerCase();
  const type = str(formData.get("type"));
  const emoji = str(formData.get("emoji"));
  const city = str(formData.get("city"));
  const area = str(formData.get("area"));
  const country = str(formData.get("country"));
  const instagram = str(formData.get("instagram"));
  const status = str(formData.get("status"));
  const plan = str(formData.get("plan"));
  const stage = str(formData.get("stage"));
  const fit = str(formData.get("fit"));
  const ticket = str(formData.get("ticket"));
  const owner = str(formData.get("owner"));
  const ratingRaw = str(formData.get("rating"));

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Name is required.";
  if (!slug) fieldErrors.slug = "Slug is required.";
  else if (!SLUG_RE.test(slug))
    fieldErrors.slug = "Use lowercase letters, numbers, and hyphens.";

  let rating: number | null = null;
  if (ratingRaw.length > 0) {
    const parsed = Number(ratingRaw);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5)
      fieldErrors.rating = "Rating must be between 0 and 5.";
    else rating = Math.round(parsed * 10) / 10;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  const venue = {
    name,
    slug,
    type: optional(type),
    emoji: optional(emoji),
    city: optional(city),
    area: optional(area),
    country: optional(country),
    instagram: optional(instagram),
    status: optional(status),
    plan: optional(plan),
    stage: optional(stage),
    fit: optional(fit),
    ticket: optional(ticket),
    owner: optional(owner),
    rating,
    is_unit: status === "unit",
  };

  // TODO: persist to public.venues via Supabase once the client is wired up.
  console.log("[admin] createVenue", venue);

  return { status: "success", message: `Venue "${name}" queued for onboarding.` };
}
