import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { createServerSupabase } from "@/lib/supabase/server";
import { CreateUnitForm } from "./CreateUnitForm";

// Route lives at /manager/create_unit. Distinct from /manager/onboard:
// onboard creates the manager_profile (once per person), create_unit
// creates a venue (N times per person — multi-unit operators).
export const dynamic = "force-dynamic";

export default async function CreateUnitPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/manager/sign-in?next=/manager/create_unit");
  }

  return (
    <>
      <Topbar title="Create unit" subtitle="A minute of setup. Live the moment you save." />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
          <Link
            href="/manager/console"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to your console
          </Link>
          <CreateUnitForm />
        </div>
      </div>
    </>
  );
}
