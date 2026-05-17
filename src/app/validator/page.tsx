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
          Para waiters y hosts de Verified Partners
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Escanea el QR del guest.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Equivalente web del bot de WhatsApp. Ideal para tablets compartidas en el host stand o
          desktops en la terminal POS. Mismo flujo: scan → validar → cuenta + propina → link de
          Stripe → cerrar ticket.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <button className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Abrir cámara · escanear QR
          </button>
          <button className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted">
            Iniciar sesión como validator
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            ¿Prefieres tu celular? Usa el bot de WhatsApp.
          </p>
        </div>

        <ol className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-3 text-left md:grid-cols-5">
          {[
            "Scan QR",
            "Validar guest",
            "Cuenta + propina",
            "Pago Stripe",
            "Confirmar",
          ].map((step, i) => (
            <li
              key={step}
              className="rounded-xl border border-border bg-card p-4 text-card-foreground"
            >
              <p className="text-xs font-medium text-muted-foreground">
                Paso {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-medium">{step}</p>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
