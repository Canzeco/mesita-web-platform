"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Store,
  MapPin,
  Phone,
  Globe,
  ArrowRight,
  Loader2,
  Check,
  Search,
  Star,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  placesAutocomplete,
  placeDetails,
  type PlaceDetails,
  type PlacePrediction,
} from "@/lib/google-places";

const TYPE_TO_EMOJI: Record<string, string> = {
  restaurant: "🍽️",
  italian_restaurant: "🍝",
  french_restaurant: "🥖",
  mexican_restaurant: "🌶️",
  spanish_restaurant: "🥘",
  japanese_restaurant: "🍱",
  sushi_restaurant: "🍣",
  korean_restaurant: "🥢",
  chinese_restaurant: "🥡",
  thai_restaurant: "🍲",
  indian_restaurant: "🍛",
  middle_eastern_restaurant: "🥙",
  peruvian_restaurant: "🐟",
  argentinian_restaurant: "🥩",
  seafood_restaurant: "🦐",
  steak_house: "🥩",
  pizza_restaurant: "🍕",
  taco_restaurant: "🌮",
  hamburger_restaurant: "🍔",
  barbecue_restaurant: "🔥",
  fine_dining_restaurant: "✨",
  cafe: "☕",
  coffee_shop: "☕",
  bakery: "🥐",
  breakfast_restaurant: "🍳",
  brunch_restaurant: "🍳",
  dessert_shop: "🍰",
  ice_cream_shop: "🍦",
  vegan_restaurant: "🌱",
  vegetarian_restaurant: "🥗",
  bar: "🍸",
  wine_bar: "🍷",
  pub: "🍺",
  night_club: "🪩",
};

function emojiForTypes(primary: string | null, types: string[]): string {
  if (primary && TYPE_TO_EMOJI[primary]) return TYPE_TO_EMOJI[primary];
  for (const t of types) if (TYPE_TO_EMOJI[t]) return TYPE_TO_EMOJI[t];
  return "🏪";
}

type Step = "search" | "creating";

export function CreateUnitDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("search");
  const [selected, setSelected] = useState<PlaceDetails | null>(null);
  const [done, setDone] = useState(false);
  const [sessionToken] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const handlePick = (d: PlaceDetails) => {
    setSelected(d);
    setStep("creating");
    window.setTimeout(() => {
      setDone(true);
      window.setTimeout(onClose, 1100);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={done ? undefined : onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elev">
        {step === "search" && (
          <SearchStep
            sessionToken={sessionToken}
            onClose={onClose}
            onPick={handlePick}
          />
        )}
        {step === "creating" && selected && (
          <CreatingStep place={selected} done={done} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search step — single step. Picking a result auto-creates the unit.
// ---------------------------------------------------------------------------

function SearchStep({
  sessionToken,
  onClose,
  onPick,
}: {
  sessionToken: string;
  onClose: () => void;
  onPick: (details: PlaceDetails) => void;
}) {
  const [input, setInput] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mockMode, setMockMode] = useState(false);

  const trimmed = input.trim();
  const active = trimmed.length >= 2;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      placesAutocomplete(trimmed, sessionToken)
        .then((data) => {
          if (cancelled) return;
          if (data.ok) {
            setPredictions(data.predictions);
            setMockMode(data.mock);
          } else {
            setError(data.error);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [active, trimmed, sessionToken]);

  const pick = async (p: PlacePrediction) => {
    setPickingId(p.placeId);
    setError(null);
    const data = await placeDetails(p.placeId, sessionToken);
    if (!data.ok) {
      setError(data.error);
      setPickingId(null);
      return;
    }
    onPick(data.details);
  };

  return (
    <>
      <Header
        iconNode={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-gradient text-white shadow-sm">
            <Store className="h-5 w-5" />
          </span>
        }
        eyebrow="New unit"
        title="Find your place"
        subtitle="Pick the venue from Google. We'll auto-fill everything else from there."
        onClose={onClose}
      />

      <div className="px-6 pt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search Google · name or address"
            maxLength={120}
            className="h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-secondary/60"
          />
          {active && loading && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        {mockMode && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Showing demo results — set <span className="font-mono">GOOGLE_PLACES_API_KEY</span> in{" "}
            <span className="font-mono">.env.local</span> to use real Places data.
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide">
        {error && (
          <p className="mx-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {!error && !active && (
          <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
            Start typing to search.
          </div>
        )}
        {!error && active && predictions.length === 0 && !loading && (
          <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
            No matches. Try a fuller name or include the city.
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {active &&
            predictions.map((p) => {
              const picking = pickingId === p.placeId;
              return (
                <li key={p.placeId}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    disabled={!!pickingId}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-muted/40 disabled:opacity-60",
                      picking && "bg-secondary/5",
                    )}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-secondary">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold leading-tight">{p.mainText}</p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {p.secondaryText}
                      </p>
                    </div>
                    {picking ? (
                      <Loader2 className="mt-1 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border bg-background/60 px-6 py-3">
        <p className="text-[11px] text-muted-foreground">
          Powered by Google Places · billed per session
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold transition hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Creating step — brief confirmation flash, auto-closes.
// ---------------------------------------------------------------------------

function CreatingStep({ place, done }: { place: PlaceDetails; done: boolean }) {
  const emoji = useMemo(
    () => emojiForTypes(place.primaryType, place.types),
    [place.primaryType, place.types],
  );

  return (
    <div className="flex flex-col items-center px-6 pb-8 pt-10">
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-3xl text-2xl shadow-elev transition-all duration-300",
          done ? "bg-pink-gradient text-white" : "bg-card",
        )}
      >
        {done ? <Check className="h-7 w-7" strokeWidth={3} /> : <span>{emoji}</span>}
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
        {done ? "Added" : "Creating unit"}
      </p>
      <h2 className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight">
        {place.name}
      </h2>
      <p className="mt-1 max-w-xs text-center text-[13px] text-muted-foreground">
        {done
          ? "Live in your catalog. We're filling in the rest in the background."
          : "Pulling photos, hours and reviews from Google…"}
      </p>

      <div className="mt-6 w-full max-w-sm">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-lg shadow-sm">
            {emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{place.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              <MapPin className="mr-1 inline-block h-3 w-3 align-text-bottom" />
              {place.formattedAddress}
            </p>
          </div>
          {!done && <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
          {done && <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function Header({
  iconNode,
  eyebrow,
  title,
  subtitle,
  onClose,
}: {
  iconNode: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-6 pt-6">
      <div className="flex items-start gap-3">
        {iconNode}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            {eyebrow}
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// GooglePlaceCard / Pill / prettyHost kept for reuse if needed later.
export function GooglePlaceCard({ place, emoji }: { place: PlaceDetails; emoji: string }) {
  return (
    <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,oklch(0.97_0.018_10),oklch(0.95_0.030_5))] p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card text-xl shadow-sm">
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
            From Google
          </p>
          <p className="mt-0.5 font-display text-lg font-semibold leading-tight tracking-tight">
            {place.name}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            <MapPin className="mr-1 inline-block h-3 w-3 align-text-bottom" />
            {place.formattedAddress}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
        {place.rating != null && (
          <Pill>
            <Star className="h-3 w-3 fill-secondary text-secondary" strokeWidth={0} />
            {place.rating.toFixed(1)}
            {place.userRatingsTotal != null && (
              <span className="text-muted-foreground">
                · {place.userRatingsTotal.toLocaleString()} reviews
              </span>
            )}
          </Pill>
        )}
        {place.priceLevel != null && <Pill>{"$".repeat(place.priceLevel)}</Pill>}
        {place.phone && (
          <Pill>
            <Phone className="h-3 w-3" />
            {place.phone}
          </Pill>
        )}
        {place.website && (
          <Pill>
            <Globe className="h-3 w-3" />
            {prettyHost(place.website)}
          </Pill>
        )}
        {place.openingHours.length > 0 && (
          <Pill>
            <Clock className="h-3 w-3" />
            {place.openingHours.length} day hours captured
          </Pill>
        )}
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium">
      {children}
    </span>
  );
}

function prettyHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
