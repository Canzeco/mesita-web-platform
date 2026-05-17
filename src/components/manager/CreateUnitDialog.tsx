"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Store,
  MapPin,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Instagram,
  Facebook,
  Music2,
  MessageCircle,
  CalendarCheck,
  CalendarHeart,
  ShoppingBag,
  Bike,
  Search,
  Star,
  Clock,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  placesAutocomplete,
  placeDetails,
  type PlaceDetails,
  type PlacePrediction,
} from "@/lib/google-places";

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
type PriceLevel = (typeof PRICE_LEVELS)[number];

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

type Step = "search" | "design" | "channels";

export function CreateUnitDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>("search");
  const [selected, setSelected] = useState<PlaceDetails | null>(null);
  const [sessionToken] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  // Step 2 — design
  const [vibe, setVibe] = useState("");
  const [priceLevel, setPriceLevel] = useState<PriceLevel | null>(null);
  const [pitch, setPitch] = useState("");

  // Step 3 — channels (all optional)
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [facebook, setFacebook] = useState("");
  const [openTable, setOpenTable] = useState("");
  const [resy, setResy] = useState("");
  const [rappi, setRappi] = useState("");
  const [uberEats, setUberEats] = useState("");

  // Submit state
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handlePick = (d: PlaceDetails) => {
    setSelected(d);
    setPriceLevel(d.priceLevel ?? null);
    setWebsite(d.website ?? "");
    setPhone(d.phone ?? "");
    setStep("design");
  };

  const handleSubmit = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
      window.setTimeout(onClose, 900);
    }, 700);
  };

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
        {step === "search" && (
          <SearchStep
            sessionToken={sessionToken}
            onClose={onClose}
            onPick={handlePick}
          />
        )}
        {step === "design" && selected && (
          <DesignStep
            place={selected}
            vibe={vibe}
            setVibe={setVibe}
            priceLevel={priceLevel}
            setPriceLevel={setPriceLevel}
            pitch={pitch}
            setPitch={setPitch}
            onBack={() => setStep("search")}
            onNext={() => setStep("channels")}
            onClose={onClose}
          />
        )}
        {step === "channels" && selected && (
          <ChannelsStep
            place={selected}
            instagram={instagram}
            setInstagram={setInstagram}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
            website={website}
            setWebsite={setWebsite}
            phone={phone}
            setPhone={setPhone}
            tiktok={tiktok}
            setTiktok={setTiktok}
            facebook={facebook}
            setFacebook={setFacebook}
            openTable={openTable}
            setOpenTable={setOpenTable}
            resy={resy}
            setResy={setResy}
            rappi={rappi}
            setRappi={setRappi}
            uberEats={uberEats}
            setUberEats={setUberEats}
            loading={loading}
            done={done}
            onSubmit={handleSubmit}
            onBack={() => setStep("design")}
            onClose={onClose}
          />
        )}
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
        step="1 of 3"
        iconNode={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-gradient text-white shadow-sm">
            <Store className="h-5 w-5" />
          </span>
        }
        title="Find your place"
        subtitle="Type the venue name or address. We'll grab the location, photos and Google rating from there."
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
// Step 2 — Design / how it looks in Mesita
// ---------------------------------------------------------------------------

function DesignStep({
  place,
  vibe,
  setVibe,
  priceLevel,
  setPriceLevel,
  pitch,
  setPitch,
  onBack,
  onNext,
  onClose,
}: {
  place: PlaceDetails;
  vibe: string;
  setVibe: (v: string) => void;
  priceLevel: PriceLevel | null;
  setPriceLevel: (p: PriceLevel) => void;
  pitch: string;
  setPitch: (p: string) => void;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const emoji = useMemo(
    () => emojiForTypes(place.primaryType, place.types),
    [place.primaryType, place.types],
  );

  return (
    <>
      <Header
        step="2 of 3"
        iconNode={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-gradient text-lg shadow-sm">
            {emoji}
          </span>
        }
        title="How it looks"
        subtitle="A few visual touches for how this venue shows up in the Mesita catalog."
        onClose={onClose}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="flex-1 overflow-y-auto px-6 pt-5 pb-2"
      >
        <GooglePlaceCard place={place} emoji={emoji} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="Vibe">
            <select
              className={INPUT}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
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
                  aria-label={`${"$".repeat(p)} price level`}
                >
                  {"$".repeat(p)}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="One-liner" hint="What a friend would say recommending this place.">
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="e.g. Mediterranean tasting menu on a candle-lit rooftop with mountain views."
            rows={2}
            maxLength={180}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-secondary/60"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {pitch.length} / 180
          </p>
        </Field>

        <Field label="Cover photo (optional · we use Google's for now)">
          <button
            type="button"
            className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-[12px] text-muted-foreground transition hover:bg-muted/50"
          >
            <Camera className="h-4 w-4" />
            Upload your own · skip for now
          </button>
        </Field>
      </form>

      <Footer
        backLabel="Pick another"
        onBack={onBack}
        primary={{ label: "Continue", state: "idle" }}
        primaryType="submit"
        onPrimary={onNext}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Channels & links (5×2 grid, all optional)
// ---------------------------------------------------------------------------

function ChannelsStep({
  place,
  instagram,
  setInstagram,
  whatsapp,
  setWhatsapp,
  website,
  setWebsite,
  phone,
  setPhone,
  tiktok,
  setTiktok,
  facebook,
  setFacebook,
  openTable,
  setOpenTable,
  resy,
  setResy,
  rappi,
  setRappi,
  uberEats,
  setUberEats,
  loading,
  done,
  onSubmit,
  onBack,
  onClose,
}: {
  place: PlaceDetails;
  instagram: string;
  setInstagram: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  tiktok: string;
  setTiktok: (v: string) => void;
  facebook: string;
  setFacebook: (v: string) => void;
  openTable: string;
  setOpenTable: (v: string) => void;
  resy: string;
  setResy: (v: string) => void;
  rappi: string;
  setRappi: (v: string) => void;
  uberEats: string;
  setUberEats: (v: string) => void;
  loading: boolean;
  done: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const emoji = useMemo(
    () => emojiForTypes(place.primaryType, place.types),
    [place.primaryType, place.types],
  );

  return (
    <>
      <Header
        step="3 of 3"
        iconNode={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-gradient text-lg shadow-sm">
            {emoji}
          </span>
        }
        title="Channels & links"
        subtitle="Drop every place the venue lives online. All optional — we'll auto-fill the rest of the profile from whatever you give us."
        onClose={onClose}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex-1 overflow-y-auto px-6 pt-5 pb-2"
      >
        <GooglePlaceCard place={place} emoji={emoji} />

        <p className="mt-4 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          10 channels · all optional
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Instagram">
            <SocialInput
              Icon={Instagram}
              value={instagram}
              onChange={setInstagram}
              placeholder="@yourvenue"
            />
          </Field>
          <Field label="WhatsApp">
            <SocialInput
              Icon={MessageCircle}
              value={whatsapp}
              onChange={setWhatsapp}
              placeholder="wa.me/..."
            />
          </Field>

          <Field label="Website">
            <SocialInput
              Icon={Globe}
              value={website}
              onChange={setWebsite}
              placeholder="venue.mx"
            />
          </Field>
          <Field label="Phone">
            <SocialInput
              Icon={Phone}
              value={phone}
              onChange={setPhone}
              placeholder="+52 81 ..."
            />
          </Field>

          <Field label="TikTok">
            <SocialInput
              Icon={Music2}
              value={tiktok}
              onChange={setTiktok}
              placeholder="@handle"
            />
          </Field>
          <Field label="Facebook">
            <SocialInput
              Icon={Facebook}
              value={facebook}
              onChange={setFacebook}
              placeholder="page name or URL"
            />
          </Field>

          <Field label="OpenTable">
            <SocialInput
              Icon={CalendarCheck}
              value={openTable}
              onChange={setOpenTable}
              placeholder="opentable.com/r/..."
            />
          </Field>
          <Field label="Resy">
            <SocialInput
              Icon={CalendarHeart}
              value={resy}
              onChange={setResy}
              placeholder="resy.com/cities/..."
            />
          </Field>

          <Field label="Rappi">
            <SocialInput
              Icon={Bike}
              value={rappi}
              onChange={setRappi}
              placeholder="store slug or URL"
            />
          </Field>
          <Field label="Uber Eats">
            <SocialInput
              Icon={ShoppingBag}
              value={uberEats}
              onChange={setUberEats}
              placeholder="store slug or URL"
            />
          </Field>
        </div>
      </form>

      <Footer
        backLabel="Back"
        onBack={onBack}
        primary={{
          label: done ? "Created" : loading ? "Creating…" : "Create unit",
          state: done ? "done" : loading ? "loading" : "idle",
        }}
        primaryType="submit"
        onPrimary={onSubmit}
        disabled={loading || done}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function Header({
  step,
  iconNode,
  title,
  subtitle,
  onClose,
}: {
  step: string;
  iconNode: React.ReactNode;
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
            New unit · step {step}
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

function Footer({
  backLabel,
  onBack,
  primary,
  primaryType,
  onPrimary,
  disabled,
}: {
  backLabel: string;
  onBack: () => void;
  primary: { label: string; state: "idle" | "loading" | "done" };
  primaryType: "button" | "submit";
  onPrimary: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border bg-background/60 px-6 py-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold transition hover:bg-muted"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </button>
      <button
        type={primaryType}
        disabled={disabled}
        onClick={onPrimary}
        className="inline-flex items-center gap-2 rounded-full bg-pink-gradient px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition disabled:opacity-60"
      >
        {primary.state === "done" ? (
          <>
            <Check className="h-4 w-4" />
            {primary.label}
          </>
        ) : primary.state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {primary.label}
          </>
        ) : (
          <>
            {primary.label}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

function SocialInput({
  Icon,
  value,
  onChange,
  placeholder,
  required,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        className={cn(INPUT, "pl-8")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={120}
        required={required}
      />
    </div>
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
