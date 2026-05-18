import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiFetchPublicVenues, type Venue } from "@/lib/api/venues";
import { PartnerBadge } from "@/components/shared/PartnerBadge";
import { RatePill } from "@/components/shared/RatePill";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = await createServerSupabase();

  let venues: Venue[] = [];
  let fetchError: string | null = null;
  try {
    venues = await apiFetchPublicVenues(supabase, 60);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Couldn't load the catalog.";
  }

  if (fetchError) {
    return (
      <div className="px-4 pb-6 pt-4">
        <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fetchError}
        </p>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="px-4 pb-6 pt-6 text-center">
        <h2 className="font-display text-xl font-semibold tracking-tight">No venues yet</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          As partners onboard, their venues land here.
        </p>
      </div>
    );
  }

  const partners = venues.filter((v) => v.listing_type === "partner");
  const cashbackTop = [...partners]
    .filter((v) => (v.cashback_percent ?? 0) > 0)
    .sort((a, b) => (b.cashback_percent ?? 0) - (a.cashback_percent ?? 0))
    .slice(0, 12);
  const newest = [...venues].slice(0, 12);
  const webListings = venues.filter((v) => v.listing_type === "web").slice(0, 12);

  return (
    <div className="pb-6">
      {cashbackTop.length > 0 && (
        <Row title="Best cashback" subtitle="Most back on the bill" venues={cashbackTop} />
      )}
      <Row title="New on Mesita" subtitle="Recently onboarded venues" venues={newest} />
      {webListings.length > 0 && (
        <Row
          title="Other places nearby"
          subtitle="Web listings — no cashback yet"
          venues={webListings}
        />
      )}
    </div>
  );
}

function Row({
  title,
  subtitle,
  venues,
}: {
  title: string;
  subtitle?: string;
  venues: Venue[];
}) {
  return (
    <section className="mt-6">
      <div className="px-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {venues.map((v) => (
          <div key={v.id} className="w-64 flex-shrink-0">
            <CatalogCard venue={v} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CatalogCard({ venue }: { venue: Venue }) {
  const photo = venue.photos[0];
  const subtitle = [venue.vibe, venue.category].filter(Boolean).join(" · ").toLowerCase();
  return (
    <Link
      href={`/guest/venue/${venue.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-muted">
        {photo ? (
          <Image
            src={photo}
            alt={venue.name}
            fill
            sizes="(max-width: 768px) 50vw, 256px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-pink-gradient text-white/70">
            <span className="font-display text-4xl font-bold tracking-tight">
              {venue.name[0]?.toUpperCase() ?? "·"}
            </span>
          </div>
        )}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <PartnerBadge listingType={venue.listing_type} />
          {venue.listing_type === "partner" &&
            venue.cashback_percent != null &&
            venue.cashback_percent > 0 && (
              <RatePill
                percent={venue.cashback_percent}
                mechanic={venue.fiscal_type === "informal" ? "discount" : "cashback"}
              />
            )}
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="font-display text-base font-semibold leading-tight tracking-tight">
          {venue.name}
        </h3>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {subtitle || venue.address || "—"}
        </p>
      </div>
    </Link>
  );
}
