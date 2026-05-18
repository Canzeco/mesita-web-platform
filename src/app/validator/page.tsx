import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiFetchMyVenues } from "@/lib/api/venues";
import { ValidatorConsole } from "./ValidatorConsole";

export const dynamic = "force-dynamic";

export default async function ValidatorPage({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string }>;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/manager/sign-in?next=/validator");
  }

  const venues = await apiFetchMyVenues(supabase).catch(() => []);

  if (venues.length === 0) {
    return (
      <Shell>
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            No venues linked yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The validator console is gated by venue membership. Onboard your venue first, then
            come back to open tickets.
          </p>
          <Link
            href="/manager/venues/new"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Onboard your venue
          </Link>
        </div>
      </Shell>
    );
  }

  const params = await searchParams;
  const requested = params.venue?.toString();
  const active = requested ? venues.find((v) => v.id === requested) ?? venues[0] : venues[0];

  return (
    <Shell>
      <ValidatorConsole
        venues={venues.map((v) => ({ id: v.id, name: v.name, cashback_percent: v.cashback_percent }))}
        activeVenueId={active.id}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-peacock text-sm shadow-glow">
              🦚
            </span>
            <span className="font-display text-base font-semibold tracking-tight">mesita.</span>
          </Link>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Validator
          </span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
        {children}
      </main>
    </div>
  );
}
