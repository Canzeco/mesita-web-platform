import { redirect } from "next/navigation";

// The dashboard view is intentionally not built yet — it's the "abstract"
// summary that depends on every other surface having shipped first. Until
// then, hitting /manager forwards to the active workspace (Place).
export const dynamic = "force-dynamic";

export default async function ManagerIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const params = await searchParams;
  const unit = params.unit?.toString();
  redirect(unit ? `/manager/place?unit=${unit}` : "/manager/place");
}
