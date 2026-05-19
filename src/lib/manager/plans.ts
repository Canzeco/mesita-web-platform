import type { VenuePlan } from "@/lib/api/venues";

// Plan catalog shared between Membership (picker) and Rewards (label lookup
// + active-plan banner). Keep this the single source of truth for plan copy
// and mechanic/visibility derivation.

export type PlanMechanic = "None" | "Cashback" | "Discount";
export type PlanVisibility = "Minimum" | "Medium" | "Maximum";

export type PlanRow = {
  id: VenuePlan;
  label: string;
  priceLabel: string;
  mechanic: PlanMechanic;
  visibility: PlanVisibility;
  fiscalScope: "any" | "formal" | "informal";
  blurb: string;
};

export const PLANS: PlanRow[] = [
  {
    id: "free",
    label: "Free",
    priceLabel: "$0 MX / mo",
    mechanic: "None",
    visibility: "Minimum",
    fiscalScope: "any",
    blurb:
      "Scraped from Google Business. You appear minimally in discovery and accept AI reservations. No coupons, no dashboard writes.",
  },
  {
    id: "formal_pro",
    label: "Formal Pro",
    priceLabel: "$1,000 MX / mo",
    mechanic: "Cashback",
    visibility: "Medium",
    fiscalScope: "formal",
    blurb:
      "Cashback on card payments through Mesita. Normal placement across swipe, map, catalog, AI planner.",
  },
  {
    id: "formal_ultra",
    label: "Formal Ultra",
    priceLabel: "$3,000 MX / mo",
    mechanic: "Cashback",
    visibility: "Maximum",
    fiscalScope: "formal",
    blurb:
      "Cashback on card payments. Top placement on every surface plus featured slots.",
  },
  {
    id: "informal_pro",
    label: "Informal Pro",
    priceLabel: "$2,000 MX / mo",
    mechanic: "Discount",
    visibility: "Medium",
    fiscalScope: "informal",
    blurb:
      "Instant discount on the cash bill. Normal placement. 2× formal price because Mesita captures no wallet / data.",
  },
  {
    id: "informal_ultra",
    label: "Informal Ultra",
    priceLabel: "$6,000 MX / mo",
    mechanic: "Discount",
    visibility: "Maximum",
    fiscalScope: "informal",
    blurb:
      "Instant discount. Top placement + featured slots. 2× formal at this tier.",
  },
];

export function mechanicForPlan(p: VenuePlan): PlanMechanic {
  if (p === "free") return "None";
  if (p === "formal_pro" || p === "formal_ultra") return "Cashback";
  return "Discount";
}

export function visibilityForPlan(p: VenuePlan): PlanVisibility {
  if (p === "free") return "Minimum";
  if (p === "formal_pro" || p === "informal_pro") return "Medium";
  return "Maximum";
}
