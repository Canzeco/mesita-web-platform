"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  MapPin,
  DollarSign,
  Link2,
  Sparkles,
  Globe,
  FileText,
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

  return (
    <>
      <Topbar title="Place" subtitle="The full profile guests see across Mesita." />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-6">
          <HeroCard
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
          />

          <MediaCatalogSection />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <PriceSection price={priceLevel} setPrice={setPriceLevel} />
            <LocationSection />
          </div>

          <ExternalLinksSection />

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

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <GoogleSummarySection />
            <MenuSection
              mode={menuMode}
              setMode={setMenuMode}
              url={menuUrl}
              setUrl={setMenuUrl}
            />
          </div>

          <HoursSection />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Hero — name + category
// ---------------------------------------------------------------------------

function HeroCard({
  name,
  setName,
  category,
  setCategory,
}: {
  name: string;
  setName: (s: string) => void;
  category: string;
  setCategory: (s: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative h-52 w-full">
        <Image
          src={VENUE.cover}
          alt={name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[12px] font-semibold shadow-sm backdrop-blur"
        >
          <Camera className="h-3.5 w-3.5" />
          Replace cover
        </button>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-secondary/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary-foreground shadow-sm">
          <BadgeCheck className="h-3 w-3" />
          Verified Partner
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
        <FieldBlock label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
            maxLength={80}
          />
        </FieldBlock>
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
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Media catalog
// ---------------------------------------------------------------------------

function MediaCatalogSection() {
  const media = [
    { type: "video" as const, src: VENUE.photos[0] },
    ...VENUE.photos.map((src) => ({ type: "image" as const, src })),
    { type: "image" as const, src: VENUE.cover },
    { type: "image" as const, src: VENUE.cover },
    { type: "image" as const, src: VENUE.cover },
  ].slice(0, 7);

  return (
    <Card
      Icon={Camera}
      title="Media catalog"
      trailing={
        <span className="text-[11px] text-muted-foreground">
          {media.length} of 30 · drag to reorder
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {media.map((m, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            <Image src={m.src} alt="" fill sizes="160px" className="object-cover" />
            {m.type === "video" && (
              <span className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                <Play className="h-2.5 w-2.5" />
              </span>
            )}
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-md bg-pink-gradient px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm">
                Cover
              </span>
            )}
          </div>
        ))}
        <button
          type="button"
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-secondary/40 hover:bg-secondary/5 hover:text-secondary"
        >
          <Upload className="h-4 w-4" />
          <span className="text-[10px] font-semibold">Add</span>
        </button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Price (Google)
// ---------------------------------------------------------------------------

function PriceSection({
  price,
  setPrice,
}: {
  price: PriceLevel;
  setPrice: (p: PriceLevel) => void;
}) {
  return (
    <Card Icon={DollarSign} title="Price" trailing={<FromGoogle />}>
      <div className="flex gap-1.5">
        {PRICE_LEVELS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPrice(p)}
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-xl border text-base font-bold tracking-wider transition",
              price === p
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {"$".repeat(p)}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">
        Google says <span className="font-semibold text-foreground">{"$".repeat(3)}</span> — override
        if it&apos;s off.
      </p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Location (Google)
// ---------------------------------------------------------------------------

function LocationSection() {
  return (
    <Card
      Icon={MapPin}
      title="Location"
      trailing={<FromGoogle />}
      cols="lg:col-span-2"
    >
      <div className="flex items-start gap-4">
        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-border bg-[oklch(0.97_0.012_15)]">
          <svg
            viewBox="0 0 200 120"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <pattern id="grid-place" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="oklch(0.90 0.015 10)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="200" height="120" fill="url(#grid-place)" />
            <path
              d="M-10,55 C40,30 110,80 150,50 C180,30 200,60 210,55"
              stroke="oklch(0.78 0.16 80)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
          </svg>
          <span className="absolute left-1/2 top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pink-gradient ring-4 ring-card">
            <span className="block h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">
            Av. Presidente Masaryk 244, Polanco V Secc, 11560 CDMX
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {VENUE.area} · {VENUE.city} · 0.4 km from Mesita HQ pin
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold transition hover:bg-muted"
            >
              Open in Maps
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold transition hover:bg-muted"
            >
              <RefreshCw className="h-3 w-3" />
              Re-sync
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// External links — the 10
// ---------------------------------------------------------------------------

function ExternalLinksSection() {
  const links = [
    { label: "Instagram", Icon: Instagram, placeholder: "@yourvenue", value: "@casaluminar" },
    { label: "WhatsApp", Icon: MessageCircle, placeholder: "wa.me/...", value: "wa.me/5215555551234" },
    { label: "Website", Icon: Globe, placeholder: "venue.mx", value: "casaluminar.mx" },
    { label: "Phone", Icon: Phone, placeholder: "+52 81 ...", value: "+52 81 1234 5678" },
    { label: "TikTok", Icon: Music2, placeholder: "@handle", value: "@casaluminar" },
    { label: "Facebook", Icon: Facebook, placeholder: "page name", value: "casaluminar" },
    { label: "OpenTable", Icon: CalendarCheck, placeholder: "opentable.com/r/...", value: "" },
    { label: "Resy", Icon: CalendarHeart, placeholder: "resy.com/cities/...", value: "" },
    { label: "Rappi", Icon: Bike, placeholder: "store slug", value: "" },
    { label: "Uber Eats", Icon: ShoppingBag, placeholder: "store slug", value: "casaluminar-polanco" },
  ];
  return (
    <Card
      Icon={Link2}
      title="External links"
      trailing={
        <span className="text-[11px] text-muted-foreground">10 channels · all optional</span>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <FieldBlock key={l.label} label={l.label}>
            <div className="relative">
              <l.Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                defaultValue={l.value}
                placeholder={l.placeholder}
                className={cn(INPUT, "pl-8")}
                maxLength={120}
              />
            </div>
          </FieldBlock>
        ))}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// More stuff — AI fillable
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
    <Card
      Icon={Sparkles}
      title="Fill the profile"
      trailing={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-pink-gradient px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm"
        >
          <Sparkles className="h-3 w-3" />
          Auto-fill with AI
        </button>
      }
      sub="Pulled by Perplexity from your social links + press mentions. Edit anything that's off."
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <FieldBlock label="One-liner / pitch">
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            rows={2}
            maxLength={180}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-secondary/60"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {pitch.length} / 180
          </p>
        </FieldBlock>
        <FieldBlock label="Vibe">
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className={INPUT}
            maxLength={40}
          />
        </FieldBlock>
      </div>

      <FieldBlock label="The story">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={5}
          maxLength={1200}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-secondary/60"
        />
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {story.length} / 1200
        </p>
      </FieldBlock>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <FieldBlock label="Dress code" icon={<Shirt className="h-3 w-3" />}>
          <input
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
            className={INPUT}
            maxLength={60}
          />
        </FieldBlock>
        <FieldBlock label="Tags / specialties" icon={<Tag className="h-3 w-3" />}>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma- or dot-separated"
            className={INPUT}
            maxLength={200}
          />
        </FieldBlock>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Google business summary
// ---------------------------------------------------------------------------

function GoogleSummarySection() {
  return (
    <Card
      Icon={Globe}
      title="Google Business summary"
      trailing={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold transition hover:bg-muted"
        >
          <RefreshCw className="h-3 w-3" />
          Re-sync
        </button>
      }
      sub="What Google currently says about this place. Last synced 2 min ago."
    >
      <dl className="flex flex-col gap-2 text-sm">
        <Row label="Place ID">
          <span className="font-mono text-[12px]">ChIJ7c2…HXBg</span>
        </Row>
        <Row label="Google rating">
          <span className="font-semibold">4.7 · 1,284 reviews</span>
        </Row>
        <Row label="Primary category">
          <span>{VENUE.category}</span>
        </Row>
        <Row label="Phone (Google)">
          <span>+52 81 1234 5678</span>
        </Row>
        <Row label="Website (Google)">
          <span className="text-secondary">{VENUE.contact.website}</span>
        </Row>
        <Row label="Open now">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-semibold text-secondary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
            Yes
          </span>
        </Row>
      </dl>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Menu — PDF or dynamic link
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
    <Card Icon={FileText} title="Menu" sub="Guests open this from the venue page.">
      <div className="flex rounded-full border border-border bg-background p-1 text-[12px] font-semibold">
        <button
          type="button"
          onClick={() => setMode("pdf")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition",
            mode === "pdf" ? "bg-foreground text-background" : "text-muted-foreground",
          )}
        >
          <Upload className="h-3 w-3" />
          PDF upload
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition",
            mode === "link" ? "bg-foreground text-background" : "text-muted-foreground",
          )}
        >
          <LinkIcon className="h-3 w-3" />
          Dynamic link
        </button>
      </div>

      {mode === "pdf" ? (
        <button
          type="button"
          className="mt-3 flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-secondary/40 hover:bg-secondary/5"
        >
          <Upload className="h-5 w-5" />
          <span className="text-[12px] font-semibold">Drop menu.pdf or click to upload</span>
          <span className="text-[10px]">Re-uploadable any time</span>
        </button>
      ) : (
        <FieldBlock
          label="Menu URL"
          hint="We re-fetch every 24h so seasonal menus stay current."
        >
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://casaluminar.mx/menu"
              className={cn(INPUT, "pl-8 mt-3")}
            />
          </div>
        </FieldBlock>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Hours (Google)
// ---------------------------------------------------------------------------

function HoursSection() {
  return (
    <Card
      Icon={Clock}
      title="Hours"
      trailing={<FromGoogle />}
      sub="Pulled from Google Business — overrides only when they're consistently wrong."
    >
      <div className="overflow-hidden rounded-2xl border border-border">
        {VENUE.hours.map((h, i) => (
          <div
            key={h.day}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm",
              i < VENUE.hours.length - 1 && "border-b border-border",
            )}
          >
            <span className="w-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {h.day}
            </span>
            <input
              defaultValue={h.range}
              className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-medium tabular-nums outline-none transition focus:border-border focus:bg-background"
            />
            <button
              type="button"
              aria-label="Edit"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <Plus className="h-3 w-3" />
        Add a special day (holiday, private event)
      </button>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const INPUT =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-secondary/60";

function Card({
  Icon,
  title,
  sub,
  trailing,
  children,
  cols,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  cols?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5", cols)}>
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
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FieldBlock({
  label,
  hint,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-0">
      <dt className="text-[12px] text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm">{children}</dd>
    </div>
  );
}

function FromGoogle() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary">
      <Globe className="h-3 w-3" />
      From Google
    </span>
  );
}
