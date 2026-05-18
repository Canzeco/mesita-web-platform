"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { MobileFrame } from "@/components/guest/MobileFrame";
import { StatusBar } from "@/components/guest/StatusBar";
import { AppSwitcher } from "@/components/AppSwitcher";
import { COUNTRIES } from "@/lib/guest-data";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { apiUpdateGuestProfile } from "@/lib/api/tickets";

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

export default function OnboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [name, setName] = useState("");
  const [sex, setSex] = useState("");
  const [birthday, setBirthday] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !sex || !birthday || !country || !phone.trim()) {
      setError("Please complete all required fields");
      return;
    }
    if (sex !== "male" && sex !== "female" && sex !== "other") {
      setError("Pick a sex from the list.");
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        await apiUpdateGuestProfile(supabase, {
          full_name: name.trim(),
          sex,
          birthday,
          country: country.trim(),
          phone: phone.trim(),
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
    <MobileFrame>
      <StatusBar />
      <div className="px-4 pt-3">
        <AppSwitcher />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-8 pt-6">
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-peacock text-xl shadow-glow">
            🦚
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Tell us about you</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A few details to personalize Mesita.
          </p>
        </div>

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
              onChange={(e) => setCountry(e.target.value)}
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
            <input
              type="tel"
              className={INPUT}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+52 81 1234 5678"
              maxLength={30}
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
      </div>
    </MobileFrame>
  );
}
