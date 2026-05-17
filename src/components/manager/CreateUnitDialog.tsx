"use client";

import { useState } from "react";
import {
  X,
  Store,
  MapPin,
  Sparkles,
  Phone,
  Globe,
  Camera,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INPUT =
  "h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-secondary/60";

type Category = { value: string; emoji: string };

const CATEGORIES: Category[] = [
  // Cuisines
  { value: "Mediterranean", emoji: "🌿" },
  { value: "Italian", emoji: "🍝" },
  { value: "French", emoji: "🥖" },
  { value: "Mexican", emoji: "🌶️" },
  { value: "Spanish", emoji: "🥘" },
  { value: "American", emoji: "🍔" },
  { value: "Japanese", emoji: "🍱" },
  { value: "Sushi", emoji: "🍣" },
  { value: "Ramen", emoji: "🍜" },
  { value: "Korean", emoji: "🥢" },
  { value: "Chinese", emoji: "🥡" },
  { value: "Thai", emoji: "🍲" },
  { value: "Indian", emoji: "🍛" },
  { value: "Middle Eastern", emoji: "🥙" },
  { value: "Peruvian", emoji: "🐟" },
  { value: "Argentinian", emoji: "🥩" },
  // Formats
  { value: "Steakhouse", emoji: "🥩" },
  { value: "Seafood", emoji: "🦐" },
  { value: "Pizza", emoji: "🍕" },
  { value: "Tacos", emoji: "🌮" },
  { value: "Burger", emoji: "🍔" },
  { value: "BBQ", emoji: "🔥" },
  { value: "Fine dining", emoji: "✨" },
  // Daytime
  { value: "Café", emoji: "☕" },
  { value: "Bakery", emoji: "🥐" },
  { value: "Brunch", emoji: "🍳" },
  { value: "Tea house", emoji: "🫖" },
  { value: "Dessert", emoji: "🍰" },
  { value: "Ice cream", emoji: "🍦" },
  { value: "Healthy", emoji: "🥗" },
  { value: "Vegan", emoji: "🌱" },
  // Bar / nightlife
  { value: "Cocktails", emoji: "🍸" },
  { value: "Wine bar", emoji: "🍷" },
  { value: "Beer bar", emoji: "🍺" },
  { value: "Speakeasy", emoji: "🥂" },
  { value: "Lounge", emoji: "🛋️" },
  { value: "Nightclub", emoji: "🪩" },
  // Catch-all
  { value: "Other", emoji: "🏪" },
];

const FALLBACK_EMOJI = "🏪";

const VIBES = [
  "Rooftop",
  "Late night",
  "Date night",
  "Brunch",
  "Casual",
  "Fine dining",
  "Tasting menu",
  "Family",
  "Pizza bar",
  "Dancefloor",
];

const CITIES = ["CDMX", "Monterrey", "Guadalajara", "Querétaro", "Mérida", "Tulum", "Other"];

export function CreateUnitDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [vibe, setVibe] = useState("");
  const [city, setCity] = useState("CDMX");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emoji = CATEGORIES.find((c) => c.value === category)?.emoji ?? FALLBACK_EMOJI;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !category || !vibe || !city || !area.trim()) {
      setError("Place name, category, vibe, city and neighborhood are required");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
      window.setTimeout(onClose, 900);
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elev">
        <div className="flex items-start justify-between gap-3 px-6 pt-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-gradient text-lg shadow-sm">
              {category ? <span aria-hidden>{emoji}</span> : <Store className="h-5 w-5 text-white" />}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
                New unit
              </p>
              <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight">
                Create a place
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Tell us where it is and what it&apos;s like. You can fine-tune photos, hours and
                promos right after.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 pt-5 pb-2">
          <SectionLabel icon={<Store className="h-3 w-3" />}>Place</SectionLabel>

          <Field label="Name" required>
            <input
              className={INPUT}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Casa Luminar"
              maxLength={60}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" required>
              <select
                className={INPUT}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji}  {c.value}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vibe" required>
              <select
                className={INPUT}
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                required
              >
                <option value="">Select</option>
                {VIBES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <SectionLabel icon={<MapPin className="h-3 w-3" />}>Location</SectionLabel>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City" required>
              <select
                className={INPUT}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Neighborhood" required>
              <input
                className={INPUT}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Polanco"
                maxLength={40}
                required
              />
            </Field>
          </div>

          <SectionLabel icon={<Sparkles className="h-3 w-3" />}>Contact (optional)</SectionLabel>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  className={cn(INPUT, "pl-8")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 81 ..."
                  maxLength={20}
                />
              </div>
            </Field>
            <Field label="Website">
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(INPUT, "pl-8")}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="venue.mx"
                  maxLength={60}
                />
              </div>
            </Field>
          </div>

          <Field label="Cover photo">
            <button
              type="button"
              className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 text-[12px] text-muted-foreground transition hover:bg-muted/50"
            >
              <Camera className="h-4 w-4" />
              Upload cover photo · skip for now
            </button>
          </Field>

          {error && (
            <p className="mt-1 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-background/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || done}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-full bg-pink-gradient px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition disabled:opacity-60"
          >
            {done ? (
              <>
                <Check className="h-4 w-4" />
                Created
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                Create unit
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="mt-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {icon}
      {children}
    </p>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        {label}
        {required && <span className="text-secondary">*</span>}
      </span>
      {children}
    </label>
  );
}
