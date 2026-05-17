import { SectionLabel } from "./SectionLabel";

export function MesitaReviews({
  food,
  service,
  ambiance,
  overall,
  total,
}: {
  food: number;
  service: number;
  ambiance: number;
  overall: number;
  total: number;
}) {
  const items = [
    { label: "Food", value: food },
    { label: "Service", value: service },
    { label: "Ambiance", value: ambiance },
    { label: "Overall", value: overall },
  ];
  return (
    <section>
      <SectionLabel
        title="Mesita reviews"
        trailing={<span className="text-secondary">{total} total</span>}
      />
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-2.5 text-center">
            <p className="text-[10px] font-medium text-muted-foreground">{m.label}</p>
            <p className="mt-1 font-display text-xl font-bold leading-none tracking-tight">
              {m.value.toFixed(1)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
