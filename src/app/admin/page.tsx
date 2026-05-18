import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Temporary admin gate. The hard spec calls for an `is_admin` column on
// the user's profile row; until that schema ships we allowlist by email
// via the MESITA_ADMIN_EMAILS env (comma-separated). Replace the
// allowlist check with a SELECT on the admin column the moment it lands
// — keep the rest of the page the same.
function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  const raw = process.env.MESITA_ADMIN_EMAILS ?? "";
  const allowed = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return allowed.has(email.trim().toLowerCase());
}

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/manager/sign-in?next=/admin");
  if (!isAdminEmail(user.email ?? null)) {
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
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Restricted area
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You&apos;re signed in as <span className="font-mono">{user.email}</span>, but this
            address isn&apos;t on the admin allowlist. Ask{" "}
            <a className="font-semibold text-foreground underline-offset-2 hover:underline" href="mailto:pato@canzeco.com">
              pato@canzeco.com
            </a>
            {" "}for access.
          </p>
        </main>
      </div>
    );
  }

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
          <p className="text-sm font-semibold">Signed in as {user.email}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Venue creation moved to the manager console — partners onboard themselves at{" "}
            <Link href="/manager" className="font-semibold text-foreground hover:underline">
              /manager
            </Link>
            . Admin gains review queues, payouts, and segmentation here once the
            corresponding tables land.
          </p>
        </div>
      </main>
    </div>
  );
}
