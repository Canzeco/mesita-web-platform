import type { Tier } from "./guest-data";

export type Unit = {
  id: string;
  name: string;
  emoji: string;
  city: string;
  area: string;
};

export const UNITS: Unit[] = [
  { id: "casa-luminar", name: "Casa Luminar", emoji: "🌙", city: "CDMX", area: "Polanco" },
  { id: "bocanada", name: "Bocanada", emoji: "🍷", city: "CDMX", area: "Roma Norte" },
  { id: "patio-verde", name: "Patio Verde", emoji: "🥐", city: "CDMX", area: "Condesa" },
];

export const CURRENT_MANAGER = {
  name: "manager",
  role: "Owner",
  email: "manager@casaluminar.mx",
};

export const VENUE = {
  id: "casa-luminar",
  name: "Casa Luminar",
  status: "verified" as const,
  category: "Mediterranean",
  vibe: "Rooftop",
  area: "San Pedro",
  city: "Monterrey",
  cover:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop",
  photos: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80&auto=format&fit=crop",
  ],
  contact: { phone: "+52 81 1234 5678", email: "hola@casaluminar.mx", website: "casaluminar.mx" },
  social: { instagram: "@casaluminar", facebook: "casaluminar", tiktok: "@casaluminar" },
  delivery: { uberEats: "casaluminar", rappi: "casaluminar" },
  hours: [
    { day: "Mon", range: "Closed" },
    { day: "Tue", range: "7:00pm – 1:00am" },
    { day: "Wed", range: "7:00pm – 1:00am" },
    { day: "Thu", range: "7:00pm – 2:00am" },
    { day: "Fri", range: "7:00pm – 2:00am" },
    { day: "Sat", range: "6:00pm – 2:00am" },
    { day: "Sun", range: "12:00pm – 11:00pm" },
  ],
};

export const KPIS = [
  { label: "Visits this month", value: "184", delta: "+24%", trend: "up" as const },
  { label: "Influenced spend", value: "MX$272k", delta: "+18%", trend: "up" as const },
  { label: "Cashback paid", value: "MX$38k", delta: "+12%", trend: "up" as const },
  { label: "ROAS", value: "7.1×", delta: "+0.4", trend: "up" as const },
];

export const VISITS_BY_DAY = [
  { day: "Mon", count: 0 },
  { day: "Tue", count: 14 },
  { day: "Wed", count: 18 },
  { day: "Thu", count: 32 },
  { day: "Fri", count: 41 },
  { day: "Sat", count: 56 },
  { day: "Sun", count: 23 },
];

export const FUNNEL = [
  { stage: "Profile views", value: 12_480 },
  { stage: "Swipes right", value: 4_320 },
  { stage: "Coupons claimed", value: 1_860 },
  { stage: "Visits", value: 612 },
  { stage: "Stories shared", value: 146 },
];

export const ANALYTICS_KPIS = [
  { label: "Profile views", value: "12.4k", delta: "+18%", trend: "up" as const },
  { label: "Influenced spend", value: "$84.2k", delta: "+22%", trend: "up" as const },
  { label: "Cashback paid", value: "$11.8k", delta: "+14%", trend: "up" as const },
  { label: "Gifts shared", value: "146", delta: "+31%", trend: "up" as const },
];

export const SECONDARY_METRICS = [
  { label: "Average ticket", value: "$642", delta: "+9% vs last 30d", trend: "up" as const },
  { label: "Repeat rate", value: "38%", delta: "+6 pts", trend: "up" as const },
  { label: "ROAS", value: "7.1×", delta: "+0.8×", trend: "up" as const },
];

export const VERIFIED_STORIES: {
  handle: string;
  tier: Tier;
  ago: string;
  gradient: string;
}[] = [
  { handle: "@valenrose", tier: "gold", ago: "2h", gradient: "from-pink-300 via-rose-300 to-amber-200" },
  { handle: "@matgg", tier: "gold", ago: "5h", gradient: "from-fuchsia-300 via-pink-300 to-orange-200" },
  { handle: "@sof.ah", tier: "silver", ago: "1d", gradient: "from-rose-300 via-pink-200 to-yellow-100" },
  { handle: "@luispb", tier: "silver", ago: "1d", gradient: "from-pink-200 via-rose-200 to-amber-200" },
  { handle: "@anita", tier: "bronze", ago: "2d", gradient: "from-rose-200 via-pink-300 to-fuchsia-200" },
  { handle: "@noctura", tier: "gold", ago: "3d", gradient: "from-amber-200 via-pink-300 to-fuchsia-300" },
];

export const VALIDATOR_FEED: {
  id: string;
  name: string;
  role: string;
  lastActive: string;
  status: "online" | "away" | "offline";
  validated: number;
  flagged: number;
  avatarBg: string;
}[] = [
  { id: "vf-carlos", name: "Carlos", role: "Bar lead", lastActive: "2m", status: "online", validated: 18, flagged: 1, avatarBg: "bg-emerald-500" },
  { id: "vf-lucia", name: "Lucía", role: "Hostess", lastActive: "8m", status: "online", validated: 11, flagged: 0, avatarBg: "bg-pink-400" },
  { id: "vf-tono", name: "Toño", role: "Waiter", lastActive: "1h", status: "away", validated: 7, flagged: 2, avatarBg: "bg-orange-400" },
];

export const VALIDATOR_THREAD: {
  id: string;
  side: "in" | "out";
  text: string;
  at: string;
  warning?: string;
}[] = [
  { id: "m1", side: "in", text: "🌳 Mesa 7 · Valeria · $840 · 20% cashback", at: "20:12" },
  { id: "m2", side: "out", text: "OK validado", at: "20:12" },
  { id: "m3", side: "in", text: "Mesa 3 · Diego · $1,420 · 10%", at: "20:31" },
  { id: "m4", side: "out", text: "OK", at: "20:31" },
  { id: "m5", side: "in", text: "Mesa 11 · Sofía · $620 · 20%", at: "20:48", warning: "ticket sin propina" },
];

export type GuestType = "Volume" | "Magnetic" | "Rich" | "Magnetic + Rich";

export type ExampleGuest = {
  name: string;
  handle: string;
  followers: string;
  avatar: string;
  spendNote?: string;
};

export const TIER_CASHBACK: {
  tier: Tier;
  percent: number;
  visitsRange: string;
  audience: number;
  reach: string;
  guestType: GuestType;
  examples: ExampleGuest[];
}[] = [
  {
    tier: "bronze",
    percent: 5,
    visitsRange: "0 – 2 visits",
    audience: 18_420,
    reach: "Everyone within 1km",
    guestType: "Volume",
    examples: [],
  },
  {
    tier: "silver",
    percent: 10,
    visitsRange: "3 – 6 visits",
    audience: 6_240,
    reach: "1K+ followers",
    guestType: "Magnetic",
    examples: [
      {
        name: "Sofía P.",
        handle: "@sofip",
        followers: "1.4K",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop&crop=faces",
      },
      {
        name: "Renata K.",
        handle: "@renatak",
        followers: "2.1K",
        avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80&auto=format&fit=crop&crop=faces",
      },
      {
        name: "Tomás L.",
        handle: "@tomasl",
        followers: "1.8K",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80&auto=format&fit=crop&crop=faces",
      },
    ],
  },
  {
    tier: "gold",
    percent: 20,
    visitsRange: "7 – 19 visits",
    audience: 1_860,
    reach: "5K+ followers",
    guestType: "Magnetic",
    examples: [
      {
        name: "Valentina R.",
        handle: "@valenrose",
        followers: "12.5K",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=faces",
      },
      {
        name: "Lucas M.",
        handle: "@lucasm",
        followers: "8.4K",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80&auto=format&fit=crop&crop=faces",
      },
      {
        name: "Mateo F.",
        handle: "@matef",
        followers: "6.2K",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop&crop=faces",
      },
    ],
  },
  {
    tier: "diamond",
    percent: 50,
    visitsRange: "20+ visits",
    audience: 184,
    reach: "20K+ followers · invite-only",
    guestType: "Magnetic + Rich",
    examples: [
      {
        name: "Camila V.",
        handle: "@camivb",
        followers: "142K",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop&crop=faces",
        spendNote: "MX$84k lifetime",
      },
      {
        name: "Ana T.",
        handle: "@anat",
        followers: "67K",
        avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&q=80&auto=format&fit=crop&crop=faces",
        spendNote: "MX$62k lifetime",
      },
      {
        name: "Valentina R.",
        handle: "@valenrose",
        followers: "38K",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=faces",
        spendNote: "MX$47k lifetime",
      },
    ],
  },
];

export const NEARBY_NEVER_VISITED = 12_480;

export const COMMUNITIES = [
  { id: "tec", name: "Tec de Monterrey", color: "bg-[#0033A0] text-white", audience: 1_840, handles: ["@valenrose", "@camivb", "@anat"], boost: 5, on: true },
  { id: "udem", name: "UDEM", color: "bg-[#003F2D] text-white", audience: 920, handles: ["@sofip", "@matef"], boost: 5, on: true },
  { id: "stanford", name: "Stanford", color: "bg-[#8C1515] text-white", audience: 312, handles: ["@lucasm", "@tomasl"], boost: 10, on: false },
  { id: "itam", name: "ITAM", color: "bg-[#003366] text-white", audience: 640, handles: ["@diegoa", "@renatak"], boost: 5, on: false },
];

export const WELCOME_OFFER = {
  active: true,
  percent: 20,
  cap: 1000,
  expiresAt: "Dec 31, 2026",
};

export const RECENT_VISITS = [
  { id: "v-1", guest: "Valentina R.", tier: "gold" as Tier, amount: 1840, cashback: 276, story: true, when: "2h ago" },
  { id: "v-2", guest: "Lucas M.", tier: "gold" as Tier, amount: 920, cashback: 138, story: true, when: "4h ago" },
  { id: "v-3", guest: "Renata G.", tier: "silver" as Tier, amount: 640, cashback: 64, story: false, when: "6h ago" },
  { id: "v-4", guest: "Diego A.", tier: "silver" as Tier, amount: 1240, cashback: 124, story: true, when: "yesterday" },
  { id: "v-5", guest: "Sofia L.", tier: "bronze" as Tier, amount: 420, cashback: 21, story: false, when: "yesterday" },
  { id: "v-6", guest: "Mateo F.", tier: "gold" as Tier, amount: 2100, cashback: 315, story: true, when: "2d ago" },
];

export const UPCOMING_RESERVATIONS = [
  { id: "rsv-1", guest: "Camila V.", tier: "diamond" as Tier, party: 6, when: "Tonight · 8:30 PM", status: "confirmed" as const },
  { id: "rsv-2", guest: "Andrés J.", tier: "gold" as Tier, party: 4, when: "Tonight · 9:00 PM", status: "confirmed" as const },
  { id: "rsv-3", guest: "Paula M.", tier: "silver" as Tier, party: 2, when: "Tonight · 10:30 PM", status: "pending" as const },
  { id: "rsv-4", guest: "Isabela R.", tier: "gold" as Tier, party: 4, when: "Tomorrow · 8:00 PM", status: "confirmed" as const },
];

export const WALLET = {
  balance: 142_300,
  pendingPayout: 38_400,
  thisMonth: 38_400,
  lifetime: 412_900,
  payoutAccount: "BBVA · ··· 4421",
  stripeConnected: true,
};

export const TRANSACTIONS = [
  { id: "t-1", kind: "visit" as const, label: "Visit · Valentina R.", amount: 1840, cashback: -276, when: "2h ago" },
  { id: "t-2", kind: "visit" as const, label: "Visit · Lucas M.", amount: 920, cashback: -138, when: "4h ago" },
  { id: "t-3", kind: "payout" as const, label: "Payout · BBVA ··· 4421", amount: -24_500, cashback: 0, when: "Yesterday" },
  { id: "t-4", kind: "visit" as const, label: "Visit · Renata G.", amount: 640, cashback: -64, when: "Yesterday" },
  { id: "t-5", kind: "fee" as const, label: "Mesita commission · May", amount: -2_400, cashback: 0, when: "3 days ago" },
  { id: "t-6", kind: "payout" as const, label: "Payout · BBVA ··· 4421", amount: -52_000, cashback: 0, when: "1 week ago" },
];

export const TEAM = [
  {
    id: "m-1",
    name: "Iván Solís",
    role: "Owner",
    access: "full" as const,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop&crop=faces",
    lastActive: "Now",
  },
  {
    id: "m-2",
    name: "Marta R.",
    role: "Manager",
    access: "full" as const,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop&crop=faces",
    lastActive: "1h ago",
  },
];

export const VALIDATORS = [
  { id: "w-1", name: "Carlos M.", role: "Waiter", phone: "+52 81 1234 5678", lastActive: "Now" },
  { id: "w-2", name: "Lucía P.", role: "Waiter", phone: "+52 81 9876 5432", lastActive: "2h ago" },
  { id: "w-3", name: "Diego A.", role: "Host", phone: "+52 81 5555 1212", lastActive: "Yesterday" },
];

export const COPILOT_SUGGESTIONS = [
  "Why are Thursdays so much better than Wednesdays?",
  "Draft a Story Bonus for Sunday brunch.",
  "Which guests bring the most followers per visit?",
  "Compare May vs April spend, focus on Diamond guests.",
  "What's our payback period vs the average partner?",
];

export const COPILOT_HISTORY = [
  {
    role: "user" as const,
    text: "How are Saturdays trending?",
  },
  {
    role: "assistant" as const,
    text: "Saturday visits are up 23% vs the four-week average. Influenced spend is MX$84k on the latest Saturday — your strongest day this month. 41% of Sat visitors are Gold or Diamond, and 78% posted a story. Suggest extending the bar program from 11 PM → midnight and pushing the Rooftop Drop one tier higher for Diamond.",
  },
];
