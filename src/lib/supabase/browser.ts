import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy .env.example to .env.local and fill in the values.",
  );
}

export function createBrowserSupabase() {
  return createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!);
}
