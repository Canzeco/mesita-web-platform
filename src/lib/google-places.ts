// Google Places client.
//
// Talks to the Supabase Edge Functions `places-autocomplete` and `places-details`,
// which proxy Google Places API (New). The Google key lives as a Supabase secret
// (`google_places_api_key`) and is never shipped to the browser.
//
// If Supabase env vars are missing — or `NEXT_PUBLIC_PLACES_MOCK=1` is set —
// we serve a canned set of CDMX results so the UI is still usable in dev without
// any backend hooked up.

export type PlacePrediction = {
  placeId: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceDetails = {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: { lat: number; lng: number } | null;
  rating: number | null;
  userRatingsTotal: number | null;
  phone: string | null;
  website: string | null;
  openingHours: string[];
  types: string[];
  primaryType: string | null;
  priceLevel: 1 | 2 | 3 | 4 | null;
  googleMapsUri: string | null;
  city: string | null;
  neighborhood: string | null;
  country: string | null;
};

export type AutocompleteResult =
  | { ok: true; predictions: PlacePrediction[]; mock: boolean }
  | { ok: false; error: string };

export type DetailsResult =
  | { ok: true; details: PlaceDetails; mock: boolean }
  | { ok: false; error: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const FORCED_MOCK = process.env.NEXT_PUBLIC_PLACES_MOCK === "1";

function mockMode(): boolean {
  return FORCED_MOCK || !SUPABASE_URL || !SUPABASE_KEY;
}

function fnUrl(name: string): string {
  return `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${name}`;
}

async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(fnUrl(name), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Try to surface the function's own error payload before falling back to status text.
    let detail: string | undefined;
    try {
      const data = (await res.json()) as { error?: string };
      detail = data.error;
    } catch {
      detail = await res.text().catch(() => undefined);
    }
    throw new Error(detail ?? `Edge function ${name} ${res.status}`);
  }
  return (await res.json()) as T;
}

// --- Autocomplete ---------------------------------------------------------

export async function placesAutocomplete(
  input: string,
  sessionToken: string,
): Promise<AutocompleteResult> {
  const trimmed = input.trim();
  if (trimmed.length < 2) return { ok: true, predictions: [], mock: mockMode() };
  if (mockMode()) {
    return { ok: true, predictions: mockPredictions(trimmed), mock: true };
  }
  try {
    return await callFunction<AutocompleteResult>("places-autocomplete", {
      input: trimmed,
      sessionToken,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// --- Details --------------------------------------------------------------

export async function placeDetails(
  placeId: string,
  sessionToken: string,
): Promise<DetailsResult> {
  if (!placeId) return { ok: false, error: "Missing placeId" };
  if (mockMode()) {
    const mock = mockDetails(placeId);
    if (!mock) return { ok: false, error: "Unknown mock placeId" };
    return { ok: true, details: mock, mock: true };
  }
  try {
    return await callFunction<DetailsResult>("places-details", {
      placeId,
      sessionToken,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// --- Mock data ------------------------------------------------------------

const MOCK_PLACES: PlaceDetails[] = [
  {
    placeId: "mock-casa-luminar",
    name: "Casa Luminar",
    formattedAddress: "Av. Presidente Masaryk 244, Polanco V Secc, 11560 CDMX",
    location: { lat: 19.4326, lng: -99.1957 },
    rating: 4.7,
    userRatingsTotal: 1284,
    phone: "+52 55 5283 1234",
    website: "https://casaluminar.mx",
    openingHours: [
      "Monday: Closed",
      "Tuesday: 7:00 PM – 1:00 AM",
      "Wednesday: 7:00 PM – 1:00 AM",
      "Thursday: 7:00 PM – 2:00 AM",
      "Friday: 7:00 PM – 2:00 AM",
      "Saturday: 6:00 PM – 2:00 AM",
      "Sunday: 12:00 PM – 11:00 PM",
    ],
    types: ["restaurant", "bar"],
    primaryType: "restaurant",
    priceLevel: 3,
    googleMapsUri: "https://maps.google.com/?cid=12345",
    city: "Ciudad de México",
    neighborhood: "Polanco",
    country: "Mexico",
  },
  {
    placeId: "mock-pujol",
    name: "Pujol",
    formattedAddress: "Tennyson 133, Polanco, 11560 CDMX",
    location: { lat: 19.4326, lng: -99.1957 },
    rating: 4.6,
    userRatingsTotal: 4720,
    phone: "+52 55 5545 4111",
    website: "https://pujol.com.mx",
    openingHours: [
      "Monday: 1:30 PM – 10:30 PM",
      "Tuesday: 1:30 PM – 10:30 PM",
      "Wednesday: 1:30 PM – 10:30 PM",
      "Thursday: 1:30 PM – 10:30 PM",
      "Friday: 1:30 PM – 10:30 PM",
      "Saturday: 1:30 PM – 10:30 PM",
      "Sunday: Closed",
    ],
    types: ["restaurant"],
    primaryType: "restaurant",
    priceLevel: 4,
    googleMapsUri: "https://maps.google.com/?cid=24680",
    city: "Ciudad de México",
    neighborhood: "Polanco",
    country: "Mexico",
  },
  {
    placeId: "mock-quintonil",
    name: "Quintonil",
    formattedAddress: "Av. Isaac Newton 55, Polanco V Secc, 11560 CDMX",
    location: { lat: 19.4338, lng: -99.1971 },
    rating: 4.7,
    userRatingsTotal: 2630,
    phone: "+52 55 5280 2680",
    website: "https://quintonil.com",
    openingHours: [
      "Monday: 1:00 PM – 10:30 PM",
      "Tuesday: 1:00 PM – 10:30 PM",
      "Wednesday: 1:00 PM – 10:30 PM",
      "Thursday: 1:00 PM – 10:30 PM",
      "Friday: 1:00 PM – 10:30 PM",
      "Saturday: 1:00 PM – 10:30 PM",
      "Sunday: Closed",
    ],
    types: ["restaurant"],
    primaryType: "restaurant",
    priceLevel: 4,
    googleMapsUri: "https://maps.google.com/?cid=11111",
    city: "Ciudad de México",
    neighborhood: "Polanco",
    country: "Mexico",
  },
  {
    placeId: "mock-rosetta",
    name: "Rosetta",
    formattedAddress: "Colima 166, Roma Nte., 06700 CDMX",
    location: { lat: 19.4185, lng: -99.1605 },
    rating: 4.5,
    userRatingsTotal: 3120,
    phone: "+52 55 5533 7804",
    website: "https://rosetta.com.mx",
    openingHours: [
      "Monday: 1:30 PM – 11:00 PM",
      "Tuesday: 1:30 PM – 11:00 PM",
      "Wednesday: 1:30 PM – 11:00 PM",
      "Thursday: 1:30 PM – 11:00 PM",
      "Friday: 1:30 PM – 11:00 PM",
      "Saturday: 1:30 PM – 11:00 PM",
      "Sunday: 1:30 PM – 6:00 PM",
    ],
    types: ["restaurant", "italian_restaurant"],
    primaryType: "italian_restaurant",
    priceLevel: 3,
    googleMapsUri: "https://maps.google.com/?cid=99999",
    city: "Ciudad de México",
    neighborhood: "Roma Norte",
    country: "Mexico",
  },
  {
    placeId: "mock-licoreria",
    name: "Licorería Limantour",
    formattedAddress: "Av. Álvaro Obregón 106, Roma Nte., 06700 CDMX",
    location: { lat: 19.4189, lng: -99.16 },
    rating: 4.6,
    userRatingsTotal: 5870,
    phone: "+52 55 5264 4122",
    website: "https://limantour.tv",
    openingHours: [
      "Monday: 6:00 PM – 2:00 AM",
      "Tuesday: 6:00 PM – 2:00 AM",
      "Wednesday: 6:00 PM – 2:00 AM",
      "Thursday: 6:00 PM – 2:00 AM",
      "Friday: 6:00 PM – 2:00 AM",
      "Saturday: 6:00 PM – 2:00 AM",
      "Sunday: Closed",
    ],
    types: ["bar"],
    primaryType: "bar",
    priceLevel: 3,
    googleMapsUri: "https://maps.google.com/?cid=77777",
    city: "Ciudad de México",
    neighborhood: "Roma Norte",
    country: "Mexico",
  },
];

function mockPredictions(input: string): PlacePrediction[] {
  const q = input.toLowerCase();
  const hits = MOCK_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.formattedAddress.toLowerCase().includes(q) ||
      p.neighborhood?.toLowerCase().includes(q),
  );
  const pool = hits.length > 0 ? hits : MOCK_PLACES;
  return pool.slice(0, 5).map((p) => ({
    placeId: p.placeId,
    mainText: p.name,
    secondaryText: p.formattedAddress,
  }));
}

function mockDetails(placeId: string): PlaceDetails | null {
  return MOCK_PLACES.find((p) => p.placeId === placeId) ?? null;
}
