"use client";

import { useState } from "react";
import { Copy, Mail, MessageCircle, ChevronRight, Check, Plus } from "lucide-react";
import { SimpleHeader } from "@/components/guest/SimpleHeader";
import { cn } from "@/lib/utils";

type Tab = "guests" | "creators" | "venues" | "agencies" | "models";

const TABS: { id: Tab; label: string }[] = [
  { id: "guests", label: "Guests" },
  { id: "creators", label: "Creators" },
  { id: "venues", label: "Venues" },
  { id: "agencies", label: "Agencies" },
  { id: "models", label: "Models" },
];

export default function SharePage() {
  const [tab, setTab] = useState<Tab>("guests");

  return (
    <div className="flex h-full flex-col">
      <SimpleHeader title="Mesita" eyebrow="Share with friends" />

      <div className="px-4 pt-4">
        <div className="flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium transition",
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
        {tab === "creators" && <CreatorsTab />}
        {tab === "venues" && <VenuesTab />}
        {tab === "agencies" && <AgenciesTab />}
        {tab === "models" && <ModelsTab />}
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

function PrimaryCta({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-sm font-semibold text-background transition hover:opacity-90"
    >
      {label}
      <ChevronRight className="h-4 w-4" />
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
        <PrimaryCta label="Send a gift to a friend" />
      </div>
    </div>
  );
}

function CreatorsTab() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Love Mesita and create content about food, nightlife, travel, lifestyle, hotels, coffee,
        wine or city guides? We partner with creators worldwide who genuinely live the experience —
        collabs, custom codes, revenue share, private venue events, and equity for long-term
        partners.
      </p>
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Let&apos;s collaborate
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <FeatureCard title="Custom code" sub="Bigger welcome gift for your followers." />
          <FeatureCard title="Revenue share" sub="Cut of cashback from your signups." />
          <FeatureCard title="Private events" sub="Tastings & openings before they go public." />
          <FeatureCard title="Equity path" sub="For partners who help shape Mesita." />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold transition hover:bg-muted"
          >
            <Mail className="h-4 w-4 text-secondary" />
            Email
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold transition hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4 text-secondary" />
            WhatsApp
          </button>
        </div>
        <p className="mt-3 text-center text-[12px] text-muted-foreground">
          We reply personally within a few days.
        </p>
      </div>
    </div>
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
        <FeatureCard title="More customers" sub="Featured in Mesita discovery." />
        <FeatureCard title="Better customers" sub="Socially-magnetic, higher-spend, loyal guests." />
        <FeatureCard title="Auto IG stories" sub="Each visit becomes organic reach." />
        <FeatureCard title="Live insights" sub="Repeat guests, AI visit summaries." />
        <FeatureCard title="Setup in 10 min" sub="All from a browser, no app." />
        <FeatureCard title="Free to start" sub="Costs nothing until it pays off." />
      </div>
      <UrlField url="www.mesita.ai" />
      <PrimaryCta label="Send invitation" />
    </div>
  );
}

function AgenciesTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          Run a marketing agency for venues?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add Mesita to the stack you sell to restaurants & bars — measurable lift, no extra
          hardware.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <FeatureCard title="Recurring revenue" sub="Earn a cut on every venue you onboard." />
        <FeatureCard title="Plug into IG" sub="Auto stories from real guest visits." />
        <FeatureCard title="Proof, not vibes" sub="Cashback redemptions = attributable ROI." />
        <FeatureCard title="White-glove onboarding" sub="We help you launch your first 5 venues." />
        <FeatureCard title="Co-branded campaigns" sub="Run tier drops with your creators." />
        <FeatureCard title="Partner dashboard" sub="Track all client venues in one place." />
      </div>
      <UrlField url="mesita.ai/agencies" />
      <PrimaryCta label="Become a partner" />
    </div>
  );
}

function ModelsTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          Run a modeling or talent agency?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Activate the models you manage on Mesita — they unlock Diamond perks, boosted cashback
          and priority tables at the city&apos;s best venues. You earn on every visit.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <FeatureCard title="Diamond by default" sub="Your roster skips tiers — instant VIP." />
        <FeatureCard title="Boosted cashback" sub="Up to 2× cashback at partner venues." />
        <FeatureCard title="Priority tables" sub="Last-minute access on Fri & Sat nights." />
        <FeatureCard title="Story-for-table" sub="Models post · venues comp · everyone wins." />
        <FeatureCard title="Agency dashboard" sub="Track bookings, stories & earnings per talent." />
        <FeatureCard title="Revenue share" sub="Earn on every visit your talent generates." />
      </div>
      <UrlField url="mesita.ai/models" />
      <PrimaryCta label="Activate your roster" />
    </div>
  );
}
