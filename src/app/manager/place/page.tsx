import Image from "next/image";
import { Camera, Instagram, Phone, Globe, MapPin } from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { VENUE } from "@/lib/manager-data";

export default function PlacePage() {
  return (
    <>
      <Topbar title="Place" subtitle="How guests see you on Mesita" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative h-48 w-full">
              <Image
                src={VENUE.cover}
                alt={VENUE.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <button
                type="button"
                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-[12px] font-semibold shadow-sm backdrop-blur"
              >
                <Camera className="h-3.5 w-3.5" />
                Replace cover
              </button>
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {VENUE.vibe} · {VENUE.category}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                  {VENUE.name}
                </h2>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {VENUE.area} · {VENUE.city}
                </p>
              </div>
              <span className="rounded-full bg-secondary/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Verified Partner
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Section title="Photos" trailing="6 of 20 used" col="lg:col-span-2">
              <div className="grid grid-cols-4 gap-2">
                {VENUE.photos.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-xl border border-border"
                  >
                    <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                  </div>
                ))}
                <button
                  type="button"
                  className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:bg-muted/40"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            </Section>

            <Section title="Status">
              <div className="flex flex-col gap-2 text-sm">
                <Row label="Visibility" value={<Pill tone="success">Live</Pill>} />
                <Row label="Catalog tier" value={<Pill tone="gold">Featured</Pill>} />
                <Row label="Stripe Connect" value={<Pill tone="success">Connected</Pill>} />
                <Row label="WhatsApp bot" value={<Pill tone="success">Live</Pill>} />
              </div>
            </Section>

            <Section title="Contact" col="lg:col-span-1">
              <div className="flex flex-col gap-2 text-sm">
                <Row
                  label="Phone"
                  value={
                    <span className="inline-flex items-center gap-1.5 font-medium text-secondary">
                      <Phone className="h-3.5 w-3.5" /> {VENUE.contact.phone}
                    </span>
                  }
                />
                <Row label="Email" value={<span className="font-medium">{VENUE.contact.email}</span>} />
                <Row
                  label="Website"
                  value={
                    <span className="inline-flex items-center gap-1.5 font-medium text-secondary">
                      <Globe className="h-3.5 w-3.5" /> {VENUE.contact.website}
                    </span>
                  }
                />
              </div>
            </Section>

            <Section title="Social">
              <div className="flex flex-col gap-2 text-sm">
                <Row
                  label="Instagram"
                  value={
                    <span className="inline-flex items-center gap-1.5 font-medium text-secondary">
                      <Instagram className="h-3.5 w-3.5" /> {VENUE.social.instagram}
                    </span>
                  }
                />
                <Row label="Facebook" value={<span className="font-medium">{VENUE.social.facebook}</span>} />
                <Row label="TikTok" value={<span className="font-medium">{VENUE.social.tiktok}</span>} />
              </div>
            </Section>

            <Section title="Delivery">
              <div className="flex flex-col gap-2 text-sm">
                <Row label="Uber Eats" value={<span className="font-medium">{VENUE.delivery.uberEats}</span>} />
                <Row label="Rappi" value={<span className="font-medium">{VENUE.delivery.rappi}</span>} />
              </div>
            </Section>

            <Section title="Hours" col="lg:col-span-3">
              <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-7">
                {VENUE.hours.map((h) => (
                  <div
                    key={h.day}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 lg:flex-col lg:items-start lg:gap-1"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {h.day}
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{h.range}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  trailing,
  col,
  children,
}: {
  title: string;
  trailing?: string;
  col?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 ${col ?? ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
        {trailing && <p className="text-[11px] text-muted-foreground">{trailing}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: "success" | "gold" }) {
  const cls =
    tone === "success"
      ? "bg-secondary/15 text-secondary"
      : "bg-tier-gold/40 text-foreground";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${cls}`}>
      {children}
    </span>
  );
}
