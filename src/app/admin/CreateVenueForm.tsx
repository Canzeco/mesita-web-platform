"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";
import { createVenue, type CreateVenueState } from "./actions";
import { cn } from "@/lib/utils";

const initialState: CreateVenueState = { status: "idle" };

export function CreateVenueForm() {
  const [state, formAction] = useActionState(createVenue, initialState);
  const errors = state.status === "error" ? state.fieldErrors ?? {} : {};

  return (
    <form
      action={formAction}
      className="mt-10 rounded-2xl border border-border bg-card p-6"
      noValidate
    >
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold">Create venue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a single venue to the catalog. It will be created as a lead unless marked as
            a unit or portfolio entry.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Name" name="name" required error={errors.name} placeholder="Casa Luminar" />
        <Field
          label="Slug"
          name="slug"
          required
          error={errors.slug}
          placeholder="casa-luminar"
          hint="Lowercase letters, numbers, and hyphens."
        />
        <Field label="Type" name="type" placeholder="Rooftop · Mediterranean" />
        <Field label="Emoji" name="emoji" placeholder="🦚" maxLength={4} />
        <Field label="City" name="city" placeholder="CDMX" />
        <Field label="Area" name="area" placeholder="Roma Nte." />
        <Field label="Country" name="country" placeholder="Mexico" />
        <Field label="Instagram" name="instagram" placeholder="@casaluminar" />
        <Field
          label="Rating"
          name="rating"
          type="number"
          step="0.1"
          min="0"
          max="5"
          error={errors.rating}
          placeholder="4.7"
        />
        <Field label="Avg. ticket" name="ticket" placeholder="$720" />
        <Field label="Owner" name="owner" placeholder="DM" />

        <Select
          label="Status"
          name="status"
          defaultValue="lead"
          options={[
            { value: "lead", label: "Lead (sourcing)" },
            { value: "unit", label: "Unit (manager)" },
            { value: "portfolio", label: "Portfolio (verified partner)" },
          ]}
        />
        <Select
          label="Plan"
          name="plan"
          defaultValue=""
          options={[
            { value: "", label: "—" },
            { value: "Premium", label: "Premium" },
            { value: "Standard", label: "Standard" },
            { value: "Trial", label: "Trial" },
          ]}
        />
        <Select
          label="Pipeline stage"
          name="stage"
          defaultValue=""
          options={[
            { value: "", label: "—" },
            { value: "sourced", label: "1 · Sourced" },
            { value: "enriching", label: "2 · Super-sourcing" },
            { value: "review", label: "3 · Review & approve" },
            { value: "sales", label: "4 · Sales · partner" },
          ]}
        />
        <Select
          label="Fit"
          name="fit"
          defaultValue=""
          options={[
            { value: "", label: "—" },
            { value: "Hot", label: "Hot" },
            { value: "Warm", label: "Warm" },
            { value: "Cold", label: "Cold" },
          ]}
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p
          aria-live="polite"
          className={cn(
            "text-sm",
            state.status === "success" && "text-secondary",
            state.status === "error" && "text-destructive",
            state.status === "idle" && "text-muted-foreground",
          )}
        >
          {state.status === "idle" ? "All fields except name and slug are optional." : state.message}
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create venue"}
    </button>
  );
}

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  hint?: string;
  type?: string;
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
  maxLength?: number;
};

function Field({ label, name, required, error, hint, ...rest }: FieldProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </span>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40",
          error && "border-destructive",
        )}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

type SelectProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
};

function Select({ label, name, defaultValue, options }: SelectProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
