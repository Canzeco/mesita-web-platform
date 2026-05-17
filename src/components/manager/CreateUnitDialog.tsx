"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Store,
  MapPin,
  Sparkles,
  Phone,
  Globe,
  Mail,
  Camera,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Instagram,
  Facebook,
  Music2,
  ShoppingBag,
  PenLine,
  Search,
  Star,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlaceDetails, PlacePrediction } from "@/lib/google-places";

const INPUT =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-secondary/60";

const VIBES = [
  "Rooftop",
  "Late night",
  "Date night",
  "Brunch",
  "Casual",
  "Fine dining",
  "Tasting menu",
  "Family",
  "Pizza bar",
  "Dancefloor",
];

const PRICE_LEVELS = [1, 2, 3, 4] as const;

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

export function CreateUnitDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"search" | "configure">("search");
  const [selected, setSelected] = useState<PlaceDetails | null>(null);
  const [sessionToken] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elev">
        {step === "search" ? (
          <SearchStep
            sessionToken={sessionToken}
            onClose={onClose}
            onPick={(details) => {
              setSelected(details);
              setStep("configure");
            }}
          />
        ) : selected ? (
          <ConfigureStep
            place={selected}
            onBack={() => setStep("search")}
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Place lookup via Google Places
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
    const ac = new AbortController();
    let cancelled = false;
    const t = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      fetch("/api/places/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed, sessionToken }),
        signal: ac.signal,
      })
        .then((res) => res.json())
        .then((data: { ok: boolean; predictions?: PlacePrediction[]; mock?: boolean; error?: string }) => {
          if (cancelled) return;
          if (data.ok) {
            setPredictions(data.predictions ?? []);
            setMockMode(!!data.mock);
          } else {
            setError(data.error ?? "Search failed");
          }
        })
        .catch((err: unknown) => {
          if (cancelled || ac.signal.aborted) return;
          setError(err instanceof Error ? err.message : "Network error");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      ac.abort();
    };
  }, [active, trimmed, sessionToken]);

  const pick = async (p: PlacePrediction) => {
    setPickingId(p.placeId);
    setError(null);
    try {
      const res = await fetch("/api/places/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: p.placeId, sessionToken }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        details?: PlaceDetails;
        error?: string;
      };
      if (!data.ok || !data.details) {
        setError(data.error ?? "Could not load place details");
        setPickingId(null);
        return;
      }
      onPick(data.details);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setPickingId(null);
    }
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3 px-6 pt-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-gradient text-white shadow-sm">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              New unit · step 1 of 2
            </p>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
              Find your place
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Type the venue name or address. We&apos;ll grab the location, photos and Google
              rating from there.
            </p>
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
          {active && predictions.map((p) => {
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
                    <p className="truncate text-[12px] text-muted-foreground">{p.secondaryText}</p>
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
// Step 2 — Confirm + Mesita-specific extras
// ---------------------------------------------------------------------------

function ConfigureStep({
  place,
  onBack,
  onClose,
}: {
  place: PlaceDetails;
  onBack: () => void;
  onClose: () => void;
}) {
  const inferredEmoji = useMemo(
    () => emojiForTypes(place.primaryType, place.types),
    [place.primaryType, place.types],
  );

  const [vibe, setVibe] = useState("");
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3 | 4>(place.priceLevel ?? 2);
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [email, setEmail] = useState("");
  const [uberEats, setUberEats] = useState("");
  const [rappi, setRappi] = useState("");
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!vibe) {
      setError("Vibe is required");
      return;
    }
    if (!instagram.trim()) {
      setError("Instagram handle is required so we can validate guest stories");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
      window.setTimeout(onClose, 900);
    }, 700);
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3 px-6 pt-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-gradient text-lg shadow-sm">
            {inferredEmoji}
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              New unit · step 2 of 2
            </p>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
              Confirm & add details
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Place pulled from Google. Add a vibe, your Instagram, and any extras Mesita uses
              that Google doesn&apos;t carry.
            </p>
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

      <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 pt-5 pb-2">
        <GooglePlaceCard place={place} emoji={inferredEmoji} />

        <SectionLabel icon={<Sparkles className="h-3 w-3" />}>Mesita details</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Vibe" required>
            <select
              className={INPUT}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              required
            >
              <option value="">Select</option>
              {VIBES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price level">
            <div className="flex gap-1.5">
              {PRICE_LEVELS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriceLevel(p)}
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center rounded-xl border text-sm font-bold tracking-wider transition",
                    priceLevel === p
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {"$".repeat(p)}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <SectionLabel icon={<PenLine className="h-3 w-3" />}>The pitch (optional)</SectionLabel>
        <Field label="One-liner">
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="e.g. Mediterranean tasting menu on a candle-lit rooftop with mountain views."
            rows={2}
            maxLength={180}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-secondary/60"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">{pitch.length} / 180</p>
        </Field>

        <SectionLabel icon={<Instagram className="h-3 w-3" />}>Social</SectionLabel>

        <Field label="Instagram" required hint="We validate guest stories against this handle.">
          <div className="relative">
            <Instagram className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cn(INPUT, "pl-8")}
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@yourvenue"
              maxLength={40}
              required
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Facebook">
            <div className="relative">
              <Facebook className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className={cn(INPUT, "pl-8")}
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="page name"
                maxLength={40}
              />
            </div>
          </Field>
          <Field label="TikTok">
            <div className="relative">
              <Music2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className={cn(INPUT, "pl-8")}
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@handle"
                maxLength={40}
              />
            </div>
          </Field>
        </div>

        <SectionLabel icon={<Mail className="h-3 w-3" />}>Contact (optional)</SectionLabel>
        <Field label="Booking email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              className={cn(INPUT, "pl-8")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@venue.mx"
              maxLength={80}
            />
          </div>
        </Field>

        <SectionLabel icon={<ShoppingBag className="h-3 w-3" />}>Delivery (optional)</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Uber Eats">
            <input
              className={INPUT}
              value={uberEats}
              onChange={(e) => setUberEats(e.target.value)}
              placeholder="store slug"
              maxLength={40}
            />
          </Field>
          <Field label="Rappi">
            <input
              className={INPUT}
              value={rappi}
              onChange={(e) => setRappi(e.target.value)}
              placeholder="store slug"
              maxLength={40}
            />
          </Field>
        </div>

        <SectionLabel icon={<Camera className="h-3 w-3" />}>Cover photo</SectionLabel>
        <Field label="Hero image (optional — we&apos;ll pull from Google for now)">
          <button
            type="button"
            className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-[12px] text-muted-foreground transition hover:bg-muted/50"
          >
            <Camera className="h-4 w-4" />
            Upload your own · skip for now
          </button>
        </Field>

        {error && (
          <p className="mt-1 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </form>

      <div className="flex items-center justify-between gap-2 border-t border-border bg-background/60 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold transition hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Pick another
        </button>
        <button
          type="submit"
          disabled={loading || done}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-full bg-pink-gradient px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition disabled:opacity-60"
        >
          {done ? (
            <>
              <Check className="h-4 w-4" />
              Created
            </>
          ) : loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              Create unit
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </>
  );
}

function GooglePlaceCard({ place, emoji }: { place: PlaceDetails; emoji: string }) {
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

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="mt-4 mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {icon}
      {children}
    </p>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        {label}
        {required && <span className="text-secondary">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}
