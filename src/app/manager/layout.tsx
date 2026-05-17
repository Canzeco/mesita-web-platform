import { Sidebar } from "@/components/manager/Sidebar";
import { createServerSupabase } from "@/lib/supabase/server";
import { apiFetchMyVenues, type MyVenue } from "@/lib/api/venues";

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

  let venues: MyVenue[] = [];
  if (user) {
    try {
      venues = await apiFetchMyVenues(supabase);
    } catch {
      // Sidebar renders with empty venues — the dashboard page will surface
      // the actual error to the user.
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar venues={venues} user={user ? { email: user.email ?? null } : null} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
