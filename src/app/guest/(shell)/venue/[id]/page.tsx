import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Globe,
  Instagram,
  Facebook,
  MessageCircle,
  Music2,
  CalendarCheck,
  Bike,
  Sparkles,
} from "lucide-react";
import { ImageCarousel } from "@/components/guest/ImageCarousel";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiGetVenue, type Venue } from "@/lib/api/venues";

export const dynamic = "force-dynamic";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  // apiGetVenue returns null on 404 and throws on real errors. Distinguish so
  // a transient backend hiccup doesn't render as "this venue doesn't exist."
  let venue: Awaited<ReturnType<typeof apiGetVenue>> = null;
  let fetchError: string | null = null;
  try {
    venue = await apiGetVenue(supabase, id);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Couldn't load this venue.";
  }
  if (fetchError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-destructive">
          Couldn&apos;t load this venue
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">{fetchError}</p>
        <Link
          href="/guest/discover/swipe"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          Back to discover
        </Link>
      </div>
    );
  }
  if (!venue) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background">
      <div className="relative">
        <div className="absolute left-3 top-3 z-20">
          <Link
            href="/guest/discover/swipe"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm backdrop-blur transition hover:bg-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        {venue.photos.length > 0 ? (
          <ImageCarousel photos={venue.photos} alt={venue.name} aspect="aspect-[4/5]" />
        ) : (
          <PhotoPlaceholder name={venue.name} />
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        <header className="flex flex-col gap-1">
          {(venue.vibe || venue.category) && (
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {[venue.vibe, venue.category].filter(Boolean).join(" · ").toLowerCase()}
            </p>
          )}
          <h1 className="font-display text-3xl font-semibold tracking-tight">{venue.name}</h1>
          {(venue.price_level != null || venue.closes_at) && (
            <p className="text-sm text-muted-foreground">
              {[
                venue.price_level != null ? "$".repeat(venue.price_level) : null,
                venue.closes_at ? `until ${venue.closes_at}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </header>

        {venue.listing_type === "partner" && venue.cashback_percent != null && (
          <div className="flex items-center justify-between rounded-2xl bg-pink-gradient p-4 text-white shadow-glow">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                Verified partner
              </p>
              <p className="mt-0.5 font-display text-xl font-semibold">
                {venue.cashback_percent}% cashback on every visit
              </p>
            </div>
            <Sparkles className="h-7 w-7 text-white/80" />
          </div>
        )}

        {venue.pitch && (
          <p className="text-base leading-relaxed text-foreground">{venue.pitch}</p>
        )}
        {venue.story && (
          <p className="text-sm leading-relaxed text-muted-foreground">{venue.story}</p>
        )}

        <ContactBlock venue={venue} />
        <ChannelsBlock venue={venue} />
        <ReservationsBlock venue={venue} />
      </div>
    </div>
  );
}

function ContactBlock({ venue }: { venue: Venue }) {
  const items = [
    venue.address ? { icon: MapPin, label: venue.address } : null,
    venue.closes_at ? { icon: Clock, label: `Closes at ${venue.closes_at}` } : null,
    venue.phone ? { icon: Phone, label: venue.phone, href: `tel:${venue.phone}` } : null,
  ].filter(Boolean) as { icon: typeof MapPin; label: string; href?: string }[];

  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      {items.map(({ icon: Icon, label, href }) => {
        const inner = (
          <span className="flex items-start gap-3 py-1">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">{label}</span>
          </span>
        );
        return href ? (
          <a key={label} href={href} className="text-foreground hover:underline">
            {inner}
          </a>
        ) : (
          <div key={label} className="text-foreground">
            {inner}
          </div>
        );
      })}
    </section>
  );
}

const CHANNEL_DEFS = [
  { key: "website_url", label: "Website", Icon: Globe },
  { key: "whatsapp_url", label: "WhatsApp", Icon: MessageCircle },
  { key: "instagram_url", label: "Instagram", Icon: Instagram },
  { key: "tiktok_url", label: "TikTok", Icon: Music2 },
  { key: "facebook_url", label: "Facebook", Icon: Facebook },
] as const;

const RESERVATION_DEFS = [
  { key: "opentable_url", label: "OpenTable", Icon: CalendarCheck },
  { key: "resy_url", label: "Resy", Icon: CalendarCheck },
  { key: "uber_eats_url", label: "Uber Eats", Icon: Bike },
  { key: "rappi_url", label: "Rappi", Icon: Bike },
] as const;

function ChannelsBlock({ venue }: { venue: Venue }) {
  const active = CHANNEL_DEFS.filter((c) => !!venue[c.key]);
  if (active.length === 0) return null;
  return <ChipGrid title="Channels" items={active} venue={venue} />;
}

function ReservationsBlock({ venue }: { venue: Venue }) {
  const active = RESERVATION_DEFS.filter((c) => !!venue[c.key]);
  if (active.length === 0) return null;
  return <ChipGrid title="Reserve & order" items={active} venue={venue} />;
}

function ChipGrid({
  title,
  items,
  venue,
}: {
  title: string;
  items: readonly { key: keyof Venue; label: string; Icon: typeof Globe }[];
  venue: Venue;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map(({ key, label, Icon }) => (
          <a
            key={key}
            href={String(venue[key])}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}

function PhotoPlaceholder({ name }: { name: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "·";
  return (
    <div className="flex aspect-[4/5] items-center justify-center bg-pink-gradient">
      <span className="font-display text-7xl font-bold text-white/70">{initial}</span>
    </div>
  );
}
