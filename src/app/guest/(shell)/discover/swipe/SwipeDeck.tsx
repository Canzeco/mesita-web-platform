"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Info,
  X,
  Ticket,
  Sparkles,
  Heart,
  Globe,
  Calendar,
  Star,
  Compass,
} from "lucide-react";
import { ImageCarousel } from "@/components/guest/ImageCarousel";
import { cn } from "@/lib/utils";
import type { Venue } from "@/lib/api/venues";

const SWIPE_THRESHOLD = 64;
const SWIPE_VELOCITY = 0.35; // px/ms — a quick flick commits even with small displacement
const MIN_FLICK_DISTANCE = 16;

export function SwipeDeck({
  venues,
  fetchError,
}: {
  venues: Venue[];
  fetchError: string | null;
}) {
  if (fetchError) {
    return (
      <EmptyDeck
        title="Couldn't load venues"
        body={fetchError}
        actionHref="/guest/discover/swipe"
        actionLabel="Try again"
      />
    );
  }
  if (venues.length === 0) {
    return (
      <EmptyDeck
        title="No venues yet"
        body="The catalog is empty. As partners onboard, their venues will show up here."
        actionHref="/manager/sign-up"
        actionLabel="Are you a venue?"
      />
    );
  }
  return <Deck venues={venues} />;
}

function Deck({ venues }: { venues: Venue[] }) {
  const [idx, setIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<null | "left" | "right">(null);
  const [resetFlash, setResetFlash] = useState(false);
  const startRef = useRef({ x: 0, y: 0, t: 0 });
  const lastRef = useRef({ x: 0, t: 0 });
  const lockedRef = useRef<null | "swipe" | "ignore">(null);

  const v = venues[idx % venues.length];
  const next = venues[(idx + 1) % venues.length];

  const advance = () => {
    setIdx((i) => {
      const nextIdx = (i + 1) % venues.length;
      if (nextIdx === 0 && venues.length > 1) setResetFlash(true);
      return nextIdx;
    });
    setDragX(0);
    setExiting(null);
  };

  useEffect(() => {
    if (!resetFlash) return;
    const t = window.setTimeout(() => setResetFlash(false), 1500);
    return () => window.clearTimeout(t);
  }, [resetFlash]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-no-swipe]")) return;
    if (exiting) return;
    const t = performance.now();
    startRef.current = { x: e.clientX, y: e.clientY, t };
    lastRef.current = { x: e.clientX, t };
    setDragging(true);
    lockedRef.current = null;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (lockedRef.current == null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        lockedRef.current = Math.abs(dx) > Math.abs(dy) ? "swipe" : "ignore";
        if (lockedRef.current === "swipe") {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
      }
    }
    if (lockedRef.current === "swipe") {
      setDragX(dx);
      lastRef.current = { x: e.clientX, t: performance.now() };
    }
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (lockedRef.current === "swipe") {
      const now = performance.now();
      const dt = Math.max(1, now - lastRef.current.t);
      const recentDx = lastRef.current.x - startRef.current.x;
      const totalDt = Math.max(1, now - startRef.current.t);
      const velocity = recentDx / totalDt;
      const isFlick =
        Math.abs(velocity) >= SWIPE_VELOCITY && Math.abs(dragX) >= MIN_FLICK_DISTANCE && dt < 250;
      if (Math.abs(dragX) > SWIPE_THRESHOLD || isFlick) {
        const dir = (Math.abs(velocity) > 0.05 ? velocity : dragX) > 0 ? "right" : "left";
        setExiting(dir);
      } else {
        setDragX(0);
      }
    } else {
      setDragX(0);
    }
    lockedRef.current = null;
  };

  const onLostPointerCapture = () => {
    if (!dragging) return;
    setDragging(false);
    setDragX(0);
    lockedRef.current = null;
  };

  useEffect(() => {
    if (!exiting) return;
    const t = window.setTimeout(advance, 260);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exiting]);

  const exitOffset = exiting === "right" ? 600 : exiting === "left" ? -600 : 0;
  const visibleOffset = exiting ? exitOffset : dragX;
  const rotate = visibleOffset * 0.06;
  const isSwiping = Math.abs(dragX) > 8;

  const progress = exiting ? 1 : Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
  const backScale = 0.94 + 0.06 * progress;
  const backOffsetY = 14 - 14 * progress;
  const backOpacity = 0.7 + 0.3 * progress;

  const skip = () => setExiting("left");
  const save = () => setExiting("right");

  return (
    <div className="flex h-full flex-col px-3 pt-2 pb-3">
      <div className="relative flex-1">
        {resetFlash && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-50 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1.5 text-[11px] font-semibold text-background shadow-elev backdrop-blur animate-in fade-in slide-in-from-top-2 duration-300">
              <Sparkles className="h-3 w-3" />
              You&apos;ve seen them all — starting over
            </span>
          </div>
        )}
        {venues.length > 1 && (
          <div
            key={`back-${next.id}-${idx}`}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card shadow-elev transition-[transform,opacity] duration-300 ease-out"
            style={{
              transform: `translate3d(0, ${backOffsetY}px, 0) scale(${backScale})`,
              opacity: backOpacity,
            }}
            aria-hidden
          >
            <VenueBackground venue={next} />
            <CardOverlay venue={next} />
          </div>
        )}

        <div
          key={v.id}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onLostPointerCapture={onLostPointerCapture}
          className={cn(
            "absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card shadow-elev select-none touch-none",
            !dragging && "transition-[transform,opacity] duration-300 ease-out",
            isSwiping && "cursor-grabbing",
            exiting && "pointer-events-none",
          )}
          style={{
            transform: `translate3d(${visibleOffset}px, ${Math.abs(visibleOffset) * 0.04}px, 0) rotate(${rotate}deg)`,
            opacity: exiting ? 0 : 1,
          }}
        >
          <div className="absolute inset-0">
            {v.photos.length > 0 ? (
              <ImageCarousel
                key={v.id}
                photos={v.photos}
                alt={v.name}
                aspect="h-full"
                priority
                mutePosition="top-right"
                noNativeScroll
              />
            ) : (
              <PhotoPlaceholder name={v.name} />
            )}
          </div>

          <CardOverlay venue={v} hrefInfo={`/guest/venue/${v.id}`} />

          <div
            className={cn(
              "pointer-events-none absolute left-4 top-4 z-30 rounded-full border-2 border-white bg-foreground/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white transition-all",
              dragX < -30 ? "scale-100 opacity-100" : "scale-90 opacity-0",
            )}
          >
            Skip
          </div>
          <div
            className={cn(
              "pointer-events-none absolute right-4 top-4 z-30 rounded-full bg-pink-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-all",
              dragX > 30 ? "scale-100 opacity-100" : "scale-90 opacity-0",
            )}
          >
            Save
          </div>
        </div>

        {exiting === "right" && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
            <span className="inline-flex -rotate-[8deg] items-center gap-2 rounded-2xl border-[3px] border-white bg-pink-gradient px-5 py-2.5 text-2xl font-black uppercase tracking-[0.15em] text-white shadow-glow animate-in fade-in zoom-in-50 duration-200 ease-out">
              <Heart className="h-6 w-6 fill-white" />
              Saved
            </span>
          </div>
        )}
        {exiting === "left" && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
            <span className="inline-flex rotate-[8deg] items-center gap-2 rounded-2xl border-[3px] border-foreground/70 bg-foreground/85 px-5 py-2.5 text-2xl font-black uppercase tracking-[0.15em] text-background animate-in fade-in zoom-in-50 duration-200 ease-out">
              <X className="h-6 w-6 stroke-[3]" />
              Skip
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={skip}
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-4 w-4" /> Skip
        </button>
        <button
          type="button"
          onClick={save}
          className="flex h-12 flex-[1.6] items-center justify-center gap-2 rounded-full bg-pink-gradient text-sm font-semibold text-white shadow-glow"
        >
          {v.listing_type === "partner" ? (
            <>
              <Ticket className="h-4 w-4" /> Save or reserve
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" /> Reserve
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function VenueBackground({ venue }: { venue: Venue }) {
  if (venue.photos[0]) {
    return (
      <div className="absolute inset-0 bg-muted">
        <Image
          src={venue.photos[0]}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 100vw, 420px"
          className="object-cover"
        />
      </div>
    );
  }
  return <PhotoPlaceholder name={venue.name} />;
}

function PhotoPlaceholder({ name }: { name: string }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "·";
  return (
    <div className="absolute inset-0 bg-pink-gradient">
      <div className="absolute inset-0 flex items-center justify-center text-white/70">
        <span className="font-display text-7xl font-bold tracking-tight">{initial}</span>
      </div>
    </div>
  );
}

// 30 days from now in ms — the "New" badge only fires for venues onboarded
// inside that window so it stays meaningful instead of being on every card.
// Evaluated at module load so the React 19 purity-in-render lint doesn't
// flag a Date.now() inside CardOverlay.
const NEW_BADGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const NEW_BADGE_THRESHOLD = Date.now() - NEW_BADGE_WINDOW_MS;

function CardOverlay({ venue, hrefInfo }: { venue: Venue; hrefInfo?: string }) {
  const meta = [
    venue.price_level != null ? "$".repeat(venue.price_level) : null,
    venue.closes_at ? `until ${venue.closes_at}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const isNew =
    !!venue.created_at && Date.parse(venue.created_at) > NEW_BADGE_THRESHOLD;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 pt-24 text-white">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {(venue.vibe || venue.category) && (
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">
              {[venue.vibe, venue.category].filter(Boolean).join(" · ").toLowerCase()}
            </p>
          )}
          <h2 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight drop-shadow-sm">
            {venue.name}
          </h2>
          {meta && <p className="mt-1 text-[12px] text-white/85">{meta}</p>}
        </div>
        {hrefInfo && (
          <Link
            href={hrefInfo}
            data-no-swipe
            aria-label="More info"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur transition hover:bg-white"
          >
            <Info className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isNew && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
            <Star className="h-3 w-3" />
            New
          </span>
        )}
        {venue.listing_type === "partner" ? (
          <>
            {venue.cashback_percent != null && (
              <span className="rounded-full bg-pink-gradient px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                {venue.cashback_percent}% cashback
              </span>
            )}
            <span
              className="inline-flex items-center gap-1 rounded-full bg-tier-gold/95 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm"
              aria-label="Verified partner"
            >
              <Sparkles className="h-3 w-3" />
              Verified
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
            <Globe className="h-3 w-3" />
            Web listing
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyDeck({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Compass className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
      <Link
        href={actionHref}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
