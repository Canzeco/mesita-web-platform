"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { COUNTRIES } from "@/lib/guest-data";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiUpdateGuestProfile } from "@/lib/api/tickets";
import { PhoneInputWithCountry } from "@/components/auth/PhoneInputWithCountry";
import { Field } from "@/components/shared";
import { ERROR_BOX_CLASS, INPUT_CLASS, PRIMARY_BUTTON_CLASS } from "@/lib/ui-classes";

export function OnboardForm() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthday, setBirthday] = useState("");
  // Country is no longer a separate dropdown — we infer it from the dial-code
  // picker on the phone field. One country question, not two. Default MX.
  const [phoneCountry, setPhoneCountry] = useState("MX");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !sex || !birthday || !phoneLocal.trim()) {
      setError("Please complete all required fields");
      return;
    }
    if (sex !== "male" && sex !== "female" && sex !== "other") {
      setError("Pick a sex from the list.");
      return;
    }
    const dialEntry = COUNTRIES.find((c) => c.code === phoneCountry);
    const country = dialEntry?.name ?? "Mexico";
    const dial = dialEntry?.dial ?? "52";
    const combinedPhone = `+${dial} ${phoneLocal.trim()}`;

    setLoading(true);
    void (async () => {
      try {
        await apiUpdateGuestProfile(supabase, {
          full_name: name.trim(),
          sex,
          birthday,
          country,
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
          className={INPUT_CLASS}
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
            className={INPUT_CLASS}
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
            className={INPUT_CLASS}
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
          />
        </Field>
      </div>

      <Field
        label="Phone number"
        hint="Your country is inferred from the dial code."
      >
        <PhoneInputWithCountry
          value={phoneLocal}
          onChange={setPhoneLocal}
          countryCode={phoneCountry}
          onCountryChange={setPhoneCountry}
          placeholder="55 1234 5678"
          required
        />
      </Field>

      {error && <p className={ERROR_BOX_CLASS}>{error}</p>}

      <div className="mt-auto pt-4">
        <button
          type="submit"
          disabled={loading}
          className={PRIMARY_BUTTON_CLASS}
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
      </div>
    </form>
  );
}
