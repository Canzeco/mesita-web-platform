"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  Sparkles,
  Globe,
  X,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Instagram,
  Facebook,
  MessageCircle,
  Music2,
  CalendarCheck,
  Bike,
} from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiUpdateVenue, type MyVenue, type UpdateVenueInput } from "@/lib/api/venues";
import { cn } from "@/lib/utils";

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";
const TEXTAREA =
  "min-h-[100px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-foreground/40";

const PRICE_OPTIONS = [
  { value: "", label: "—" },
  { value: "1", label: "$ · Budget" },
  { value: "2", label: "$$ · Casual" },
  { value: "3", label: "$$$ · Upscale" },
  { value: "4", label: "$$$$ · Fine dining" },
];

const STATUS_OPTIONS: { value: "active" | "paused" | "archived"; label: string }[] = [
  { value: "active", label: "Active — visible to guests" },
  { value: "paused", label: "Paused — temporarily hidden" },
  { value: "archived", label: "Archived — closed permanently" },
];

const FISCAL_OPTIONS: {
  value: "formal" | "informal";
  label: string;
  hint: string;
}[] = [
  {
    value: "formal",
    label: "Formal — invoices + cashback",
    hint: "You issue invoices by default. Payments run through Mesita; cashback lands in the guest's wallet.",
  },
  {
    value: "informal",
    label: "Informal — cash + instant discount",
    hint: "You operate in cash. Mesita reveals the discount; the guest pays you directly. No cashback wallet for this venue.",
  },
];

type Status = "active" | "paused" | "archived";
type Fiscal = "formal" | "informal";

type LinksState = {
  website_url: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  whatsapp_url: string;
  opentable_url: string;
  resy_url: string;
  uber_eats_url: string;
  rappi_url: string;
};

function nullableUrl(v: string): string | null {
  const t = v.trim();
  if (t === "") return null;
  // Auto-upgrade to https so the server-side validator (which requires
  // https://) doesn't reject perfectly reasonable input. Covers:
  //   - "instagram.com/foo"  →  "https://instagram.com/foo"
  //   - "http://yourplace.mx" → "https://yourplace.mx"
  if (/^https:\/\//i.test(t)) return t;
  if (/^http:\/\//i.test(t)) return t.replace(/^http:/i, "https:");
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(t)) return `https://${t}`;
  return t;
}

export function EditVenueForm({ venue }: { venue: MyVenue }) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);

  const [name, setName] = useState(venue.name);
  const [status, setStatus] = useState<Status>(() => {
    // Lead venues haven't been promoted yet — surface them as Active in the
    // form so a Save promotes them; ditto for anything unrecognised so the
    // form never crashes on a status the schema added later than this UI.
    const valid: Status[] = ["active", "paused", "archived"];
    return valid.includes(venue.status as Status) ? (venue.status as Status) : "active";
  });
  const [fiscalType, setFiscalType] = useState<Fiscal>(() => {
    const raw = (venue as { fiscal_type?: string }).fiscal_type;
    return raw === "informal" ? "informal" : "formal";
  });
  const [category, setCategory] = useState(venue.category ?? "");
  const [vibe, setVibe] = useState(venue.vibe ?? "");
  const [priceLevel, setPriceLevel] = useState(
    venue.price_level == null ? "" : String(venue.price_level),
  );
  const [address, setAddress] = useState(venue.address ?? "");
  const [closesAt, setClosesAt] = useState(venue.closes_at ?? "");
  const [phone, setPhone] = useState(venue.phone ?? "");
  const [cashbackPercent, setCashbackPercent] = useState(
    venue.cashback_percent == null ? "" : String(venue.cashback_percent),
  );
  const [pitch, setPitch] = useState(venue.pitch ?? "");
  const [story, setStory] = useState(venue.story ?? "");
  const [photos, setPhotos] = useState<string[]>(venue.photos ?? []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [links, setLinks] = useState<LinksState>({
    website_url: venue.website_url ?? "",
    instagram_url: venue.instagram_url ?? "",
    tiktok_url: venue.tiktok_url ?? "",
    facebook_url: venue.facebook_url ?? "",
    whatsapp_url: venue.whatsapp_url ?? "",
    opentable_url: venue.opentable_url ?? "",
    resy_url: venue.resy_url ?? "",
    uber_eats_url: venue.uber_eats_url ?? "",
    rappi_url: venue.rappi_url ?? "",
  });
  const setLink = (key: keyof LinksState, value: string) =>
    setLinks((prev) => ({ ...prev, [key]: value }));

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name cannot be empty.");
      return;
    }

    const priceNum = priceLevel === "" ? null : Number(priceLevel);
    const cashbackNum = cashbackPercent === "" ? null : Number(cashbackPercent);
    if (cashbackNum != null && (!Number.isFinite(cashbackNum) || cashbackNum < 0 || cashbackNum > 100)) {
      setError("Cashback must be between 0 and 100.");
      return;
    }
    const closesAtTrim = closesAt.trim();
    if (closesAtTrim && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(closesAtTrim)) {
      setError("Closing time must be 24h HH:MM (e.g. 02:00).");
      return;
    }

    const payload: UpdateVenueInput = {
      id: venue.id,
      name: trimmedName,
      status,
      fiscal_type: fiscalType,
      category: nullable(category),
      vibe: nullable(vibe),
      price_level: priceNum,
      address: nullable(address),
      closes_at: nullable(closesAt),
      phone: nullable(phone),
      cashback_percent: cashbackNum,
      pitch: nullable(pitch),
      story: nullable(story),
      photos,
      website_url: nullableUrl(links.website_url),
      instagram_url: nullableUrl(links.instagram_url),
      tiktok_url: nullableUrl(links.tiktok_url),
      facebook_url: nullableUrl(links.facebook_url),
      whatsapp_url: nullableUrl(links.whatsapp_url),
      opentable_url: nullableUrl(links.opentable_url),
      resy_url: nullableUrl(links.resy_url),
      uber_eats_url: nullableUrl(links.uber_eats_url),
      rappi_url: nullableUrl(links.rappi_url),
    };

    startTransition(async () => {
      try {
        await apiUpdateVenue(supabase, payload);
        setSaved(true);
        router.refresh();
        window.setTimeout(() => setSaved(false), 2200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save.");
      }
    });
  };

  const movePhoto = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= photos.length) return;
    const next = photos.slice();
    [next[from], next[to]] = [next[to], next[from]];
    setPhotos(next);
  };
  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };
  const addPhoto = () => {
    const url = newPhotoUrl.trim();
    if (!url) return;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      setError("Photo URL must be a valid https:// link.");
      return;
    }
    if (parsed.protocol !== "https:") {
      setError("Photo URL must use https:// (Next.js Image refuses http://).");
      return;
    }
    if (photos.includes(url)) {
      setError("That photo is already in the list.");
      return;
    }
    setError(null);
    setPhotos([...photos, url]);
    setNewPhotoUrl("");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Section title="The basics">
        <Field label="Venue name" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className={INPUT}
            required
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className={INPUT}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price level">
            <select
              value={priceLevel}
              onChange={(e) => setPriceLevel(e.target.value)}
              className={INPUT}
            >
              {PRICE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Category" hint="One word, e.g. mediterranean, mexican, cafe.">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={80}
              className={INPUT}
            />
          </Field>
          <Field label="Vibe" hint="One word, e.g. rooftop, cozy, romantic.">
            <input value={vibe} onChange={(e) => setVibe(e.target.value)} maxLength={80} className={INPUT} />
          </Field>
        </div>
      </Section>

      <Section
        title="Fiscal type & coupon mechanic"
        subtitle="Pins how Mesita works at your venue. Formal venues invoice + run cashback through Mesita's wallet. Informal venues stay cash and reveal an instant discount at the bill — Mesita never touches the money."
      >
        <Field label="Fiscal type">
          <select
            value={fiscalType}
            onChange={(e) => setFiscalType(e.target.value as Fiscal)}
            className={INPUT}
          >
            {FISCAL_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-[11px] text-muted-foreground/80">
            {FISCAL_OPTIONS.find((f) => f.value === fiscalType)?.hint}
          </span>
        </Field>
      </Section>

      <Section title="Contact & hours">
        <Field label="Address">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={300}
            className={INPUT}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Phone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              type="tel"
              className={INPUT}
            />
          </Field>
          <Field label="Closes at" hint="24h format, e.g. 02:00.">
            <input
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              maxLength={5}
              className={INPUT}
            />
          </Field>
        </div>
      </Section>

      <Section title="Story">
        <Field label="One-line pitch" hint="Shows on the swipe card. Max 200 chars.">
          <input
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            maxLength={200}
            className={INPUT}
          />
        </Field>
        <Field label="Full story" hint="Shows on the venue page. Max 1500 chars.">
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            maxLength={1500}
            className={TEXTAREA}
          />
        </Field>
      </Section>

      <Section
        title="Channels"
        subtitle="Website + socials the guest sees on the venue page. Leave blank if you don't have one."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UrlField
            label="Website"
            icon={<Globe className="h-4 w-4" />}
            placeholder="https://yourplace.com"
            value={links.website_url}
            onChange={(v) => setLink("website_url", v)}
          />
          <UrlField
            label="WhatsApp"
            icon={<MessageCircle className="h-4 w-4" />}
            placeholder="https://wa.me/52..."
            value={links.whatsapp_url}
            onChange={(v) => setLink("whatsapp_url", v)}
          />
          <UrlField
            label="Instagram"
            icon={<Instagram className="h-4 w-4" />}
            placeholder="https://instagram.com/yourplace"
            value={links.instagram_url}
            onChange={(v) => setLink("instagram_url", v)}
          />
          <UrlField
            label="TikTok"
            icon={<Music2 className="h-4 w-4" />}
            placeholder="https://tiktok.com/@yourplace"
            value={links.tiktok_url}
            onChange={(v) => setLink("tiktok_url", v)}
          />
          <UrlField
            label="Facebook"
            icon={<Facebook className="h-4 w-4" />}
            placeholder="https://facebook.com/yourplace"
            value={links.facebook_url}
            onChange={(v) => setLink("facebook_url", v)}
          />
        </div>
      </Section>

      <Section
        title="Reservations &amp; delivery"
        subtitle="Booking + food-delivery deep-links. Surfaced as quick actions on the guest venue page."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <UrlField
            label="OpenTable"
            icon={<CalendarCheck className="h-4 w-4" />}
            placeholder="https://opentable.com/r/yourplace"
            value={links.opentable_url}
            onChange={(v) => setLink("opentable_url", v)}
          />
          <UrlField
            label="Resy"
            icon={<CalendarCheck className="h-4 w-4" />}
            placeholder="https://resy.com/cities/.../yourplace"
            value={links.resy_url}
            onChange={(v) => setLink("resy_url", v)}
          />
          <UrlField
            label="Uber Eats"
            icon={<Bike className="h-4 w-4" />}
            placeholder="https://ubereats.com/store/..."
            value={links.uber_eats_url}
            onChange={(v) => setLink("uber_eats_url", v)}
          />
          <UrlField
            label="Rappi"
            icon={<Bike className="h-4 w-4" />}
            placeholder="https://www.rappi.com.mx/restaurantes/..."
            value={links.rappi_url}
            onChange={(v) => setLink("rappi_url", v)}
          />
        </div>
      </Section>

      <Section title="Rewards">
        <Field label="Cashback percent" hint="0–100. Blank means no cashback offered.">
          <input
            type="number"
            min={0}
            max={100}
            value={cashbackPercent}
            onChange={(e) => setCashbackPercent(e.target.value)}
            className={INPUT}
          />
        </Field>
      </Section>

      <Section
        title={`Photos (${photos.length})`}
        subtitle="Reorder, remove, or add — the first photo is the swipe-card cover."
      >
        {photos.length === 0 ? (
          <p className="rounded-xl bg-muted px-3 py-3 text-xs text-muted-foreground">
            No photos yet. Paste an image URL below.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((src, idx) => (
              <li key={`${src}-${idx}`} className="group relative overflow-hidden rounded-xl border border-border bg-muted">
                <div className="aspect-[4/3] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${name || "Venue"} photo ${idx + 1}`} className="h-full w-full object-cover" />
                </div>
                {idx === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => movePhoto(idx, -1)}
                    aria-label="Move left"
                    disabled={idx === 0}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-foreground transition hover:bg-white disabled:opacity-40"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(idx, 1)}
                    aria-label="Move right"
                    disabled={idx === photos.length - 1}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-foreground transition hover:bg-white disabled:opacity-40"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    aria-label="Remove photo"
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white transition hover:opacity-90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-2">
          <input
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="https://…"
            type="url"
            className={INPUT}
          />
          <button
            type="button"
            onClick={addPhoto}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold transition hover:bg-muted"
          >
            <PlusCircle className="h-4 w-4" />
            Add
          </button>
        </div>
      </Section>

      <Section title="Listing">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
          {venue.listing_type === "partner" ? (
            <>
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="font-medium">Verified partner</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Web listing</span>
            </>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            Contact support to change listing type
          </span>
        </div>
      </Section>

      {error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <div className="sticky bottom-3 z-10 mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-elev backdrop-blur">
        <p className="hidden flex-1 text-xs text-muted-foreground sm:block">
          {saved ? "Saved." : "Changes save when you click Save."}
        </p>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition disabled:opacity-50 sm:flex-none sm:px-6",
            saved ? "bg-secondary text-white" : "bg-pink-gradient text-white shadow-glow",
          )}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

function nullable(v: string): string | null {
  const t = v.trim();
  return t === "" ? null : t;
}

function UrlField({
  label,
  icon,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-foreground/70">{icon}</span>
        {label}
      </span>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="url"
        autoCapitalize="none"
        spellCheck={false}
        className={INPUT}
      />
    </label>
  );
}
