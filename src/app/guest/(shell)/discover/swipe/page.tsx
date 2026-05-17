"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, X, Ticket, Sparkles, Heart, Globe, Calendar } from "lucide-react";
import { VENUES, priceDots, type Venue } from "@/lib/guest-data";
import { ImageCarousel } from "@/components/guest/ImageCarousel";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 64;
const SWIPE_VELOCITY = 0.35; // px/ms — a quick flick commits even with small displacement
const MIN_FLICK_DISTANCE = 16;

type Stat = { label: string; value: string; sub: string; tint?: string };

const SOURCE_LABEL = {
  google: "GOOGLE",
  uber: "UBER",
  facebook: "FB",
  instagram: "IG",
} as const;

function compactCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString();
}

function statsFor(v: Venue): Stat[] {
  const mesita: Stat = {
    label: "MESITA",
    value: v.rating.toFixed(1),
    sub: "overall",
    tint: "bg-pink-gradient text-white",
  };
  if (v.externalReviews && v.externalReviews.length >= 4) {
    const external: Stat[] = v.externalReviews.slice(0, 4).map((r) => ({
      label: SOURCE_LABEL[r.source],
      value: r.value,
      sub: r.meta.replace(/ reviews?$/i, " rev").replace(/ mentions?$/i, " ment"),
    }));
    return [mesita, ...external];
  }
  const rating = v.ratingExternal;
  const reviews = v.reviewsCount;
  return [
    mesita,
    { label: "GOOGLE", value: rating.toFixed(1), sub: `${compactCount(reviews)} rev` },
    {
      label: "UBER",
      value: clamp(rating + 0.1, 1, 5).toFixed(1),
      sub: `${compactCount(Math.round(reviews * 1.4))} rev`,
    },
    {
      label: "FB",
      value: clamp(rating - 0.2, 1, 5).toFixed(1),
      sub: `${compactCount(Math.round(reviews * 0.3))} rev`,
    },
    {
      label: "IG",
      value: compactCount(Math.round(reviews * 18)),
      sub: `${compactCount(Math.round(reviews * 0.7))} ment`,
    },
  ];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function SwipePage() {
  const venues = VENUES;
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
  const stats = statsFor(v);
  const nextStats = statsFor(next);

  const advance = () => {
    setIdx((i) => {
      const nextIdx = (i + 1) % venues.length;
      if (nextIdx === 0) setResetFlash(true);
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
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (lockedRef.current == null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        lockedRef.current = Math.abs(dx) > Math.abs(dy) ? "swipe" : "ignore";
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

  // Browser sometimes cancels pointer capture (scroll gesture, OS interruption,
  // element unmount). Without this, dragX is left at the cancel position and
  // the card appears "stuck" mid-swipe. Reset cleanly.
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
        <div
          key={`back-${next.id}-${idx}`}
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card shadow-elev transition-[transform,opacity] duration-300 ease-out"
          style={{
            transform: `translate3d(0, ${backOffsetY}px, 0) scale(${backScale})`,
            opacity: backOpacity,
          }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-muted">
            <Image
              src={next.photos[0]}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
            />
          </div>
          <CardOverlay venue={next} stats={nextStats} />
        </div>

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
          <div className="absolute inset-0" data-no-swipe>
            <ImageCarousel
              key={v.id}
              photos={v.photos}
              media={v.media}
              alt={v.name}
              aspect="h-full"
              priority
              mutePosition="top-right"
            />
          </div>

          <CardOverlay venue={v} stats={stats} hrefInfo={`/guest/venue/${v.id}`} />

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
          {v.listingType === "partner" ? (
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

function CardOverlay({
  venue,
  stats,
  hrefInfo,
}: {
  venue: Venue;
  stats: Stat[];
  hrefInfo?: string;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 pt-24 text-white">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">
            {venue.vibe.toLowerCase()} · {venue.category.toLowerCase()}
          </p>
          <h2 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight drop-shadow-sm">
            {venue.name}
          </h2>
          <p className="mt-1 text-[12px] text-white/85">
            {venue.distanceKm} km · {priceDots(venue.priceLevel)} · until {venue.closesAt}
          </p>
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

      <div className="grid grid-cols-5 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-xl p-1.5 shadow-sm backdrop-blur",
              s.tint ?? "bg-white/95",
            )}
          >
            <p
              className={cn(
                "text-[8px] font-semibold tracking-wider",
                s.tint ? "text-white/90" : "text-muted-foreground",
              )}
            >
              {s.label}
            </p>
            <p
              className={cn(
                "mt-0.5 font-display text-base font-bold leading-none",
                s.tint ? "text-white" : "text-foreground",
              )}
            >
              {s.value}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[8px]",
                s.tint ? "text-white/80" : "text-muted-foreground",
              )}
            >
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {venue.listingType === "partner" ? (
          <>
            {venue.cashbackPercent != null && (
              <span className="rounded-full bg-pink-gradient px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                {venue.cashbackPercent}% cashback
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-tier-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-sm">
              <Sparkles className="h-3 w-3" />
              Verified partner
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
