"use client";

import { useState } from "react";
import { Copy, ChevronRight, Check, Plus } from "lucide-react";
import { SimpleHeader } from "@/components/guest/SimpleHeader";
import { cn } from "@/lib/utils";

type Tab = "guests" | "venues" | "creators" | "others";

const TABS: { id: Tab; label: string }[] = [
  { id: "guests", label: "Guests" },
  { id: "venues", label: "Venues" },
  { id: "creators", label: "Creators" },
  { id: "others", label: "Others" },
];

export default function SharePage() {
  const [tab, setTab] = useState<Tab>("guests");

  return (
    <div className="flex h-full flex-col">
      <SimpleHeader title="Mesita" eyebrow="Share with friends" />

      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-0 rounded-full border border-border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full px-1 py-1.5 text-center text-[12px] font-medium transition",
                tab === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-hide">
        {tab === "guests" && <GuestsTab />}
        {tab === "venues" && <VenuesTab />}
        {tab === "creators" && <CreatorsTab />}
        {tab === "others" && <OthersTab />}
      </div>
    </div>
  );
}

function FeatureCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <p className="text-sm font-semibold leading-tight">{title}</p>
      <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{sub}</p>
    </div>
  );
}

function UrlField({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API can fail on insecure origins or older browsers — fall
      // back to noop. We could select the text, but the URL is already in
      // view so the user can long-press to copy on mobile.
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
      <span className="flex-1 truncate font-mono text-[13px]">{url}</span>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy"}
        onClick={onCopy}
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function PrimaryCta({ label, share }: { label: string; share?: { title: string; text: string; url?: string } }) {
  // Three states so the button feels alive:
  //   idle    → original label + chevron
  //   shared  → 'Shared' tick (navigator.share succeeded)
  //   copied  → 'Copied to clipboard' (fallback path)
  // Resets to idle after ~1.6s.
  const [flash, setFlash] = useState<null | "shared" | "copied">(null);
  const onClick = async () => {
    if (!share) return;
    const payload = {
      title: share.title,
      text: share.text,
      url: share.url ?? window.location.origin,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        setFlash("shared");
        window.setTimeout(() => setFlash(null), 1600);
        return;
      } catch {
        // User cancelled or the share sheet refused — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(`${share.text} ${payload.url}`);
      setFlash("copied");
      window.setTimeout(() => setFlash(null), 1600);
    } catch {
      // Clipboard unavailable — fail silently; no visible state change.
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!share}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
    >
      {flash === "shared" ? (
        <>
          <Check className="h-4 w-4" />
          Shared
        </>
      ) : flash === "copied" ? (
        <>
          <Check className="h-4 w-4" />
          Copied to clipboard
        </>
      ) : (
        <>
          {label}
          <ChevronRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

function GuestsTab() {
  const giftCode = "8F2K — 9XQ7";
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(giftCode.replace(/\s+/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable — silent.
    }
  };
  const treated = [
    { initials: "CV", name: "Camila", date: "May 2" },
    { initials: "MF", name: "Mateo", date: "May 5" },
  ];
  const slots = 5;
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        You&apos;ve got {slots} gift cards to hand out. Send your code and the first friends who use it
        each get $100 MXN — courtesy of you.
      </p>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex min-h-[200px] items-stretch gap-3">
          <div className="flex w-[34%] flex-col items-center justify-between py-2">
            <span className="text-5xl leading-none" aria-hidden>
              🎀
            </span>
            <p className="text-[10px] font-medium uppercase leading-snug tracking-[0.18em] text-muted-foreground/80">
              To a
              <br />
              friend
              <br />
              from <span className="font-bold text-foreground">you</span>
            </p>
          </div>
          <div
            className="w-px shrink-0 self-stretch"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, var(--border) 50%, transparent 50%)",
              backgroundSize: "1px 8px",
              backgroundRepeat: "repeat-y",
            }}
            aria-hidden
          />
          <div className="flex flex-1 flex-col justify-between text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Mesita 🌲
              <br />
              Gift card
            </p>
            <div>
              <p className="font-display text-6xl font-semibold leading-none tracking-tight">
                $100
              </p>
              <p className="mt-1.5 text-[10px] font-medium tracking-[0.4em] text-muted-foreground">
                MXN
              </p>
            </div>
            <div className="flex items-end justify-end gap-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Code
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold">{giftCode}</p>
              </div>
              <button
                type="button"
                aria-label={copied ? "Copied" : "Copy code"}
                onClick={onCopy}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Friends you&apos;ve treated
          </p>
          <p className="text-[11px] font-semibold text-secondary">
            {treated.length} gifted · {slots - treated.length} to go
          </p>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {Array.from({ length: slots }).map((_, i) => {
            const f = treated[i];
            if (f) {
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-pink-gradient">
                    <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-white">
                      {f.initials}
                    </span>
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tier-gold text-black shadow-sm">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold leading-none">{f.name}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{f.date}</p>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground/60">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Waiting
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2">
        <PrimaryCta
          label="Send a gift to a friend"
          share={{
            title: "Mesita — your first visit is on me",
            text: `Use my code ${giftCode.replace(/\s+/g, "")} for $100 MXN on your first Mesita visit.`,
          }}
        />
      </div>
    </div>
  );
}

// Three lighter partner programs collapsed into one page — Creators,
// Creators get their own top-level tab. Others stacks the remaining
// lighter partner programs — agencies + modeling talent — in compact
// cards on one scroll.
type PartnerGroup = {
  id: string;
  title: string;
  blurb: string;
  bullets: string[];
  url: string;
  shareUrl: string;
  shareTitle: string;
  shareText: string;
  cta: string;
};

const CREATOR_GROUP: PartnerGroup = {
  id: "creators",
  title: "Creators",
  blurb:
    "Food, nightlife, travel, lifestyle, hotels, coffee, wine, city guides. Custom codes, revenue share, private events, equity for long-term partners.",
  bullets: [
    "Custom code · bigger welcome gift",
    "Revenue share on your signups",
    "Private tastings & openings",
    "Equity path for long-term partners",
  ],
  url: "mesita.ai/creators",
  shareUrl: "https://www.mesita.ai/creators",
  shareTitle: "Mesita creator program",
  shareText:
    "Mesita partners with creators worldwide — custom codes, revenue share, and equity for long-term collabs.",
  cta: "Apply as a creator",
};

const OTHER_GROUPS: PartnerGroup[] = [
  {
    id: "agencies",
    title: "Marketing agencies",
    blurb:
      "Add Mesita to the stack you sell to restaurants & bars — measurable lift, no extra hardware.",
    bullets: [
      "Recurring revenue per venue you onboard",
      "Cashback redemptions = attributable ROI",
      "White-glove onboarding for your first 5 venues",
      "Partner dashboard across every client",
    ],
    url: "mesita.ai/agencies",
    shareUrl: "https://www.mesita.ai/agencies",
    shareTitle: "Mesita partner program",
    shareText:
      "Mesita's partner program could fit your agency — recurring revenue + co-branded campaigns.",
    cta: "Become a partner",
  },
  {
    id: "models",
    title: "Modeling & talent agencies",
    blurb:
      "Activate the models you manage on Mesita — Diamond perks, boosted cashback, priority tables. Earn on every visit.",
    bullets: [
      "Diamond by default — your roster skips tiers",
      "Boosted cashback at partner venues",
      "Priority tables on Fri & Sat",
      "Agency dashboard for bookings + earnings",
    ],
    url: "mesita.ai/models",
    shareUrl: "https://www.mesita.ai/models",
    shareTitle: "Mesita for talent agencies",
    shareText: "Get your talent roster Diamond access + revenue share on Mesita.",
    cta: "Activate your roster",
  },
];

function CreatorsTab() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {CREATOR_GROUP.blurb}
      </p>
      <PartnerCard group={CREATOR_GROUP} />
    </div>
  );
}

function OthersTab() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Two lighter partner programs Mesita runs alongside venues. Pick the
        one that fits — each has its own onboarding flow.
      </p>
      {OTHER_GROUPS.map((g) => (
        <PartnerCard key={g.id} group={g} />
      ))}
    </div>
  );
}

function PartnerCard({ group: g }: { group: PartnerGroup }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <header>
        <h3 className="font-display text-lg font-semibold tracking-tight">
          {g.title}
        </h3>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          {g.blurb}
        </p>
      </header>
      <ul className="flex flex-col gap-1.5">
        {g.bullets.map((b) => (
          <li
            key={b}
            className="text-[12px] leading-snug text-foreground before:mr-2 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40 before:align-middle"
          >
            {b}
          </li>
        ))}
      </ul>
      <UrlField url={g.url} />
      <PrimaryCta
        label={g.cta}
        share={{ title: g.shareTitle, text: g.shareText, url: g.shareUrl }}
      />
    </section>
  );
}

function VenuesTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          Know someone who runs a restaurant or bar?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Invite them to set up on Mesita — free, ~10 min.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <FeatureCard
          title="More customers"
          sub="Priority placement on swipe, map, catalog, AI planner."
        />
        <FeatureCard
          title="Better customers"
          sub="Socially-magnetic, higher-spend, repeat guests."
        />
        <FeatureCard
          title="Auto IG stories"
          sub="Each visit becomes organic reach, AI-verified."
        />
        <FeatureCard
          title="Easier reservations"
          sub="AI books through your existing channel — no new tools."
        />
        <FeatureCard
          title="Marketing intelligence"
          sub="Influenced spend, repeat rate, ROAS in one dashboard."
        />
        <FeatureCard
          title="Setup in 10 minutes"
          sub="All from a browser — no app, no hardware, no POS."
        />
      </div>
      <UrlField url="www.mesita.ai" />
      <PrimaryCta
        label="Send invitation"
        share={{
          title: "Mesita for venues",
          text: "I think you'd love Mesita — setup is ~10 min and free to start.",
          url: "https://www.mesita.ai",
        }}
      />
    </div>
  );
}

