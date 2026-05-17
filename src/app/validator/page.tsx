import Link from "next/link";

export default function ValidatorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← mesita
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Validator · Waiter
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          For waiters and hosts of Verified Partners
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Scan the guest&apos;s QR.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Web equivalent of the WhatsApp bot. Ideal for shared tablets at the host stand or
          desktops at the POS terminal. Same flow: scan → validate → check + tip → Stripe
          link → close ticket.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <button className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Open camera · scan QR
          </button>
          <button className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted">
            Sign in as validator
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Prefer your phone? Use the WhatsApp bot.
          </p>
        </div>

        <ol className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-3 text-left md:grid-cols-5">
          {[
            "Scan QR",
            "Validate guest",
            "Check + tip",
            "Stripe payment",
            "Confirm",
          ].map((step, i) => (
            <li
              key={step}
              className="rounded-xl border border-border bg-card p-4 text-card-foreground"
            >
              <p className="text-xs font-medium text-muted-foreground">
                Step {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
