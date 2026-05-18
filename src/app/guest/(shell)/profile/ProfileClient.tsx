"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Crown,
  TrendingUp,
  Instagram,
  GraduationCap,
  BadgeCheck,
  Plus,
  ChevronRight,
  Check,
  User as UserIcon,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  Award,
  Lock,
} from "lucide-react";
import { SimpleHeader } from "@/components/guest/SimpleHeader";
import { SignOutButton } from "@/components/auth/SignOutButton";
import {
  CURRENT_USER,
  TIERS,
  COMMUNITIES_JOINED,
  COMMUNITIES_ALL,
  TRANSACTIONS,
  ACHIEVEMENTS,
  venueById,
} from "@/lib/guest-data";
import { cn } from "@/lib/utils";

type Tab = "class" | "balance" | "game" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "class", label: "Class" },
  { id: "balance", label: "Balance" },
  { id: "game", label: "Game" },
  { id: "settings", label: "Settings" },
];

// The identity bits that survive real onboarding — name, email, country,
// birthday, sex — flow in from the server page. Everything else on this
// page (tier ladder, communities, achievements, transactions) is still
// mock until the corresponding schema columns + Edge Functions ship.
export type RealIdentity = {
  fullName: string | null;
  email: string | null;
  country: string | null;
  birthday: string | null;
  sex: string | null;
};

export function ProfileClient({ identity }: { identity: RealIdentity }) {
  const [tab, setTab] = useState<Tab>("class");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  // Display name: prefer the onboard-supplied full_name; otherwise the
  // email local-part as a fallback. Never the mock CURRENT_USER.name.
  const displayName =
    identity.fullName ??
    (identity.email ? identity.email.split("@")[0] : null) ??
    "Guest";
  const initial = displayName.trim().slice(0, 1).toUpperCase() || "?";

  // Identity facts shown next to the avatar — only the ones the guest
  // actually filled. No mock fallbacks.
  const age = identity.birthday ? yearsSince(identity.birthday) : null;
  const subtitleParts: string[] = [];
  if (identity.country) subtitleParts.push(identity.country);
  if (age != null) subtitleParts.push(`${age}`);
  if (identity.sex) subtitleParts.push(prettySex(identity.sex));

  // True when the guest hasn't completed any of the onboard fields. We
  // surface a "Complete your profile" banner pointing at /guest/onboard
  // so they can fill it in.
  const incomplete =
    !identity.fullName ||
    !identity.country ||
    !identity.birthday ||
    !identity.sex;

  return (
    <div className="flex h-full flex-col">
      <SimpleHeader title="Mesita" eyebrow="Profile" />

      <div className="px-5 pt-3">
        <p className="rounded-xl bg-secondary/10 px-3 py-2 text-[11px] text-secondary">
          Preview — tier, communities, achievements and the transactions feed below are mock
          values. Your name, email, country, age and sex are real. Your cashback balance lives on /qr.
        </p>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-pink-gradient text-2xl font-bold text-white shadow-glow ring-2 ring-card">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-2xl font-semibold tracking-tight">
                {displayName}
              </h1>
              <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                <Crown className="h-3 w-3" />
                {CURRENT_USER.tier}
              </span>
            </div>
            {subtitleParts.length > 0 ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {subtitleParts.join(" · ")}
              </p>
            ) : (
              <p className="mt-0.5 text-sm italic text-muted-foreground/70">
                No country / age / sex yet.
              </p>
            )}
            {identity.email && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                {identity.email}
              </p>
            )}
          </div>
        </div>

        {incomplete && (
          <Link
            href="/guest/onboard"
            className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-secondary/40 bg-secondary/5 px-4 py-3 text-[12px] text-secondary transition hover:bg-secondary/10"
          >
            <span>
              <span className="font-semibold">Complete your guest profile.</span>{" "}
              <span className="text-secondary/80">Adds your name, country, age, and sex.</span>
            </span>
            <span aria-hidden className="text-base">→</span>
          </Link>
        )}
      </div>

      <div className="px-4 pt-4">
        <div className="flex rounded-full border border-border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-sm font-medium transition",
                tab === t.id
                  ? "bg-pink-gradient text-white shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5 scrollbar-hide">
        {tab === "class" && (
          <ClassTab
            onConnectInstagram={() => setVerifyOpen(true)}
            onJoinCommunity={() => setJoinOpen(true)}
          />
        )}
        {tab === "balance" && <BalanceTab />}
        {tab === "game" && <GameTab />}
        {tab === "settings" && <SettingsTab />}
      </div>

      {verifyOpen && <VerifyInstagramSheet onClose={() => setVerifyOpen(false)} />}
      {joinOpen && <JoinCommunitySheet onClose={() => setJoinOpen(false)} />}
    </div>
  );
}

function ClassTab({
  onConnectInstagram,
  onJoinCommunity,
}: {
  onConnectInstagram: () => void;
  onJoinCommunity: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-secondary" />
            Spent on Mesita
          </div>
          <span className="text-[11px] text-muted-foreground">All-time</span>
        </div>
        <div className="mt-3">
          <p className="font-display text-5xl font-bold leading-none tracking-tight">
            MX${CURRENT_USER.spendMxn.toLocaleString()}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            MX${CURRENT_USER.spentToNextTier.toLocaleString()} to{" "}
            <span className="font-semibold text-foreground">Diamond</span>
          </p>
        </div>
        <TierProgressBar />
      </div>

      <button
        type="button"
        onClick={onConnectInstagram}
        className="flex items-center gap-4 rounded-2xl bg-[linear-gradient(135deg,oklch(0.93_0.05_30),oklch(0.92_0.08_50))] p-4 text-left shadow-sm"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,oklch(0.70_0.20_30),oklch(0.65_0.20_350))] text-white">
          <Instagram className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold tracking-tight">
            Connect Instagram
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Unlock Silver, Gold, Diamond class instantly
          </p>
        </div>
        <span className="rounded-full bg-pink-gradient px-4 py-2 text-[12px] font-semibold text-white shadow-sm">
          Connect
        </span>
      </button>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Crown className="h-3.5 w-3.5 text-secondary" />
            Class ladder
          </div>
          <span className="text-[11px] text-muted-foreground">Followers or spend</span>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          Your Class is how the city sees you — earned by being{" "}
          <span className="font-semibold text-foreground">popular</span> on Instagram or{" "}
          <span className="font-semibold text-foreground">spending</span> on Mesita. Higher Class ·
          more cashback. Models, talents, elites, chefs & press can also get{" "}
          <span className="font-semibold text-foreground">Diamond</span> by invite or appeal.
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          {TIERS.map((t) => {
            const isCurrent = t.id === CURRENT_USER.tier;
            return (
              <div
                key={t.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5",
                  isCurrent ? "border border-foreground bg-card" : "border border-transparent bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    t.id === "bronze" && "bg-tier-bronze text-white",
                    t.id === "silver" && "bg-tier-silver text-white",
                    t.id === "gold" && "bg-tier-gold text-black",
                    t.id === "diamond" && "bg-tier-diamond text-white",
                  )}
                >
                  {isCurrent || ["bronze", "silver", "gold"].includes(t.id) ? (
                    t.id === "diamond" ? (
                      <span className="font-display font-bold">D</span>
                    ) : (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    )
                  ) : (
                    <span className="font-display font-bold">{t.label[0]}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-display text-base font-semibold tracking-tight">
                      {t.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.req}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold leading-tight">{t.cashback}</p>
                  <p className="text-[10px] text-muted-foreground">{t.perk}</p>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-3 py-3 text-left transition hover:bg-muted/40"
        >
          <Crown className="h-4 w-4 shrink-0 text-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Appeal for upgrade</p>
            <p className="text-[11px] text-muted-foreground">
              Model, chef, press, founder? Request manual review.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-secondary" />
            Communities
          </div>
          <span className="text-[11px] text-muted-foreground">Email-verified</span>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {COMMUNITIES_JOINED.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white",
                  c.color,
                )}
              >
                <GraduationCap className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">Verified via {c.handle}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-semibold text-secondary">
                <BadgeCheck className="h-3 w-3" />
                Member
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={onJoinCommunity}
            className="flex items-center gap-3 rounded-xl border border-dashed border-secondary/40 bg-secondary/5 px-3 py-2.5 text-left transition hover:bg-secondary/10"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
              <Plus className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Join a community</p>
              <p className="text-[11px] text-muted-foreground">
                Verify your school or org email — unlock filtered venues.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          You can be in many communities — but only one Class. Some venues boost cashback for
          verified members of certain communities — e.g. Tec students fill rooftops in San Pedro on
          Thursdays, Stanford alumni gather at wine bars in Polanco, ITAM crowds the brunch spots
          in Condesa on Sundays.
        </p>
      </div>
    </div>
  );
}

function TierProgressBar() {
  const tierIdx = ["bronze", "silver", "gold", "diamond"].indexOf(CURRENT_USER.tier);
  const labels = ["Bronze", "Silver", "Gold", "Diamond"];
  const colors = ["bg-tier-bronze", "bg-tier-silver", "bg-tier-gold", "bg-tier-diamond"];
  return (
    <div className="mt-5">
      <div className="relative h-2 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full bg-pink-gradient" style={{ width: "68%" }} />
        {labels.map((_, i) => {
          const pct = (i / (labels.length - 1)) * 100;
          return (
            <span
              key={i}
              className={cn(
                "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card",
                i <= tierIdx ? colors[i] : "bg-muted",
              )}
              style={{ left: `${pct}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function BalanceTab() {
  return (
    <div className="flex flex-col">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Balance
      </p>
      <p className="mt-1 font-display text-6xl font-bold tracking-tight">
        ${CURRENT_USER.balance.toLocaleString()}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Expires 90 days after your last usage · Auto-applies on your next visit
      </p>
      <button
        type="button"
        className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold transition hover:bg-muted"
      >
        <Plus className="h-4 w-4" />
        Add credits
      </button>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Activity
          </p>
          <button type="button" className="text-[12px] font-semibold text-secondary">
            See all
          </button>
        </div>
        <div className="mt-2 divide-y divide-border">
          {TRANSACTIONS.map((t) => {
            const v = venueById(t.venueId);
            if (!v) return null;
            const positive = t.amount > 0;
            return (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <span className="text-2xl">{v.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.when}
                    {t.expires && ` · expires in ${t.expires}`}
                  </p>
                </div>
                <p
                  className={cn(
                    "font-display text-lg font-bold tabular-nums",
                    positive ? "text-secondary" : "text-foreground",
                  )}
                >
                  {positive ? "+" : "−"}${Math.abs(t.amount).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GameTab() {
  const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Achievements
        </p>
        <span className="text-[12px] font-semibold text-secondary">
          {unlocked} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>
      <div className="mt-3 rounded-2xl border border-border bg-card p-3">
        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center",
                a.unlocked
                  ? "border-border bg-card"
                  : "border-transparent bg-muted/40 opacity-60",
              )}
            >
              <span className="relative">
                <span
                  className={cn(
                    "block h-1.5 w-3 rounded-sm",
                    a.unlocked ? "bg-[oklch(0.55_0.22_250)]" : "bg-muted-foreground/30",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-1/2 top-0 block h-1.5 w-1 -translate-x-1/2 rounded-sm",
                    a.unlocked ? "bg-[oklch(0.65_0.22_25)]" : "bg-muted-foreground/30",
                  )}
                />
                <span
                  className={cn(
                    "mt-1 block flex h-8 w-8 items-center justify-center rounded-full",
                    a.unlocked
                      ? "bg-tier-gold text-black shadow-sm"
                      : "bg-muted text-muted-foreground/40",
                  )}
                >
                  <Award className="h-4 w-4" />
                </span>
              </span>
              <p
                className={cn(
                  "text-[11px] font-semibold leading-tight",
                  !a.unlocked && "text-muted-foreground",
                )}
              >
                {a.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const items = [
    { Icon: UserIcon, label: "Personal details", sub: "Name, email, phone" },
    { Icon: CreditCard, label: "Payment methods", sub: "Apple Pay · Visa · 4242" },
    { Icon: Bell, label: "Notifications", sub: "Push, email" },
    { Icon: Shield, label: "Privacy & data", sub: "Permissions, export" },
    { Icon: HelpCircle, label: "Help & support", sub: "FAQ · contact us" },
  ];
  return (
    <div className="flex flex-col">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Account
      </p>
      <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {items.map(({ Icon, label, sub }) => (
          <button
            key={label}
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="block text-[11px] text-muted-foreground">{sub}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <SignOutButton
        redirectTo="/guest/sign-in"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-4 text-sm font-semibold transition hover:bg-muted"
      />
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Not signed in?{" "}
        <Link href="/guest/sign-in" className="font-semibold text-foreground hover:underline">
          Sign in
        </Link>
        {" · "}
        <Link href="/guest/sign-up" className="font-semibold text-foreground hover:underline">
          Create account
        </Link>
      </p>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">Mesita · v2.4.1</p>
    </div>
  );
}

function VerifyInstagramSheet({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full rounded-t-3xl bg-card p-5 shadow-elev">
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-foreground/30" />
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,oklch(0.70_0.20_30),oklch(0.65_0.20_350))] text-white">
            <Instagram className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Verify Instagram
            </h2>
            <p className="text-[12px] text-muted-foreground">
              via <span className="text-foreground">@mesita.bot</span> · 1-minute setup
            </p>
          </div>
        </div>
        <ol className="mt-5 flex flex-col gap-3">
          {[
            <>Follow <span className="text-secondary">@mesita.bot</span> on Instagram.</>,
            <>DM <span className="text-secondary">@mesita.bot</span> with the word{" "}
              <span className="font-mono text-secondary">VERIFY</span>.</>,
            <>Mesita will reply with an 8-digit verification code. Paste it here.</>,
            <>Your class is set instantly from your follower count.</>,
          ].map((line, i) => (
            <li key={i} className="flex items-start gap-3 text-[13px] leading-snug">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-[11px] font-bold text-secondary">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste 8-digit code"
          className="mt-4 h-12 w-full rounded-full border border-border bg-muted/30 px-5 text-center text-sm outline-none placeholder:text-muted-foreground/70"
          maxLength={8}
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={code.length < 8}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink-gradient py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
          >
            <BadgeCheck className="h-4 w-4" />
            Verify
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          We never ask for your Instagram password.
        </p>
      </div>
    </div>
  );
}

function JoinCommunitySheet({ onClose }: { onClose: () => void }) {
  const [communityTab, setCommunityTab] = useState("colleges");
  const tabs = [
    { id: "colleges", label: "Colleges", soon: false },
    { id: "companies", label: "Companies", soon: true },
    { id: "sports", label: "Sports clubs", soon: true },
    { id: "alumni", label: "Alumni", soon: true },
  ];
  return (
    <div className="absolute inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex h-[80%] w-full flex-col rounded-t-3xl bg-card shadow-elev">
        <div className="shrink-0 px-5 pb-3 pt-3">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-foreground/30" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Join a community
              </p>
              <h2 className="mt-0.5 font-display text-2xl font-semibold tracking-tight">
                Find your tribe
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Verify once with your school email — unlock community-only filters and the
                occasional cashback boost.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="mt-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => !t.soon && setCommunityTab(t.id)}
                disabled={t.soon}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition",
                  communityTab === t.id
                    ? "bg-foreground text-background"
                    : "border border-border bg-card text-muted-foreground",
                  t.soon && "opacity-60",
                )}
              >
                <GraduationCap className="h-3 w-3" />
                {t.label}
                {t.soon && (
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    soon
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {COMMUNITIES_ALL.length} schools
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
          <div className="flex flex-col gap-2">
            {COMMUNITIES_ALL.map((c) => (
              <button
                key={c.id}
                type="button"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left transition hover:bg-muted/40"
              >
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white",
                    c.color,
                  )}
                >
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">📍 {c.city}</span> ·{" "}
                    {c.handle}
                  </p>
                </div>
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Years since a YYYY-MM-DD birthday string. Returns null on bad input so
// the caller can simply skip the "27"-style age line when the guest hasn't
// filled their birthday yet.
function yearsSince(birthday: string): number | null {
  const parsed = new Date(`${birthday}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - parsed.getUTCFullYear();
  const m = now.getUTCMonth() - parsed.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < parsed.getUTCDate())) age -= 1;
  if (age < 0 || age > 130) return null;
  return age;
}

// Display the sex string as a Title-Cased label. The DB stores raw values
// (male/female/other); the header shows "Female", "Male", "Other".
function prettySex(sex: string): string {
  const lower = sex.trim().toLowerCase();
  if (!lower) return "";
  return lower[0].toUpperCase() + lower.slice(1);
}
