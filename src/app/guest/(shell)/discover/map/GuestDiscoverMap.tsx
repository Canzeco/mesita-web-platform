"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { Compass, MapPin as MapPinIcon, Sparkles, Globe, Crosshair, Info } from "lucide-react";
import type { Venue } from "@/lib/api/venues";
import { cn } from "@/lib/utils";

// Default map centre — Monterrey, since that's the city the project is
// shipping in first. If the geolocation permission lands we re-centre on
// the user instead.
const DEFAULT_CENTER = { lat: 25.6714, lng: -100.3094 };
const DEFAULT_ZOOM = 13;
const USER_ZOOM = 14;

// Pin colours — the visual gate between Mesita partners and scraped web
// listings. Tied to the design tokens via raw hex so Google Maps can use
// them; close enough to the brand palette.
const PARTNER_PIN = { background: "#E91E63", glyphColor: "#ffffff", borderColor: "#9c1148" };
const WEB_PIN = { background: "#9ca3af", glyphColor: "#ffffff", borderColor: "#4b5563" };

type LatLng = { lat: number; lng: number };

export function GuestDiscoverMap({
  apiKey,
  venues,
  fetchError,
  totalVenues,
}: {
  apiKey: string;
  venues: Venue[];
  fetchError: string | null;
  totalVenues: number;
}) {
  // Missing key → we can't render the SDK. Surface a clear setup hint.
  if (!apiKey) {
    return (
      <SetupCard
        title="Map not configured"
        body={
          <>
            Add <code className="rounded bg-muted px-1 text-[11px]">NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY</code>{" "}
            to your Vercel project (Settings → Environment Variables) with a
            Google Maps JavaScript API key. Restrict the key to your domain
            and redeploy.
          </>
        }
      />
    );
  }

  if (fetchError) {
    return <SetupCard title="Couldn't load venues" body={fetchError} />;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["marker"]}>
      <MapView venues={venues} totalVenues={totalVenues} />
    </APIProvider>
  );
}

function MapView({ venues, totalVenues }: { venues: Venue[]; totalVenues: number }) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  // Lazy init lets us reason about geolocation support up-front, before any
  // effect runs. Once mounted we move to "asking" inside the effect.
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "asking" | "granted" | "denied" | "unsupported"
  >(() =>
    typeof navigator === "undefined" || !navigator.geolocation ? "unsupported" : "idle",
  );
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Auto-request once on mount. Wrapped in an async IIFE so the setState
  // calls run via Promise microtask rather than synchronously inside the
  // effect body (React 19's set-state-in-effect lint).
  useEffect(() => {
    if (locationStatus === "unsupported") return;
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      setLocationStatus("asking");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus("granted");
        },
        () => {
          if (cancelled) return;
          setLocationStatus("denied");
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
      );
    })();
    return () => {
      cancelled = true;
    };
    // We only want this to run on mount, so the dependency array stays
    // empty; locationStatus is captured at first-render value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const center = userLocation ?? DEFAULT_CENTER;
  const zoom = userLocation ? USER_ZOOM : DEFAULT_ZOOM;

  return (
    <div className="relative flex h-full flex-col">
      <Map
        mapId="mesita-guest-discover"
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        reuseMaps
        className="absolute inset-0 h-full w-full"
        colorScheme="LIGHT"
      >
        {userLocation && (
          <AdvancedMarker position={userLocation} title="You're here">
            <span className="relative flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500/60" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
            </span>
          </AdvancedMarker>
        )}
        {venues.map((v) => (
          <AdvancedMarker
            key={v.id}
            position={{ lat: v.lat as number, lng: v.lng as number }}
            title={v.name}
            onClick={() => setSelectedVenue(v)}
          >
            <Pin {...(v.listing_type === "partner" ? PARTNER_PIN : WEB_PIN)} />
          </AdvancedMarker>
        ))}
        <Recentre target={userLocation} />
      </Map>

      {/* Top overlay: counts + legend */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-full bg-card/95 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
          <Compass className="mr-1 inline-block h-3 w-3 -translate-y-0.5" />
          {venues.length} of {totalVenues} near here
        </div>
        <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl bg-card/95 p-2 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
          <LegendDot color={PARTNER_PIN.background} icon={<Sparkles className="h-2.5 w-2.5" />}>
            Partner
          </LegendDot>
          <LegendDot color={WEB_PIN.background} icon={<Globe className="h-2.5 w-2.5" />}>
            Web listing
          </LegendDot>
        </div>
      </header>

      {/* Geolocation state banner */}
      {(locationStatus === "denied" || locationStatus === "unsupported") && (
        <div className="pointer-events-auto absolute inset-x-3 top-14 z-10 rounded-2xl bg-card/95 px-3 py-2 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
          {locationStatus === "denied"
            ? "Location off — showing Monterrey by default. Enable location in your browser to centre on you."
            : "Geolocation isn't supported on this device."}
        </div>
      )}

      {/* Recentre button bottom-right (visible once we have a fix) */}
      {userLocation && (
        <RecentreButton target={userLocation} />
      )}

      {/* Selected-venue card slides up from the bottom */}
      {selectedVenue && (
        <VenuePreview
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      )}
    </div>
  );
}

function Recentre({ target }: { target: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    if ((map.getZoom() ?? DEFAULT_ZOOM) < USER_ZOOM) {
      map.setZoom(USER_ZOOM);
    }
  }, [map, target]);
  return null;
}

function RecentreButton({ target }: { target: LatLng }) {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => {
        if (!map) return;
        map.panTo(target);
        map.setZoom(USER_ZOOM);
      }}
      aria-label="Centre map on me"
      className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-elev transition hover:bg-muted"
    >
      <Crosshair className="h-4 w-4" />
    </button>
  );
}

function VenuePreview({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const tag =
    venue.listing_type === "partner"
      ? { Icon: Sparkles, label: "Partner", className: "bg-pink-gradient text-white" }
      : { Icon: Globe, label: "Web listing", className: "bg-muted text-muted-foreground" };
  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 overflow-hidden rounded-2xl border border-border bg-card shadow-elev">
      <div className="relative flex items-stretch gap-3 p-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
        >
          Close
        </button>
        {venue.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.photos[0]}
            alt=""
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-pink-gradient text-white">
            {venue.name.trim().slice(0, 1).toUpperCase() || "·"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold tracking-tight">
            {venue.name}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {[venue.vibe, venue.category].filter(Boolean).join(" · ") || "—"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider", tag.className)}>
              <tag.Icon className="h-2.5 w-2.5" />
              {tag.label}
            </span>
            {venue.cashback_percent != null && (
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 font-semibold text-secondary">
                {venue.cashback_percent}% cashback
              </span>
            )}
          </div>
        </div>
      </div>
      <Link
        href={`/guest/venue/${venue.id}`}
        className="flex items-center justify-center gap-2 border-t border-border bg-background py-2.5 text-xs font-semibold transition hover:bg-muted"
      >
        <Info className="h-3.5 w-3.5" />
        View details
      </Link>
    </div>
  );
}

function LegendDot({
  color,
  icon,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="flex h-3 w-3 items-center justify-center rounded-full text-white"
        style={{ background: color }}
      >
        {icon}
      </span>
      {children}
    </span>
  );
}

function SetupCard({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <MapPinIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

