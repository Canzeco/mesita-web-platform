// Google Places API (New) wrapper.
//
// All calls are server-side: we read GOOGLE_PLACES_API_KEY from process.env and
// proxy the response back to the client through /api/places/*. The key never
// ships to the browser. When the key is missing we return canned mock data so
// the UI is fully usable in dev without burning quota.

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_URL_BASE = "https://places.googleapis.com/v1/places";

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "location",
  "rating",
  "userRatingCount",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "regularOpeningHours.weekdayDescriptions",
  "types",
  "primaryType",
  "priceLevel",
  "googleMapsUri",
  "photos.name",
].join(",");

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

function getKey(): string | null {
  const k = process.env.GOOGLE_PLACES_API_KEY;
  return k && k.trim().length > 0 ? k.trim() : null;
}

// --- Autocomplete ---------------------------------------------------------

export async function placesAutocomplete(
  input: string,
  sessionToken: string,
): Promise<AutocompleteResult> {
  const trimmed = input.trim();
  if (trimmed.length < 2) return { ok: true, predictions: [], mock: false };

  const key = getKey();
  if (!key) return { ok: true, predictions: mockPredictions(trimmed), mock: true };

  try {
    const res = await fetch(AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
      },
      body: JSON.stringify({
        input: trimmed,
        sessionToken,
        includedPrimaryTypes: ["restaurant", "bar", "cafe", "bakery", "night_club", "food"],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Google autocomplete ${res.status}: ${body.slice(0, 240)}` };
    }
    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          structuredFormat?: {
            mainText?: { text?: string };
            secondaryText?: { text?: string };
          };
          text?: { text?: string };
        };
      }>;
    };
    const predictions: PlacePrediction[] = (data.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        placeId: p.placeId,
        mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondaryText: p.structuredFormat?.secondaryText?.text ?? "",
      }))
      .filter((p) => p.placeId && p.mainText);
    return { ok: true, predictions, mock: false };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- Details --------------------------------------------------------------

export async function placeDetails(
  placeId: string,
  sessionToken: string,
): Promise<DetailsResult> {
  if (!placeId) return { ok: false, error: "Missing placeId" };

  const key = getKey();
  if (!key) {
    const mock = mockDetails(placeId);
    if (!mock) return { ok: false, error: "Unknown mock placeId" };
    return { ok: true, details: mock, mock: true };
  }

  try {
    const url = new URL(`${DETAILS_URL_BASE}/${encodeURIComponent(placeId)}`);
    url.searchParams.set("sessionToken", sessionToken);

    const res = await fetch(url.toString(), {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Google details ${res.status}: ${body.slice(0, 240)}` };
    }
    const data = (await res.json()) as GoogleDetailsResponse;
    return { ok: true, details: normaliseDetails(placeId, data), mock: false };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// --- Helpers --------------------------------------------------------------

type AddressComponent = { longText?: string; shortText?: string; types?: string[] };
type GoogleDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  types?: string[];
  primaryType?: string;
  priceLevel?: string; // "PRICE_LEVEL_INEXPENSIVE" etc.
  googleMapsUri?: string;
};

function normaliseDetails(placeId: string, d: GoogleDetailsResponse): PlaceDetails {
  const find = (type: string) =>
    d.addressComponents?.find((c) => c.types?.includes(type))?.longText ?? null;
  return {
    placeId: d.id ?? placeId,
    name: d.displayName?.text ?? "",
    formattedAddress: d.formattedAddress ?? "",
    location:
      d.location?.latitude != null && d.location?.longitude != null
        ? { lat: d.location.latitude, lng: d.location.longitude }
        : null,
    rating: d.rating ?? null,
    userRatingsTotal: d.userRatingCount ?? null,
    phone: d.nationalPhoneNumber ?? d.internationalPhoneNumber ?? null,
    website: d.websiteUri ?? null,
    openingHours: d.regularOpeningHours?.weekdayDescriptions ?? [],
    types: d.types ?? [],
    primaryType: d.primaryType ?? null,
    priceLevel: priceLevelFromString(d.priceLevel),
    googleMapsUri: d.googleMapsUri ?? null,
    city: find("locality") ?? find("administrative_area_level_2"),
    neighborhood:
      find("neighborhood") ?? find("sublocality_level_1") ?? find("sublocality"),
    country: find("country"),
  };
}

function priceLevelFromString(p: string | undefined): 1 | 2 | 3 | 4 | null {
  switch (p) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    default:
      return null;
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
