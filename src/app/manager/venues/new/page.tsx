import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { createServerSupabase } from "@/lib/supabase/server";
import { CreateVenueForm } from "./CreateVenueForm";

export const dynamic = "force-dynamic";

export default async function NewVenuePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/manager/sign-in?next=/manager/venues/new");
  }

  return (
    <>
      <Topbar title="Create venue" subtitle="A minute of setup. Live the moment you save." />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
          <Link
            href="/manager"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to your venues
          </Link>
          <CreateVenueForm />
        </div>
      </div>
    </>
  );
}
