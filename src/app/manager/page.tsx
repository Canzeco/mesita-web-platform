import Link from "next/link";

export default function ManagerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← mesita
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Manager · Verified Partner
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          manager.mesita.app
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Tu restaurante, tu canal de demanda.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Setup en ~10 minutos. Cero hardware, cero POS, cero training. Cobra cero hasta que rinda.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { title: "Place", desc: "Nombre, categoría, horarios, fotos, links sociales y de delivery." },
            { title: "Promos", desc: "Welcome offer y tasas de cashback por tier en clicks." },
            { title: "Analytics", desc: "Profile views, gasto influido, ROAS, funnel completo." },
            { title: "Wallet", desc: "Balance, cashback debido, ledger, retiro 1-click." },
            { title: "Team", desc: "Managers full-access y validators de WhatsApp." },
            { title: "AI Copilot", desc: "Genera la próxima campaña en un click." },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-border bg-card p-5 text-card-foreground"
            >
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Crear cuenta de partner
          </button>
          <button className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted">
            Ya tengo cuenta
          </button>
        </div>
      </main>
    </div>
  );
}
