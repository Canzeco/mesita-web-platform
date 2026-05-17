"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  MapPin,
  DollarSign,
  Sparkles,
  Globe,
  Clock,
  Instagram,
  Facebook,
  Music2,
  MessageCircle,
  Phone,
  CalendarCheck,
  CalendarHeart,
  ShoppingBag,
  Bike,
  Play,
  BadgeCheck,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  Pencil,
  Tag,
  Shirt,
  Plus,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { VENUE } from "@/lib/manager-data";
import { cn } from "@/lib/utils";

const PRICE_LEVELS = [1, 2, 3, 4] as const;
type PriceLevel = (typeof PRICE_LEVELS)[number];

const CATEGORIES = [
  "Mediterranean", "Italian", "French", "Mexican", "Spanish", "American",
  "Japanese", "Sushi", "Ramen", "Korean", "Chinese", "Thai", "Indian",
  "Middle Eastern", "Peruvian", "Argentinian", "Steakhouse", "Seafood",
  "Pizza", "Tacos", "Burger", "BBQ", "Fine dining", "Café", "Bakery",
  "Brunch", "Tea house", "Dessert", "Ice cream", "Healthy", "Vegan",
  "Cocktails", "Wine bar", "Beer bar", "Speakeasy", "Lounge", "Nightclub",
];

export default function PlacePage() {
  const [name, setName] = useState(VENUE.name);
  const [category, setCategory] = useState<string>(VENUE.category);
  const [priceLevel, setPriceLevel] = useState<PriceLevel>(3);
  const [pitch, setPitch] = useState(
    "Mediterranean tasting menu on a candle-lit rooftop with sweeping mountain views.",
  );
  const [vibe, setVibe] = useState("Rooftop");
  const [story, setStory] = useState(
    "Casa Luminar opened in 2023 above an old textile building, run by a partnership between chef Iván Solís (ex-Pujol) and sommelier María Vela. Mediterranean-leaning tasting menu, deep natural-wine list, candle-lit rooftop with mountain views, late-night vermouth hour.",
  );
  const [dressCode, setDressCode] = useState("Smart casual");
  const [tags, setTags] = useState(
    "rooftop · tasting menu · natural wine · late-night vermouth · sunset",
  );
  const [menuMode, setMenuMode] = useState<"pdf" | "link">("pdf");
  const [menuUrl, setMenuUrl] = useState("");

  const completeness = useMemo(() => {
    const checks = [
      name.trim().length > 0,
      category.length > 0,
      pitch.trim().length > 20,
      story.trim().length > 40,
      tags.trim().length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [name, category, pitch, story, tags]);

  return (
    <>
      <Topbar
        title="Place"
        subtitle="Edit how guests discover and experience your venue on Mesita."
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-6 space-y-6">
          <PlaceHeader
            completeness={completeness}
            name={name}
            category={category}
          />

          <HeroCard
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
            vibe={vibe}
            priceLevel={priceLevel}
          />

          <MediaCatalogSection />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <PriceSection price={priceLevel} setPrice={setPriceLevel} />
            <LocationSection />
          </div>

          <MoreStuffSection
            pitch={pitch}
            setPitch={setPitch}
            vibe={vibe}
            setVibe={setVibe}
            story={story}
            setStory={setStory}
            dressCode={dressCode}
            setDressCode={setDressCode}
            tags={tags}
            setTags={setTags}
          />

          <ExternalLinksSection />

          <ChannelSummariesSection />

          <MenuSection
            mode={menuMode}
            setMode={setMenuMode}
            url={menuUrl}
            setUrl={setMenuUrl}
          />

          <HoursSection />
        </div>

        <SaveBar />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function PlaceHeader({
  completeness,
  name,
  category,
}: {
  completeness: number;
  name: string;
  category: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Profile health
        </p>
        <h2 className="mt-1 truncate font-display text-xl font-semibold tracking-tight">
          {name}
          <span className="font-normal text-muted-foreground"> · {category}</span>
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 max-w-xs flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-pink-gradient transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <span className="shrink-0 text-[12px] font-semibold tabular-nums text-muted-foreground">
            {completeness}% complete
          </span>
        </div>
      </div>
      <Link
        href="/guest/venue/casa-luminar"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-pink-gradient px-4 py-2.5 text-[13px] font-semibold text-white shadow-glow transition hover:opacity-95"
      >
        <Eye className="h-4 w-4" />
        Preview as guest
      </Link>
    </div>
  );
}

function SaveBar() {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-background/90 px-6 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <p className="hidden text-[12px] text-muted-foreground sm:block">
          Changes are saved to your unit · guests see updates within a few minutes
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold transition hover:bg-muted"
          >
            Discard
          </button>
          <button
            type="button"
            className="rounded-full bg-pink-gradient px-5 py-2 text-[13px] font-semibold text-white shadow-glow transition hover:opacity-95"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function HeroCard({
  name,
  setName,
  category,
  setCategory,
  vibe,
  priceLevel,
}: {
  name: string;
  setName: (s: string) => void;
  category: string;
  setCategory: (s: string) => void;
  vibe: string;
  priceLevel: PriceLevel;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-56 w-full sm:h-64">
        <Image
          src={VENUE.cover}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 768px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-white"
        >
          <Camera className="h-3.5 w-3.5" />
          Replace cover
        </button>
        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-secondary/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground shadow-sm">
          <BadgeCheck className="h-3 w-3" />
          Verified Partner
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
            {vibe} · {"$".repeat(priceLevel)}
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-transparent font-display text-2xl font-semibold tracking-tight text-white outline-none placeholder:text-white/50 sm:text-3xl"
            maxLength={80}
            placeholder="Venue name"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <FieldBlock label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={INPUT}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FieldBlock>
        <FieldBlock label="Neighborhood">
          <input
            readOnly
            value={`${VENUE.area}, ${VENUE.city}`}
            className={cn(INPUT, "cursor-default bg-muted/40 text-muted-foreground")}
          />
        </FieldBlock>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

function MediaCatalogSection() {
  const media = [
    { type: "video" as const, src: VENUE.photos[0] },
    ...VENUE.photos.map((src) => ({ type: "image" as const, src })),
    { type: "image" as const, src: VENUE.cover },
    { type: "image" as const, src: VENUE.cover },
    { type: "image" as const, src: VENUE.cover },
  ].slice(0, 7);

  const [featured, ...rest] = media;

  return (
    <Card>
      <CardTitle
        Icon={Camera}
        title="Photos & video"
        sub="First image is your cover. Drag to reorder — up to 30 assets."
        trailing={
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-muted-foreground sm:inline">
              <span className="font-semibold text-foreground">{media.length}</span> / 30
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold transition hover:bg-muted"
            >
              <Upload className="h-3 w-3" />
              Upload
            </button>
          </div>
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="group relative aspect-[5/4] overflow-hidden rounded-2xl border border-border sm:aspect-auto sm:min-h-[220px]">
          <Image src={featured.src} alt="" fill sizes="400px" className="object-cover" />
          {featured.type === "video" && (
            <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Play className="h-3 w-3" />
              Video
            </span>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-pink-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Cover
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-2">
          {rest.map((m, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <Image src={m.src} alt="" fill sizes="120px" className="object-cover" />
              {m.type === "video" && (
                <span className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                  <Play className="h-2.5 w-2.5" />
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground transition hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px] font-semibold">Add</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Price & location
// ---------------------------------------------------------------------------

function PriceSection({
  price,
  setPrice,
}: {
  price: PriceLevel;
  setPrice: (p: PriceLevel) => void;
}) {
  return (
    <Card className="lg:col-span-2">
      <CardTitle Icon={DollarSign} title="Price level" trailing={<FromGoogle />} />
      <div className="mt-4 flex gap-2">
        {PRICE_LEVELS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPrice(p)}
            className={cn(
              "flex h-11 flex-1 items-center justify-center rounded-xl border text-sm font-bold tracking-wider transition",
              price === p
                ? "border-secondary bg-secondary/10 text-secondary shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-secondary/30 hover:text-foreground",
            )}
          >
            {"$".repeat(p)}
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">
        Google suggests <span className="font-semibold text-foreground">{"$".repeat(3)}</span> — tap
        to override if guests expect something different.
      </p>
    </Card>
  );
}

function LocationSection() {
  return (
    <Card className="lg:col-span-3">
      <CardTitle Icon={MapPin} title="Address" trailing={<FromGoogle />} />
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <div className="relative h-36 w-full bg-[oklch(0.96_0.014_12)]">
          <svg
            viewBox="0 0 400 144"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <pattern id="grid-place-v2" width="24" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="oklch(0.90 0.012 10)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="400" height="144" fill="url(#grid-place-v2)" />
            <path
              d="M0,72 C80,40 160,100 240,68 C300,45 360,85 400,72"
              stroke="oklch(0.75 0.14 75)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-gradient shadow-glow ring-4 ring-card">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </span>
          </span>
        </div>
        <div className="border-t border-border bg-card p-4">
          <p className="font-medium leading-snug">
            Av. Presidente Masaryk 244, Polanco V Secc, 11560 CDMX
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {VENUE.area} · {VENUE.city} · synced 2 min ago
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-[12px] font-semibold text-background transition hover:opacity-90"
            >
              <ExternalLink className="h-3 w-3" />
              Open in Maps
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12px] font-semibold transition hover:bg-muted"
            >
              <RefreshCw className="h-3 w-3" />
              Re-sync from Google
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// External links
// ---------------------------------------------------------------------------

const LINK_GROUPS = [
  {
    title: "Social & contact",
    items: [
      { label: "Instagram", Icon: Instagram, placeholder: "@yourvenue", value: "@casaluminar" },
      { label: "TikTok", Icon: Music2, placeholder: "@handle", value: "@casaluminar" },
      { label: "Facebook", Icon: Facebook, placeholder: "page name", value: "casaluminar" },
      { label: "WhatsApp", Icon: MessageCircle, placeholder: "wa.me/...", value: "wa.me/5215555551234" },
      { label: "Website", Icon: Globe, placeholder: "venue.mx", value: "casaluminar.mx" },
      { label: "Phone", Icon: Phone, placeholder: "+52 81 ...", value: "+52 81 1234 5678" },
    ],
  },
  {
    title: "Reservations",
    items: [
      { label: "OpenTable", Icon: CalendarCheck, placeholder: "opentable.com/r/...", value: "" },
      { label: "Resy", Icon: CalendarHeart, placeholder: "resy.com/cities/...", value: "" },
    ],
  },
  {
    title: "Delivery",
    items: [
      { label: "Uber Eats", Icon: ShoppingBag, placeholder: "store slug", value: "casaluminar-polanco" },
      { label: "Rappi", Icon: Bike, placeholder: "store slug", value: "" },
    ],
  },
] as const;

function ExternalLinksSection() {
  return (
    <Card>
      <CardTitle
        Icon={LinkIcon}
        title="External channels"
        sub="Social, reservations, and delivery — all optional, all power your channel summaries."
      />
      <div className="mt-5 space-y-5">
        {LINK_GROUPS.map((group, idx) => (
          <div key={group.title} className={idx > 0 ? "border-t border-border pt-5" : undefined}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {group.title}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.items.map((l) => (
                <FieldBlock key={l.label} label={l.label}>
                  <div className="relative">
                    <l.Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      defaultValue={l.value}
                      placeholder={l.placeholder}
                      className={cn(INPUT, "pl-9", !l.value && "border-dashed")}
                      maxLength={120}
                    />
                  </div>
                </FieldBlock>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Story / AI fill
// ---------------------------------------------------------------------------

function MoreStuffSection({
  pitch,
  setPitch,
  vibe,
  setVibe,
  story,
  setStory,
  dressCode,
  setDressCode,
  tags,
  setTags,
}: {
  pitch: string;
  setPitch: (s: string) => void;
  vibe: string;
  setVibe: (s: string) => void;
  story: string;
  setStory: (s: string) => void;
  dressCode: string;
  setDressCode: (s: string) => void;
  tags: string;
  setTags: (s: string) => void;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CardTitle
          Icon={Sparkles}
          title="Profile copy"
          sub="Perplexity drafts from your socials — edit anything that's off."
        />
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pink-gradient px-4 py-2 text-[12px] font-semibold text-white shadow-glow"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Auto-fill with AI
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <FieldBlock label="One-liner">
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            rows={2}
            maxLength={180}
            className={TEXTAREA}
          />
          <CharCount current={pitch.length} max={180} />
        </FieldBlock>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldBlock label="Vibe">
            <input value={vibe} onChange={(e) => setVibe(e.target.value)} className={INPUT} maxLength={40} />
          </FieldBlock>
          <FieldBlock label="Dress code" icon={<Shirt className="h-3 w-3" />}>
            <input
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              className={INPUT}
              maxLength={60}
            />
          </FieldBlock>
        </div>

        <FieldBlock label="The story">
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={5}
            maxLength={1200}
            className={TEXTAREA}
          />
          <CharCount current={story.length} max={1200} />
        </FieldBlock>

        <FieldBlock label="Tags & specialties" icon={<Tag className="h-3 w-3" />}>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="rooftop · natural wine · late-night"
            className={INPUT}
            maxLength={200}
          />
        </FieldBlock>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Channel summaries
// ---------------------------------------------------------------------------

type ChannelStatus = "fresh" | "stale" | "missing" | "error";

type ChannelSummary = {
  key: string;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  identity: string | null;
  metrics: { label: string; value: string }[];
  lastSync: string;
  status: ChannelStatus;
  source: "official-api" | "scraper";
};

const CHANNEL_SUMMARIES: ChannelSummary[] = [
  {
    key: "google",
    name: "Google Business",
    Icon: Globe,
    identity: "ChIJ7c2…HXBg",
    metrics: [
      { label: "Rating", value: "4.7" },
      { label: "Reviews", value: "1,284" },
    ],
    lastSync: "2 min ago",
    status: "fresh",
    source: "official-api",
  },
  {
    key: "instagram",
    name: "Instagram",
    Icon: Instagram,
    identity: "@casaluminar",
    metrics: [
      { label: "Followers", value: "12.4k" },
      { label: "Engagement", value: "3.8%" },
    ],
    lastSync: "12 min ago",
    status: "fresh",
    source: "scraper",
  },
  {
    key: "facebook",
    name: "Facebook",
    Icon: Facebook,
    identity: "casaluminar",
    metrics: [
      { label: "Followers", value: "8.7k" },
      { label: "Rating", value: "4.2" },
    ],
    lastSync: "1 h ago",
    status: "fresh",
    source: "scraper",
  },
  {
    key: "tiktok",
    name: "TikTok",
    Icon: Music2,
    identity: "@casaluminar",
    metrics: [
      { label: "Followers", value: "45.2k" },
      { label: "Likes", value: "12.8M" },
    ],
    lastSync: "1 h ago",
    status: "fresh",
    source: "scraper",
  },
  {
    key: "website",
    name: "Website",
    Icon: Globe,
    identity: "casaluminar.mx",
    metrics: [
      { label: "Status", value: "Up" },
      { label: "Pages", value: "47" },
    ],
    lastSync: "2 h ago",
    status: "fresh",
    source: "scraper",
  },
  {
    key: "ubereats",
    name: "Uber Eats",
    Icon: ShoppingBag,
    identity: "casaluminar-polanco",
    metrics: [
      { label: "Rating", value: "4.6" },
      { label: "Orders", value: "1.2k" },
    ],
    lastSync: "6 h ago",
    status: "stale",
    source: "scraper",
  },
  {
    key: "opentable",
    name: "OpenTable",
    Icon: CalendarCheck,
    identity: null,
    metrics: [],
    lastSync: "Not linked",
    status: "missing",
    source: "scraper",
  },
  {
    key: "resy",
    name: "Resy",
    Icon: CalendarHeart,
    identity: null,
    metrics: [],
    lastSync: "Not linked",
    status: "missing",
    source: "scraper",
  },
  {
    key: "rappi",
    name: "Rappi",
    Icon: Bike,
    identity: null,
    metrics: [],
    lastSync: "Not linked",
    status: "missing",
    source: "scraper",
  },
];

function ChannelSummariesSection() {
  const linked = CHANNEL_SUMMARIES.filter((c) => c.identity != null);
  const missing = CHANNEL_SUMMARIES.filter((c) => c.identity == null);

  return (
    <Card>
      <CardTitle
        Icon={RefreshCw}
        title="Live channel metrics"
        sub="Synced from every linked platform — feeds Discover ranking and Copilot."
        trailing={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[12px] font-semibold text-background transition hover:opacity-90"
          >
            <RefreshCw className="h-3 w-3" />
            Re-sync
          </button>
        }
      />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {linked.map((c) => (
          <ChannelCard key={c.key} channel={c} />
        ))}
      </div>
      {missing.length > 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
          <p className="text-[12px] font-semibold text-muted-foreground">
            {missing.length} channels not linked
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Add links above to pull metrics into Discover and Copilot.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.map((c) => (
              <span
                key={c.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                <c.Icon className="h-3 w-3" />
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ChannelCard({ channel }: { channel: ChannelSummary }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition hover:border-secondary/20 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <channel.Icon className="h-4 w-4" />
        </span>
        <StatusPill status={channel.status} source={channel.source} />
      </div>
      <p className="mt-3 font-display text-sm font-semibold">{channel.name}</p>
      <p className="truncate font-mono text-[11px] text-muted-foreground">{channel.identity}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {channel.metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-muted/40 px-2.5 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {m.label}
            </p>
            <p className="font-display text-base font-bold tabular-nums">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] text-muted-foreground">{channel.lastSync}</span>
        <button
          type="button"
          aria-label={`Re-sync ${channel.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function StatusPill({
  status,
  source,
}: {
  status: ChannelStatus;
  source: ChannelSummary["source"];
}) {
  if (status === "missing") return null;
  const cls = {
    fresh: "bg-secondary/15 text-secondary",
    stale: "bg-tier-gold/30 text-foreground",
    error: "bg-destructive/15 text-destructive",
  }[status as "fresh" | "stale" | "error"];
  const label = status === "fresh" ? "Fresh" : status === "stale" ? "Stale" : "Error";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        cls,
      )}
      title={source === "official-api" ? "Official API" : "Web scraper"}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

function MenuSection({
  mode,
  setMode,
  url,
  setUrl,
}: {
  mode: "pdf" | "link";
  setMode: (m: "pdf" | "link") => void;
  url: string;
  setUrl: (u: string) => void;
}) {
  return (
    <Card>
      <CardTitle
        Icon={LinkIcon}
        title="Menu"
        sub="What guests open on-site. Upload a PDF or link a page we refresh every 24h."
        trailing={
          <div className="flex rounded-full border border-border bg-muted/30 p-1 text-[12px] font-semibold">
            <button
              type="button"
              onClick={() => setMode("pdf")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 transition",
                mode === "pdf" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground",
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              PDF
            </button>
            <button
              type="button"
              onClick={() => setMode("link")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 transition",
                mode === "link" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground",
              )}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Link
            </button>
          </div>
        }
      />

      {mode === "pdf" ? (
        <button
          type="button"
          className="mt-5 flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground transition hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <Upload className="h-5 w-5" />
          </span>
          <span className="text-[13px] font-semibold">Drop menu.pdf or click to upload</span>
          <span className="text-[11px]">Replace any time — guests always see the latest</span>
        </button>
      ) : (
        <FieldBlock label="Menu URL" hint="Re-fetched every 24h for seasonal updates." className="mt-5">
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://casaluminar.mx/menu"
              className={cn(INPUT, "pl-9")}
            />
          </div>
        </FieldBlock>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Hours
// ---------------------------------------------------------------------------

const TODAY_INDEX = new Date().getDay();
const DAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function HoursSection() {
  return (
    <Card>
      <CardTitle
        Icon={Clock}
        title="Weekly schedule"
        trailing={<FromGoogle />}
        sub="Override individual days only when Google is consistently wrong."
      />
      <div className="mt-4 space-y-1.5">
        {VENUE.hours.map((h) => {
          const isToday = DAY_TO_INDEX[h.day] === TODAY_INDEX;
          const closed = h.range.toLowerCase() === "closed";
          return (
            <div
              key={h.day}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition",
                isToday
                  ? "border-secondary/30 bg-secondary/5"
                  : "border-transparent bg-muted/30 hover:border-border",
              )}
            >
              <span
                className={cn(
                  "w-11 text-[11px] font-bold uppercase tracking-wider",
                  isToday ? "text-secondary" : "text-muted-foreground",
                )}
              >
                {h.day}
                {isToday && (
                  <span className="mt-0.5 block text-[9px] font-semibold normal-case tracking-normal">
                    Today
                  </span>
                )}
              </span>
              <input
                defaultValue={h.range}
                className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-medium tabular-nums outline-none transition focus:border-border focus:bg-background"
              />
              <span
                className={cn(
                  "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-flex",
                  closed ? "bg-muted text-muted-foreground" : "bg-secondary/15 text-secondary",
                )}
              >
                {closed ? "Closed" : "Open"}
              </span>
              <button
                type="button"
                aria-label="Edit"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-[12px] font-semibold text-muted-foreground transition hover:border-secondary/30 hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add special hours (holiday, private event)
      </button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Shared UI
// ---------------------------------------------------------------------------

const INPUT =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-secondary/60 focus:ring-2 focus:ring-secondary/10";

const TEXTAREA =
  "w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-secondary/60 focus:ring-2 focus:ring-secondary/10";

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5", className)}>
      {children}
    </section>
  );
}

function CardTitle({
  Icon,
  title,
  sub,
  trailing,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-base font-semibold leading-tight tracking-tight">
            {title}
          </p>
          {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {trailing}
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  icon,
  className,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <p className="mt-1 text-right text-[10px] text-muted-foreground">
      {current} / {max}
    </p>
  );
}

function FromGoogle() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary">
      <Globe className="h-3 w-3" />
      Google
    </span>
  );
}

