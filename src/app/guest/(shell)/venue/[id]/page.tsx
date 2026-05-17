import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, MapPin, Clock } from "lucide-react";
import { VENUES, priceDots, venueById } from "@/lib/guest-data";
import { ImageCarousel } from "@/components/guest/ImageCarousel";
import { CouponCard } from "@/components/guest/venue/CouponCard";
import { ExternalReviews } from "@/components/guest/venue/ExternalReviews";
import { MesitaReviews } from "@/components/guest/venue/MesitaReviews";
import { VisitorsRow } from "@/components/guest/venue/VisitorsRow";
import { MenuCard } from "@/components/guest/venue/MenuCard";
import { LocationBlock } from "@/components/guest/venue/LocationBlock";
import { HoursBlock } from "@/components/guest/venue/HoursBlock";
import { PopularTimesBlock } from "@/components/guest/venue/PopularTimesBlock";
import { DetailsBlock } from "@/components/guest/venue/DetailsBlock";
import { ActionBar } from "@/components/guest/venue/ActionBar";
import { SectionLabel } from "@/components/guest/venue/SectionLabel";

export function generateStaticParams() {
  return VENUES.map((v) => ({ id: v.id }));
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = venueById(decodeURIComponent(id));
  if (!v) notFound();

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-28 scrollbar-hide">
        <div className="px-5 pb-3 pt-3">
          <div className="flex items-center justify-between">
            <Link
              href="/guest/discover/swipe"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <button
              type="button"
              aria-label="Share"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {v.vibe} · {v.category}
            </p>
            {v.cashbackPercent != null && (
              <span className="rounded-full bg-pink-gradient px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                {v.cashbackPercent}% Cashback
              </span>
            )}
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight">
            {v.name}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {v.distanceKm} km · {priceDots(v.priceLevel)}
          </p>
          <div className="mt-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-[12px] font-semibold text-secondary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
              <Clock className="h-3.5 w-3.5" />
              Open · closes {v.closesAt}
            </span>
          </div>
        </div>

        <div className="px-5">
          <ImageCarousel
            photos={v.photos}
            media={v.media}
            alt={v.name}
            aspect="aspect-[5/4]"
            rounded="rounded-2xl"
            priority
          />
        </div>

        <div className="mt-6 flex flex-col gap-6 px-5">
          {v.coupon && (
            <CouponCard
              percent={v.coupon.percent}
              title={v.coupon.title}
              sub={v.coupon.sub}
              status={v.coupon.status}
            />
          )}

          {v.externalReviews && <ExternalReviews items={v.externalReviews} />}

          {v.mesitaReviews && (
            <MesitaReviews
              food={v.mesitaReviews.food}
              service={v.mesitaReviews.service}
              ambiance={v.mesitaReviews.ambiance}
              overall={v.mesitaReviews.overall}
              total={v.mesitaReviews.total}
            />
          )}

          {v.visitors && v.visitors.length > 0 && <VisitorsRow visitors={v.visitors} />}

          {v.menu && <MenuCard pages={v.menu.pages} updated={v.menu.updated} />}

          <LocationBlock name={v.name} distanceKm={v.distanceKm} />

          {v.hours && v.todayLabel && (
            <HoursBlock hours={v.hours} today={v.todayLabel} closesAt={v.closesAt} />
          )}

          {v.popularTimes && v.todayLabel && (
            <PopularTimesBlock data={v.popularTimes} defaultDay={v.todayLabel} />
          )}

          {v.contact && v.priceRange && v.dressCode && v.payment && v.parkingInfo && v.access && (
            <DetailsBlock
              contact={v.contact}
              priceRange={v.priceRange}
              dressCode={v.dressCode}
              payment={v.payment}
              parkingInfo={v.parkingInfo}
              access={v.access}
            />
          )}

          {v.story && (
            <section>
              <SectionLabel title="The story" />
              <p className="mt-3 text-[14px] leading-relaxed text-foreground">{v.story}</p>
            </section>
          )}
        </div>
      </div>

      <ActionBar hasCoupon={v.cashbackPercent != null} hasReserve={true} />
    </div>
  );
}
