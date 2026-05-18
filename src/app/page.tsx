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
    { name: "Bronze", req: "Default", desc: "Full catalog and reservation access." },
    { name: "Silver", req: "1K followers · or $20K spent", desc: "Elevated cashback at partners." },
    { name: "Gold", req: "5K followers · or $50K spent", desc: "Premium rates and priority." },
    { name: "Diamond", req: "20K followers · or $100K · or invite", desc: "VIP treatment and private events." },
  ];

  return (
    <section id="tiers" className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Your social capital is worth money.
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Four tiers. The higher you go, the better the cashback and access. Climb by real followers, historical spend, or invitation.
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
