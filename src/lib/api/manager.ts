// Frontend API surface for the manager profile.
//
// Same constraints as api/venues + api/tickets: client calls exactly one
// Edge Function per helper, helpers never compose multiple Edge Functions.

import type { SupabaseClient } from "@supabase/supabase-js";

export type ManagerProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type ProfileRes =
  | { ok: true; manager: ManagerProfile }
  | { ok: false; error: string };

export async function apiFetchManagerProfile(
  client: SupabaseClient,
): Promise<ManagerProfile> {
  const { data, error } = await client.functions.invoke<ProfileRes>(
    "manager-profile",
    { body: {} },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "manager-profile failed");
  return data.manager;
}

export async function apiUpdateManagerProfile(
  client: SupabaseClient,
  input: { full_name?: string | null; phone?: string | null },
): Promise<ManagerProfile> {
  const { data, error } = await client.functions.invoke<ProfileRes>(
    "manager-update-profile",
    { body: input },
  );
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? "manager-update-profile failed");
  return data.manager;
}
