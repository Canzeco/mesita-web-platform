import { VenueCard } from "@/components/guest/VenueCard";
import { VENUES } from "@/lib/guest-data";

function Row({ title, subtitle, ids }: { title: string; subtitle?: string; ids: string[] }) {
  const venues = ids.map((id) => VENUES.find((v) => v.id === id)).filter(Boolean) as typeof VENUES;
  return (
    <section className="mt-6">
      <div className="px-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {venues.map((v) => (
          <div key={v.id} className="w-64 flex-shrink-0">
            <VenueCard venue={v} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CatalogPage() {
  return (
    <div className="pb-6">
      <Row
        title="Tonight near you"
        ids={["casa-luminar", "neon-bar", "mar-verde", "sala-trece"]}
      />
      <Row
        title="Best cashback"
        subtitle="Up to 20% back on first visit"
        ids={["casa-luminar", "neon-bar", "taqueria-cruz", "loto-cafe"]}
      />
      <Row
        title="Rooftops & views"
        ids={["casa-luminar", "mar-verde", "atelier-nueve"]}
      />
      <Row
        title="Late night"
        ids={["neon-bar", "taqueria-cruz", "sala-trece"]}
      />
    </div>
  );
}
