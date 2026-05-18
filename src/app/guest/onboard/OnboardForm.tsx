"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { COUNTRIES, COUNTRY_BY_NAME } from "@/lib/guest-data";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiUpdateGuestProfile } from "@/lib/api/tickets";
import { PhoneInputWithCountry } from "@/components/auth/PhoneInputWithCountry";

const INPUT =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition focus:border-foreground/40";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function OnboardForm() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthday, setBirthday] = useState("");
  const [country, setCountry] = useState("");
  // Phone is split: dial-code country (ISO) + local subscriber number.
  // We default the dial-code country to the residence Country dropdown so
  // a Mexican guest gets +52 prefilled, but the picker is independent so
  // someone living in Mexico with a US number can still pick +1.
  const [phoneCountry, setPhoneCountry] = useState("MX");
  // Tracks whether the user has manually picked a dial code; if so we
  // stop auto-syncing it from the residence dropdown. React 19's strict
  // set-state-in-effect rule means we do the sync inline on the residence
  // change handler instead of in a useEffect.
  const [phoneCountryTouched, setPhoneCountryTouched] = useState(false);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountryChange = (next: string) => {
    setCountry(next);
    if (!phoneCountryTouched) {
      const match = COUNTRY_BY_NAME[next];
      if (match) setPhoneCountry(match.code);
    }
  };
  const handlePhoneCountryChange = (next: string) => {
    setPhoneCountry(next);
    setPhoneCountryTouched(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !sex || !birthday || !country || !phoneLocal.trim()) {
      setError("Please complete all required fields");
      return;
    }
    if (sex !== "male" && sex !== "female" && sex !== "other") {
      setError("Pick a sex from the list.");
      return;
    }
    const dialEntry = COUNTRIES.find((c) => c.code === phoneCountry);
    const dial = dialEntry?.dial ?? "52";
    const combinedPhone = `+${dial} ${phoneLocal.trim()}`;

    setLoading(true);
    void (async () => {
      try {
        await apiUpdateGuestProfile(supabase, {
          full_name: name.trim(),
          sex,
          birthday,
          country: country.trim(),
          phone: combinedPhone,
        });
        router.push("/guest/discover/swipe");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
        setLoading(false);
      }
    })();
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-3">
      <Field label="Name">
        <input
          className={INPUT}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Your name"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sex">
          <select
            className={INPUT}
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            required
          >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Birthday">
          <input
            type="date"
            className={INPUT}
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label="Country">
        <select
          className={INPUT}
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          required
        >
          <option value="">Select your country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.flag}  {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Phone number">
        <PhoneInputWithCountry
          value={phoneLocal}
          onChange={setPhoneLocal}
          countryCode={phoneCountry}
          onCountryChange={handlePhoneCountryChange}
          placeholder="55 1234 5678"
          required
        />
      </Field>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-auto pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          We use these to verify you and personalize recommendations. Your phone is never
          shared with venues.
        </p>
        <button
          type="button"
          onClick={() => router.push("/guest/discover/swipe")}
          disabled={loading}
          className="mt-2 block w-full text-center text-[11px] text-muted-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
        >
          Skip for now — finish later from Profile
        </button>
      </div>
    </form>
  );
}
