import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Plus,
  Store,
  Sparkles,
  Globe,
  MapPin,
  Clock,
  Phone,
  Pencil,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiFetchMyVenues, type MyVenue } from "@/lib/api/venues";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/manager/sign-in");

  const venues = await apiFetchMyVenues(supabase).catch(() => []);

  if (venues.length === 0) {
    return (
      <>
        <Topbar title="Welcome to Mesita" subtitle="Let's get your first venue online." />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <EmptyState />
          </div>
        </div>
      </>
    );
  }

  const params = await searchParams;
  const requestedUnit = params.unit?.toString();
  const active = requestedUnit
    ? venues.find((v) => v.id === requestedUnit) ?? venues[0]
    : venues[0];

  return (
    <>
      <Topbar
        title={active.name}
        subtitle={`Dashboard · ${venueSubtitle(active)}`}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <VenueOverview venue={active} />
        </div>
      </div>
    </>
  );
}

function VenueOverview({ venue }: { venue: MyVenue }) {
  const initial = venue.name.trim().slice(0, 1).toUpperCase() || "·";
  const placeHref = `/manager/place?unit=${venue.id}`;
  const previewHref = `/guest/venue/${venue.id}`;

  return (
    <div className="flex flex-col gap-5">
      <article className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative aspect-[16/7] w-full bg-pink-gradient">
          {venue.photos[0] ? (
            <Image
              src={venue.photos[0]}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/80">
              <span className="font-display text-6xl font-bold">{initial}</span>
            </div>
          )}
          <div className="absolute right-4 top-4">
            <StatusPill status={venue.status} />
          </div>
          <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            {venue.listing_type === "partner" ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Verified partner
              </>
            ) : (
              <>
                <Globe className="h-3.5 w-3.5" />
                Web listing
              </>
            )}
            {venue.cashback_percent != null && (
              <span className="ml-1 rounded-full bg-pink-gradient px-2 py-0.5 text-white">
                {venue.cashback_percent}% cashback
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            {venue.pitch && (
              <p className="text-base leading-relaxed text-foreground">{venue.pitch}</p>
            )}
            {!venue.pitch && (
              <p className="text-sm italic text-muted-foreground">
                Add a one-line pitch in Place — it appears on the swipe card.
              </p>
            )}
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Stat icon={MapPin} label="Address" value={venue.address ?? "—"} />
            <Stat icon={Clock} label="Closes at" value={venue.closes_at ? `${venue.closes_at}` : "—"} />
            <Stat icon={Phone} label="Phone" value={venue.phone ?? "—"} />
            <Stat icon={ImageIcon} label="Photos" value={`${venue.photos.length}`} />
          </dl>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <Link
              href={placeHref}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition hover:opacity-90"
            >
              <Pencil className="h-4 w-4" />
              Edit place
            </Link>
            <Link
              href={previewHref}
              target="_blank"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card text-sm font-semibold transition hover:bg-muted"
            >
              <Eye className="h-4 w-4" />
              Preview as guest
            </Link>
          </div>
        </div>
      </article>

      <p className="text-center text-[11px] text-muted-foreground">
        Promos, analytics, wallet, and team are coming online next. To onboard another location,
        open the unit switcher in the sidebar and pick <span className="font-semibold">Add new unit</span>.
      </p>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: MyVenue["status"] }) {
  const map: Record<MyVenue["status"], string> = {
    active: "bg-green-500/95 text-white",
    lead: "bg-yellow-500/95 text-black",
    paused: "bg-muted text-muted-foreground",
    archived: "bg-foreground/85 text-background",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${map[status]}`}
    >
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Store className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-semibold tracking-tight">No venues yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Mesita works as one venue per unit. Add your first place — guests in your city will start
        swiping on it the moment it goes active.
      </p>
      <Link
        href="/manager/venues/new"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        Create your first venue
      </Link>
    </div>
  );
}

function venueSubtitle(v: MyVenue): string {
  const parts = [v.vibe, v.category].filter(Boolean) as string[];
  if (parts.length) return parts.join(" · ");
  return v.address ?? "—";
}
