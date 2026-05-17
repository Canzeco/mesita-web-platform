import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← mesita
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Admin · Canzeco internal
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Mesita Admin</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Internal tooling for venue review, guest tier classification, Diamond invitations,
          payouts, and enrichment of the auto-sourced catalog.
        </p>
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold">Coming online next</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Venue creation moved to the manager console — partners onboard themselves at{" "}
            <Link href="/manager" className="font-semibold text-foreground hover:underline">
              /manager
            </Link>
            . Admin will gain review queues, payouts, and segmentation here once the manager flow
            is fully exercised in production.
          </p>
        </div>
      </main>
    </div>
  );
}
