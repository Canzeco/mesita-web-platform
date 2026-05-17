import Link from "next/link";

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
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          mesita
        </Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#guests" className="hover:text-foreground">Para ti</a>
          <a href="#tiers" className="hover:text-foreground">Clases</a>
          <a href="#venues" className="hover:text-foreground">Para tu negocio</a>
          <a href="#how" className="hover:text-foreground">Cómo funciona</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/guest"
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Soy guest
          </Link>
          <Link
            href="/manager"
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Registrar restaurante
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Hospitalidad inteligente · Hecho en Monterrey
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          La cartera de cashback más inteligente para salir a comer, beber y celebrar.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
          Mesita reúne cada bar, café, restaurante y antro de tu ciudad, te recomienda dónde ir esta noche, te reserva con un agente de IA y te paga cashback cuando pagas con la app.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/guest"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Descargar la app
          </Link>
          <Link
            href="/manager"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Registrar mi restaurante
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Sin hardware. Sin POS. Configuración en ~10 minutos.
        </p>
      </div>
    </section>
  );
}

function Audience() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 mx-6 my-12 md:mx-auto md:my-16">
        <div className="bg-background p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Para guests</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Descubre, reserva y gana.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Toda la ciudad en una sola app. Recomendaciones reales basadas en tu vibra, tu zona y tu presupuesto. Tu balance Mesita se acumula con cada visita.
          </p>
          <Link
            href="/guest"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Empezar como guest
          </Link>
        </div>
        <div className="bg-background p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Para negocios</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Llena tu local con los guests que sí mueven la aguja.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Compite por los guests con presencia social, no por todos por igual. Configura cashback por clase, recibe historias en Instagram y mide cada peso atribuido.
          </p>
          <Link
            href="/manager"
            className="mt-6 inline-block rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Convertirme en partner
          </Link>
        </div>
      </div>
    </section>
  );
}

function ForGuests() {
  const items = [
    {
      title: "Inteligencia de experiencias",
      body: "El catálogo más completo de tu ciudad, con reviews, ratings, precios, vibra, fotos y dónde están saliendo Bronze, Silver, Gold y Diamond ahora mismo. Swipe, mapa, catálogo o IA conversacional.",
    },
    {
      title: "Reservas con IA",
      body: "Un toque y un agente de voz, DM, WhatsApp o email contacta al restaurante por ti y deja la mesa cerrada. Funciona en cualquier venue de la ciudad, incluso si nunca firmó con nosotros.",
    },
    {
      title: "Cashback real",
      body: "Paga con Mesita, recibe cashback a tu balance prepago. Se aplica solo en tu siguiente visita a un partner verificado. Mientras más alta tu clase, mejor la tasa.",
    },
  ];

  return (
    <section id="guests" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Tres cosas que solo Mesita te da.
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
    { name: "Bronze", req: "Default", desc: "Acceso completo al catálogo y reservas." },
    { name: "Silver", req: "1K seguidores · o $20K gastados", desc: "Cashback elevado en partners." },
    { name: "Gold", req: "5K seguidores · o $50K gastados", desc: "Tasas premium y prioridad." },
    { name: "Diamond", req: "20K seguidores · o $100K · o invitación", desc: "Trato VIP y eventos privados." },
  ];

  return (
    <section id="tiers" className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Tu capital social vale dinero.
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cuatro clases. Mientras más alta, mejor cashback y acceso. Sube por seguidores reales, gasto histórico o invitación.
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
      title: "Que te descubran",
      body: "Prioridad sobre el catálogo automático ~100× más grande. Oferta de bienvenida lista contra el pool real de guests cercanos que nunca te han visitado.",
    },
    {
      title: "Atrae a los magnéticos",
      body: "Configura cashback distinto por Bronze, Silver, Gold y Diamond. Premia a los guests que llenan el lugar y lo posean a sus 8,000 seguidores.",
    },
    {
      title: "Historias de Instagram automáticas",
      body: "Nuestro bot valida que cada Story etiquete tu venue. Sin story, no hay cashback. Exposición real, medible, sin perseguir screenshots.",
    },
    {
      title: "Reservas sin fricción",
      body: "Aparecen al momento de existir en el catálogo. Verás clase y tamaño de grupo antes de la visita. Llena días lentos con descuentos quirúrgicos.",
    },
    {
      title: "Inteligencia de marketing",
      body: "Profile views, gasto influido, cashback pagado, ROAS, embudo completo y un copilot IA que arma la próxima campaña en un click.",
    },
  ];

  return (
    <section id="venues" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Para Verified Partners
        </p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
          Un canal de adquisición, no un directorio más.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Compite por guests de alta intención que están decidiendo ahorita dónde salir. Setup en 10 minutos. Cero hardware, cero POS, cero training.
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
            Caso conservador
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            300 partners × 30 redenciones/mes × $300 ticket = $2.7M MXN influidos al mes.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            ~$270K MXN de comisión mensual al 10%. ~$3.24M MXN anual.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    "El guest pide la cuenta y abre su QR personal en la app.",
    "El waiter escanea con su teléfono y abre el bot de WhatsApp de Mesita.",
    "Captura total de cuenta y propina en un formulario corto.",
    "El guest recibe un link de Stripe y paga desde su celular.",
    "Cashback aterriza al balance Mesita. Si subió por seguidores, valida su Story.",
  ];

  return (
    <section id="how" className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          El checkout que cambia todo.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Solo pagos con tarjeta vía Stripe. Solo Verified Partners. Ideal para FSR. Cero cambios para el guest hasta el momento de pagar.
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
          Salir a comer ya no es lo mismo.
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Descubre la ciudad, reserva con IA y recupera dinero en cada visita. Tu próximo plan empieza aquí.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/guest"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Empezar como guest
          </Link>
          <Link
            href="/manager"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Registrar mi restaurante
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      title: "Producto",
      links: [
        { label: "Guest", href: "/guest" },
        { label: "Manager", href: "/manager" },
        { label: "Validator", href: "/validator" },
        { label: "Admin", href: "/admin" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { label: "Manifiesto", href: "#" },
        { label: "Contacto", href: "mailto:pato@canzeco.com" },
        { label: "Términos", href: "#" },
        { label: "Privacidad", href: "#" },
      ],
    },
    {
      title: "Soporte",
      links: [
        { label: "WhatsApp", href: "#" },
        { label: "Centro de ayuda", href: "#" },
        { label: "Estado del sistema", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-background">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="text-lg font-semibold tracking-tight">mesita</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Hospitalidad inteligente. Hecho en Monterrey.
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
          <p>© 2026 Canzeco. Todos los derechos reservados.</p>
          <p>v0.1.0</p>
        </div>
      </div>
    </footer>
  );
}
