import { Sidebar } from "@/components/manager/Sidebar";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUnitOverview } from "@/lib/api/unit";

export const dynamic = "force-dynamic";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sidebar only needs the venue list. Pages call getUnitOverview with the
  // actual ?unit= they care about — React.cache dedupes a same-arg call to
  // a single Edge Function round trip per request.
  let overview: Awaited<ReturnType<typeof getUnitOverview>> | null = null;
  if (user) {
    try {
      overview = await getUnitOverview(supabase, null, 0);
    } catch (err) {
      // Don't kill the layout — pages can still render. Log so the breadcrumb
      // shows up in Vercel logs if the venue list silently disappears.
      console.error("[manager/layout] unit-overview:", err);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar
        venues={overview?.venues ?? []}
        user={user ? { email: user.email ?? null } : null}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
