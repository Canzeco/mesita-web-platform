"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiCreateManagerProfile } from "@/lib/api/manager";
import { PhoneInputWithCountry } from "@/components/auth/PhoneInputWithCountry";
import { Field } from "@/components/shared";
import { COUNTRIES } from "@/lib/guest-data";
import { cn } from "@/lib/utils";
import {
  ERROR_BOX_CLASS,
  INPUT_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/lib/ui-classes";

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
      <Field label="Your name" required>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={120}
          autoComplete="name"
          placeholder="e.g. Iván Solís"
          className={INPUT_CLASS}
          required
        />
      </Field>

      <Field
        label="Phone (optional)"
        hint="Used only for venue verification + payout support. Never shared with guests."
      >
        <PhoneInputWithCountry
          value={phoneLocal}
          onChange={setPhoneLocal}
          countryCode={phoneCountry}
          onCountryChange={setPhoneCountry}
          placeholder="81 1234 5678"
        />
      </Field>

      {error && <p className={ERROR_BOX_CLASS}>{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className={cn(PRIMARY_BUTTON_CLASS, "mt-2")}
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
        onClick={() => router.push("/manager/home")}
        disabled={pending}
        className="mt-1 block w-full text-center text-[11px] text-muted-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
      >
        Skip for now — set up the venue later
      </button>
    </form>
  );
}
