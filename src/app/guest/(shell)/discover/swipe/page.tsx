"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, VolumeX, X, Ticket, Sparkles } from "lucide-react";
import { VENUES, priceDots, type Venue } from "@/lib/guest-data";
import { ImageCarousel } from "@/components/guest/ImageCarousel";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD = 110;

type Stat = { label: string; value: string; sub: string; tint?: string };

const SOURCE_LABEL = {
  google: "GOOGLE",
  uber: "UBER",
  facebook: "FB",
  instagram: "IG",
} as const;

function statsFor(v: Venue): Stat[] {
  const mesita: Stat = {
    label: "MESITA",
    value: v.rating.toFixed(1),
    sub: "overall",
    tint: "bg-pink-gradient text-white",
  };
  const external = v.externalReviews?.map<Stat>((r) => ({
    label: SOURCE_LABEL[r.source],
    value: r.value,
    sub: r.meta.replace(/ reviews?$/i, " rev").replace(/ mentions?$/i, " ment"),
  })) ?? [
    {
      label: "GOOGLE",
      value: v.ratingExternal.toFixed(1),
      sub: `${v.reviewsCount.toLocaleString()} rev`,
    },
  ];
  return [mesita, ...external].slice(0, 5);
}

export default function SwipePage() {
  const venues = VENUES.filter((v) => v.isPartner);
  const [idx, setIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<null | "left" | "right">(null);
  const startRef = useRef({ x: 0, y: 0 });
  const lockedRef = useRef<null | "swipe" | "ignore">(null);

  const v = venues[idx % venues.length];
  const next = venues[(idx + 1) % venues.length];
  const stats = statsFor(v);

  const advance = () => {
    setIdx((i) => (i + 1) % venues.length);
    setDragX(0);
    setExiting(null);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-no-swipe]")) return;
    if (exiting) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    lockedRef.current = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (lockedRef.current == null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        lockedRef.current = Math.abs(dx) > Math.abs(dy) ? "swipe" : "ignore";
      }
    }
    if (lockedRef.current === "swipe") {
      setDragX(dx);
    }
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (lockedRef.current === "swipe" && Math.abs(dragX) > SWIPE_THRESHOLD) {
      setExiting(dragX > 0 ? "right" : "left");
    } else {
      setDragX(0);
    }
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
        <div
          key={`back-${next.id}-${idx}`}
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card shadow-elev transition-[transform,opacity] duration-300 ease-out"
          style={{
            transform: `translate3d(0, ${backOffsetY}px, 0) scale(${backScale})`,
            opacity: backOpacity,
          }}
          aria-hidden
        >
          <div className="relative h-[58%] w-full bg-muted">
            <Image
              src={next.photos[0]}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
            />
          </div>
          <div className="flex h-[42%] flex-col p-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {next.vibe.toLowerCase()} · {next.category.toLowerCase()}
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {next.name}
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {next.distanceKm} km · {next.walkMinutes} min walk · {priceDots(next.priceLevel)}
            </p>
            {next.cashbackPercent != null && (
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-pink-gradient px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                  {next.cashbackPercent}% cashback
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          key={v.id}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card shadow-elev select-none",
            !dragging && "transition-[transform,opacity] duration-300 ease-out",
            isSwiping && "cursor-grabbing",
          )}
          style={{
            transform: `translate3d(${visibleOffset}px, ${Math.abs(visibleOffset) * 0.04}px, 0) rotate(${rotate}deg)`,
            opacity: exiting ? 0 : 1,
          }}
        >
          <div className="relative h-[58%] w-full" data-no-swipe>
            <ImageCarousel
              key={v.id}
              photos={v.photos}
              media={v.media}
              alt={v.name}
              aspect="h-full"
              priority
            />
            <button
              type="button"
              data-no-swipe
              className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"
              aria-label="Mute"
            >
              <VolumeX className="h-4 w-4" />
            </button>

            <div
              className={cn(
                "pointer-events-none absolute left-4 top-4 z-20 rounded-full border-2 border-white bg-foreground/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white transition-opacity",
                dragX < -30 ? "opacity-100" : "opacity-0",
              )}
            >
              Skip
            </div>
            <div
              className={cn(
                "pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-pink-gradient px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition-opacity",
                dragX > 30 ? "opacity-100" : "opacity-0",
              )}
            >
              Save
            </div>
          </div>

          <div className="flex h-[42%] flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {v.vibe.toLowerCase()} · {v.category.toLowerCase()}
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
                  {v.name}
                </h2>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {v.distanceKm} km · {v.walkMinutes} min walk · {priceDots(v.priceLevel)} · until {v.closesAt}
                </p>
              </div>
              <Link
                href={`/guest/venue/${v.id}`}
                data-no-swipe
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                aria-label="More info"
              >
                <Info className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl border border-border p-1.5 ${s.tint ?? "bg-background"}`}
                >
                  <p
                    className={`text-[8px] font-semibold tracking-wider ${
                      s.tint ? "text-white/90" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="mt-0.5 font-display text-base font-bold leading-none">{s.value}</p>
                  <p
                    className={`mt-0.5 text-[8px] ${
                      s.tint ? "text-white/80" : "text-muted-foreground"
                    }`}
                  >
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

            {v.cashbackPercent != null && (
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-pink-gradient px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm">
                  {v.cashbackPercent}% cashback
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-tier-gold px-3 py-1.5 text-[10px] font-bold text-black shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  MESITA PARTNER
                </span>
              </div>
            )}
          </div>
        </div>
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
          <Ticket className="h-4 w-4" /> Save or reserve
        </button>
      </div>
    </div>
  );
}
