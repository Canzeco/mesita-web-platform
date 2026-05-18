import Image from "next/image";
import Link from "next/link";
import { Flame, LayoutDashboard, ScanLine, ShieldCheck } from "lucide-react";

const personaShortcuts = [
  { href: "/guest", label: "Guest", icon: Flame },
  { href: "/manager", label: "Manager", icon: LayoutDashboard },
  { href: "/validator", label: "Validator", icon: ScanLine },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
] as const;

export default function Home() {
  return (
    <main className="flex flex-col">
      <Nav />
      <Hero />
      <Audience />
      <ForGuests />
      <Tiers />
      <ForVenues />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          mesita
        </Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground lg:flex">
          <a href="#guests" className="hover:text-foreground">For you</a>
          <a href="#tiers" className="hover:text-foreground">Tiers</a>
          <a href="#venues" className="hover:text-foreground">For your business</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-1.5">
          {personaShortcuts.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-3"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pb-12 pt-20 text-center md:pb-16 md:pt-28">
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Smart hospitality · Made in Monterrey
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          The smartest cashback wallet for going out to eat, drink, and celebrate.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
          Mesita brings together every bar, café, restaurant, and club in your city, recommends where to go tonight, books for you with an AI agent, and pays you cashback when you pay through the app.
        </p>
        <p className="max-w-xl font-display text-base italic tracking-tight text-foreground md:text-lg">
          Some guests are part of the product.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/guest"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Download the app
          </Link>
          <Link
            href="/manager"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            List my venue
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          No hardware. No POS. Setup in ~10 minutes.
        </p>

        <figure className="mt-8 w-full overflow-hidden rounded-3xl border border-border shadow-elev md:mt-12">
          <Image
            src="/landing-hero.jpg"
            alt="Tacos and a mesita-branded drink on a rooftop with the Cerro de la Silla and Monterrey skyline behind"
            width={1540}
            height={1021}
            priority
            sizes="(max-width: 1024px) 100vw, 1100px"
            className="h-auto w-full"
          />
        </figure>
      </div>
    </section>
  );
}

function Audience() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 mx-6 my-12 md:mx-auto md:my-16">
        <div className="bg-background p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">For guests</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Discover, book, and earn.
          </h2>
          <p className="mt-3 text-muted-foreground">
            The whole city in a single app. Real recommendations based on your vibe, your area, and your budget. Your Mesita balance grows with every visit.
          </p>
          <Link
            href="/guest"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get started as a guest
          </Link>
        </div>
        <div className="bg-background p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">For businesses</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Fill your venue with the guests who actually move the needle.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Compete for guests with social presence, not for everyone equally. Configure cashback by tier, receive Instagram stories, and measure every attributed peso.
          </p>
          <Link
            href="/manager"
            className="mt-6 inline-block rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Become a partner
          </Link>
        </div>
      </div>
    </section>
  );
}

function ForGuests() {
  const items = [
    {
      title: "Experience intelligence",
      body: "The most complete catalog in your city, with reviews, ratings, prices, vibe, photos, and where Bronze, Silver, Gold, and Diamond guests are going right now. Swipe, map, catalog, or conversational AI.",
    },
    {
      title: "AI-powered reservations",
      body: "One tap and a voice, DM, WhatsApp, or email agent reaches out to the venue for you and locks in the table. Works at any venue in the city, even if they never signed with us.",
    },
    {
      title: "Real cashback",
      body: "Pay with Mesita and earn cashback to your prepaid balance. It applies only on your next visit to a verified partner. The higher your tier, the better the rate.",
    },
  ];

  return (
    <section id="guests" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Three things only Mesita gives you.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-xl border border-border bg-card p-6 text-card-foreground"
            >
              <h3 className="text-lg font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tiers() {
  const tiers = [
    {
      name: "Bronze",
      req: "Default · no IG or under 1K followers",
      desc: "Full catalog and reservation access.",
    },
    {
      name: "Silver",
      req: "1K+ followers · or MXN $5K+ spent",
      desc: "Elevated cashback at partners.",
    },
    {
      name: "Gold",
      req: "5K+ followers · or MXN $20K+ spent",
      desc: "Premium rates and priority.",
    },
    {
      name: "Diamond",
      req: "20K+ followers (invite-only) · or MXN $100K+ spent · or appeal",
      desc: "VIP treatment and private events.",
    },
  ];

  return (
    <section id="tiers" className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Your social capital is worth money.
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Four tiers. Two ways up: Instagram followers or lifetime Mesita spend.
            If the numbers don&apos;t capture your real-world influence — models,
            chefs, press, founders — Mesita can upgrade you manually.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border bg-background p-5"
            >
              <p className="text-2xl font-semibold tracking-tight">{t.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.req}</p>
              <p className="mt-4 text-sm">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForVenues() {
  const solutions = [
    {
      title: "Get discovered",
      body: "Priority over the auto-listed catalog ~100× larger. A welcome offer ready against the real pool of nearby guests who have never visited you.",
    },
    {
      title: "Attract the magnetic ones",
      body: "Configure different cashback for Bronze, Silver, Gold, and Diamond. Reward the guests who fill the room and post it to their 8,000 followers.",
    },
    {
      title: "Automatic Instagram stories",
      body: "Our bot validates that every Story tags your venue. No Story, no cashback. Real, measurable exposure — no chasing screenshots.",
    },
    {
      title: "Frictionless reservations",
      body: "They appear the moment you exist in the catalog. You'll see tier and party size before the visit. Fill slow days with surgical discounts.",
    },
    {
      title: "Marketing intelligence",
      body: "Profile views, influenced spend, cashback paid, ROAS, full funnel, and an AI copilot that builds your next campaign in one click.",
    },
  ];

  return (
    <section id="venues" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          For Verified Partners
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
          An acquisition channel, not just another directory.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Compete for high-intent guests deciding right now where to go out. Setup in 10 minutes. Zero hardware, zero POS, zero training.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-border bg-card p-6 text-card-foreground"
            >
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl border border-border bg-card p-8 text-card-foreground">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Conservative case
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            300 partners × 30 redemptions/month × $300 ticket = $2.7M MXN influenced per month.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            ~$270K MXN in monthly commission at 10%. ~$3.24M MXN annual.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    "The guest asks for the check and opens their personal QR in the app.",
    "The waiter scans with their phone and opens the Mesita WhatsApp bot.",
    "Captures the check total and tip in a short form.",
    "The guest receives a Stripe link and pays from their phone.",
    "Cashback lands in the Mesita balance. If they leveled up by followers, their Story is validated.",
  ];

  return (
    <section id="how" className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          The checkout that changes everything.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Card payments only via Stripe. Verified Partners only. Ideal for FSR. Zero changes for the guest until the moment of payment.
        </p>
        <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-5">
          {steps.map((s, i) => (
            <li
              key={i}
              className="rounded-xl border border-border bg-background p-5"
            >
              <p className="text-2xl font-semibold tracking-tight text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 text-sm">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Pricing() {
  // The five plans are 1:1 with the venue_plan enum in the schema. Mechanic
  // is pinned by fiscal type (Formal → cashback, Informal → discount); the
  // plan only differs in price and visibility. Informal is 2× formal at
  // every tier because Mesita captures no wallet / transaction data on
  // the discount rail — the venue pays more for the same visibility.
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      cadence: "/ month",
      mechanic: "None",
      visibility: "Minimum",
      audience: "any" as const,
      blurb:
        "Scraped from Google Business. Discoverable + accepts AI reservations. No coupons, no dashboard.",
      bullets: ["Auto-listed", "AI reservations", "No coupon mechanic"],
      cta: "Use Free",
    },
    {
      id: "formal_pro",
      name: "Formal Pro",
      price: "$1,000",
      cadence: "MX / month",
      mechanic: "Cashback",
      visibility: "Medium",
      audience: "formal" as const,
      blurb:
        "Cashback on card payments through Mesita. Normal placement across swipe, map, catalog, AI.",
      bullets: [
        "Cashback (card via Mesita)",
        "Per-tier rates (Bronze · Silver · Gold · Diamond)",
        "Story bonus & verification",
        "Promos, Analytics, Wallet, Team",
      ],
      cta: "Become a partner",
    },
    {
      id: "formal_ultra",
      name: "Formal Ultra",
      price: "$3,000",
      cadence: "MX / month",
      mechanic: "Cashback",
      visibility: "Maximum",
      audience: "formal" as const,
      blurb:
        "Everything in Formal Pro plus top placement on every surface and featured slots.",
      bullets: [
        "Everything in Pro",
        "Top placement on swipe + map + catalog + AI",
        "Featured slots",
        "Priority support",
      ],
      cta: "Go Ultra",
      featured: true,
    },
    {
      id: "informal_pro",
      name: "Informal Pro",
      price: "$2,000",
      cadence: "MX / month",
      mechanic: "Discount",
      visibility: "Medium",
      audience: "informal" as const,
      blurb:
        "Instant discount on the cash bill. Mesita stays out of the payment flow.",
      bullets: [
        "Instant discount at the bill",
        "Cash or card — both fine",
        "Per-tier rates",
        "Promos, Analytics, Team",
      ],
      cta: "Become a partner",
    },
    {
      id: "informal_ultra",
      name: "Informal Ultra",
      price: "$6,000",
      cadence: "MX / month",
      mechanic: "Discount",
      visibility: "Maximum",
      audience: "informal" as const,
      blurb:
        "Top visibility on the discount rail. 2× formal because Mesita gets no transaction data.",
      bullets: [
        "Everything in Informal Pro",
        "Top placement",
        "Featured slots",
        "Priority support",
      ],
      cta: "Go Ultra",
      featured: true,
    },
  ];

  return (
    <section id="pricing" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pricing
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Guests are free. Venues pay for the mechanic and the visibility.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Mechanic is pinned by your fiscal type — Formal venues run
            cashback, Informal venues run instant discount. The plan only sets
            price and visibility.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`relative flex h-full flex-col rounded-2xl border p-5 ${
                p.featured
                  ? "border-foreground bg-card shadow-elev"
                  : "border-border bg-background"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-pink-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow">
                  Featured
                </span>
              )}
              <div className="flex items-center gap-2">
                <p className="font-display text-lg font-semibold tracking-tight">
                  {p.name}
                </p>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    p.audience === "formal"
                      ? "bg-pink-gradient text-white"
                      : p.audience === "informal"
                        ? "bg-tier-gold text-black"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.audience === "any" ? "Any venue" : p.audience}
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold tabular-nums">
                {p.price}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  {p.cadence}
                </span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">
                  {p.mechanic}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">
                  {p.visibility} visibility
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
                {p.blurb}
              </p>
              <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-[12px]">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="before:mr-1.5 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-foreground/40 before:align-middle"
                  >
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/manager/sign-up"
                className={`mt-5 inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition ${
                  p.featured
                    ? "bg-pink-gradient text-white shadow-glow hover:opacity-90"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Payment rail rule.</span>{" "}
            Cashback is only valid when the guest pays by card through Mesita.
            If a guest pays cash at a Formal venue, the coupon is invalid and
            no cashback is issued. Informal venues take the discount off the
            bill directly — cash or card, either works.
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Why do Formal venues run cashback and Informal venues run discount?",
      a: "Mechanic is tied to fiscal type, not optional. Formal venues invoice by default, so cashback fits cleanly as marketing spend and the wallet locks the guest into a return visit. Informal venues operate in cash; running cashback would force them to invoice + charge 16% VAT, which kills the deal — a guest would pay 16% more upfront to recover 10% later. So Informal venues use an instant discount at the bill instead.",
    },
    {
      q: "Why does Informal cost 2× Formal at every tier?",
      a: "Because Mesita captures no data on the discount rail — no wallet, no return-visit lock-in, no transaction telemetry. The Informal venue gets the same visibility without handing over the wallet, so the price covers the value Mesita won't get back on the back end.",
    },
    {
      q: "What's the difference between a Verified Partner and a Web-Listed venue?",
      a: "Web-Listed venues are scraped automatically from Google Business and appear in discovery with AI reservations enabled — no sign-up, no dashboard, no coupons. Verified Partners signed up at manager.mesita.app and configured their coupon mechanic; they get priority placement and the Promos / Analytics / Wallet / Team dashboard.",
    },
    {
      q: "How does a guest reach Silver, Gold, or Diamond?",
      a: "Two main ladders — Instagram followers or lifetime Mesita spend. 1K / 5K / 20K followers maps to Silver / Gold / Diamond; MXN $5K / $20K / $100K lifetime spend maps to the same tiers. Diamond is invite-only at 20K followers. There's also a manual appeal path for models, chefs, press, founders, and other local elites.",
    },
    {
      q: "What's the Instagram story step about?",
      a: "Guests whose Silver / Gold / Diamond class came from follower count have to post an IG story tagging the venue to claim their coupon. Mesita's bot auto-verifies the @mention or location tag; ambiguous cases fall through to a waiter who approves or rejects manually. On Formal flows, no story = no cashback (held back until verified). On Informal flows, the discount applies at the bill before verification — that's the vulnerability flag.",
    },
    {
      q: "Do I need any hardware or POS integration?",
      a: "No. Setup is ~10 minutes from manager.mesita.app. Your waiters scan the guest's QR from their own phone (WhatsApp bot or web tool), enter the bill, and Mesita does the rest. No POS, no app to install for staff, no new device at the host stand.",
    },
  ];
  return (
    <section id="faq" className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-3xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Frequently asked
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Everything that&apos;s come up in the first batch of partner conversations.
        </p>
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-background">
          {items.map((it) => (
            <details
              key={it.q}
              className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold">
                {it.q}
                <span
                  aria-hidden
                  className="ml-3 text-muted-foreground transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Going out isn&apos;t the same anymore.
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Discover the city, book with AI, and earn money back on every visit. Your next plan starts here.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/guest"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get started as a guest
          </Link>
          <Link
            href="/manager"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            List my venue
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Guest", href: "/guest" },
        { label: "Manager", href: "/manager" },
        { label: "Validator", href: "/validator" },
        { label: "Admin", href: "/admin" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Contact", href: "mailto:pato@canzeco.com" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Email support", href: "mailto:pato@canzeco.com" },
      ],
    },
  ];

  return (
    <footer className="bg-background">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="text-lg font-semibold tracking-tight">mesita</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Smart hospitality. Made in Monterrey.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-medium">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <p>© 2026 Canzeco. All rights reserved.</p>
          <p>v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
