import Link from "next/link";

export default function AdminPage() {
  return (
    <AppShell badge="Admin · Canzeco internal" title="Mesita Admin">
      <p className="text-muted-foreground">
        Venue onboarding and review, guest tier classification, Diamond invitations,
        transactions, payouts, auto-sourcing pipeline, and enrichment of the Web-Listed catalog.
      </p>
      <Sections
        items={[
          { title: "Venues", desc: "Approval, edits, and suspension of Verified Partners and Web-Listed." },
          { title: "Guests", desc: "Tiers, manual appeals, Diamond invitations." },
          { title: "Transactions", desc: "Payments, payouts, commissions, disputes." },
          { title: "Pipeline", desc: "GBP auto-sourcing + profile enrichment." },
        ]}
      />
    </AppShell>
  );
}

function AppShell({
  badge,
  title,
  children,
}: {
  badge: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← mesita
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {badge}
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        <div className="mt-6 max-w-2xl">{children}</div>
      </main>
    </div>
  );
}

function Sections({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((it) => (
        <div
          key={it.title}
          className="rounded-xl border border-border bg-card p-5 text-card-foreground"
        >
          <p className="text-sm font-semibold">{it.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
        </div>
      ))}
      <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground md:col-span-2">
        Coming soon: auth, live data from Supabase, operational controls.
      </div>
    </div>
  );
}
