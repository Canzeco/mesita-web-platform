"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiCreateManagerProfile } from "@/lib/api/manager";
import { PhoneInputWithCountry } from "@/components/auth/PhoneInputWithCountry";
import { COUNTRIES } from "@/lib/guest-data";

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";

export function ManagerOnboardForm() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [fullName, setFullName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("MX");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = fullName.trim();
    if (!trimmed) {
      setError("Tell us your name so we know who's onboarding.");
      return;
    }
    // Phone stays optional. Only build the combined string if the user
    // typed something; an empty local number means "skip the phone".
    let combinedPhone: string | null = null;
    const localTrim = phoneLocal.trim();
    if (localTrim) {
      const dial = COUNTRIES.find((c) => c.code === phoneCountry)?.dial ?? "52";
      combinedPhone = `+${dial} ${localTrim}`;
    }
    setPending(true);
    void (async () => {
      try {
        await apiCreateManagerProfile(supabase, {
          full_name: trimmed,
          phone: combinedPhone,
        });
        router.push("/manager/create_unit");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
        setPending(false);
      }
    })();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Your name
        </span>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={120}
          autoComplete="name"
          placeholder="e.g. Iván Solís"
          className={INPUT}
          required
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Phone <span className="text-muted-foreground/60">(optional)</span>
        </span>
        <PhoneInputWithCountry
          value={phoneLocal}
          onChange={setPhoneLocal}
          countryCode={phoneCountry}
          onCountryChange={setPhoneCountry}
          placeholder="81 1234 5678"
        />
        <span className="mt-1 block text-[11px] text-muted-foreground/80">
          Used only for venue verification + payout support. Never shared with
          guests.
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Continue to venue setup <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => router.push("/manager/console")}
        disabled={pending}
        className="mt-1 block w-full text-center text-[11px] text-muted-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
      >
        Skip for now — set up the venue later
      </button>
    </form>
  );
}
