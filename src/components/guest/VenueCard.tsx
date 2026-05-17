"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Navigation, Bookmark } from "lucide-react";
import type { Venue } from "@/lib/guest-data";
import { priceDots } from "@/lib/guest-data";
import { CashbackPill, PartnerPill } from "./Pills";

export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      href={`/guest/venue/${venue.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={venue.photos[0]}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className="object-cover"
        />
        {venue.isPartner && (
          <div className="absolute left-2 top-2 flex items-center gap-1.5">
            <PartnerPill />
            {venue.cashbackPercent != null && <CashbackPill percent={venue.cashbackPercent} />}
          </div>
        )}
        <button
          type="button"
          aria-label="Save"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm backdrop-blur"
          onClick={(e) => e.preventDefault()}
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="font-display text-base font-semibold leading-tight tracking-tight">
          {venue.name}
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{priceDots(venue.priceLevel)}</span>
          <span className="mx-1.5">·</span>
          {venue.vibe}
          <span className="mx-1.5">·</span>
          {venue.category}
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-secondary text-secondary" strokeWidth={0} />
            <span className="font-semibold">{venue.rating.toFixed(1)}</span>
            <span className="mx-0.5 text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {venue.ratingExternal.toFixed(1)} {venue.externalLabel}
            </span>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Navigation className="h-3 w-3" />
            {venue.distanceKm} km
          </span>
        </div>
      </div>
    </Link>
  );
}
