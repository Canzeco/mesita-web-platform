import Link from "next/link";

export function SimpleHeader({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Link
        href="/guest/profile"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-peacock text-lg shadow-glow"
        aria-label="Profile"
      >
        🦚
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-xl font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {eyebrow && (
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
      </div>
    </header>
  );
}
