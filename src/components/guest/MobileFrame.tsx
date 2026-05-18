import { cn } from "@/lib/utils";

/**
 * Guest surface frame.
 *
 * - Below md: full-bleed — content fills the viewport, no card chrome.
 *   That's what a real phone needs; the OS supplies its own status bar.
 * - md and up: a centered, phone-proportioned card sitting on the hero
 *   gradient. Same look the marketing site used to ship, just no longer
 *   absolutely-positioned (so the page scrolls correctly when the card
 *   content exceeds the viewport, e.g. profile + transaction lists).
 *
 * Internal scroll containers (BottomNav uses `sticky bottom-0`, pages use
 * `flex-1 overflow-y-auto`) keep working in both modes.
 */
export function MobileFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh items-stretch justify-center bg-background md:bg-hero md:py-6">
      <div
        className={cn(
          "flex w-full max-w-md flex-col overflow-hidden bg-background",
          // Card chrome only kicks in at md+.
          "md:max-h-[min(900px,calc(100dvh-3rem))] md:rounded-3xl md:border md:border-border md:shadow-elev",
        )}
      >
        <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
