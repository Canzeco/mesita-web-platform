import Link from "next/link";
import { CreateVenueForm } from "./CreateVenueForm";

export default function AdminPage() {
  return (
    <AppShell badge="Admin · Canzeco internal" title="Mesita Admin">
      <p className="text-muted-foreground">
        Venue onboarding and review, guest tier classification, Diamond invitations,
        transactions, payouts, auto-sourcing pipeline, and enrichment of the Web-Listed catalog.
      </p>
      <CreateVenueForm />
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
        <div className="mt-6 max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
