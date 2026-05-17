import Link from "next/link";

export default function GuestPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← mesita
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Guest · Web mirror
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          guest.mesita.app
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Hola.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mismo producto que la app móvil. Descubre, reserva, paga y gana cashback desde el navegador.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { title: "Discover", desc: "Swipe, mapa, catálogo, IA." },
            { title: "Saved", desc: "Reservas y cupones." },
            { title: "QR", desc: "Tu QR para el waiter." },
            { title: "Share", desc: "Gift cards, creator, venues." },
            { title: "Profile", desc: "Clase, balance, game, settings." },
            { title: "Balance", desc: "Tu wallet Mesita." },
          ].map((it) => (
            <div
              key={it.title}
              className="aspect-square rounded-2xl border border-border bg-card p-4 text-card-foreground"
            >
              <p className="text-sm font-semibold">{it.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>

        <button className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
          Iniciar sesión con teléfono
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          ¿Prefieres la app? Disponible en iOS y Android.
        </p>
      </main>
    </div>
  );
}
