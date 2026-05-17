import { Phone, Globe, DollarSign, Sparkles, CreditCard, Car, Accessibility } from "lucide-react";
import { SectionLabel } from "./SectionLabel";

type Row = {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
};

export function DetailsBlock({
  contact,
  priceRange,
  dressCode,
  payment,
  parkingInfo,
  access,
}: {
  contact: { phone: string; website: string };
  priceRange: { min: number; max: number; currency: string };
  dressCode: string;
  payment: string[];
  parkingInfo: string;
  access: string[];
}) {
  const rows: Row[] = [
    {
      Icon: Phone,
      label: "Contact",
      value: <span className="font-semibold text-secondary">{contact.phone}</span>,
    },
    {
      Icon: Globe,
      label: "Website",
      value: <span className="font-semibold text-secondary">{contact.website}</span>,
    },
    {
      Icon: DollarSign,
      label: "Price range",
      value: `${priceRange.currency} ${priceRange.min} – ${priceRange.max}`,
    },
    { Icon: Sparkles, label: "Dress code", value: dressCode },
    {
      Icon: CreditCard,
      label: "Payment",
      value: (
        <div className="flex flex-wrap gap-1.5">
          {payment.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium"
            >
              {p}
            </span>
          ))}
        </div>
      ),
    },
    { Icon: Car, label: "Parking", value: parkingInfo },
    {
      Icon: Accessibility,
      label: "Access",
      value: (
        <div className="flex flex-wrap gap-1.5">
          {access.map((a) => (
            <span
              key={a}
              className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium"
            >
              {a}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section>
      <SectionLabel title="Details" />
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map(({ Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 px-4 py-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="w-20 shrink-0 text-[13px] text-muted-foreground">{label}</span>
            <div className="min-w-0 flex-1 text-sm">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
