"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SimpleHeader } from "@/components/guest/SimpleHeader";
import { FakeQR } from "@/components/guest/FakeQR";
import { CURRENT_USER } from "@/lib/guest-data";
import { cn } from "@/lib/utils";

const FAQ = [
  {
    q: "Why show my QR?",
    a: "It opens your check at any Mesita partner venue. The waiter scans it, captures total and tip, then sends you a Stripe link to pay from your phone. Cashback lands automatically.",
  },
  {
    q: "How much cashback do I earn?",
    a: "Cashback varies by tier and venue. As a Gold member you earn between 5% and 20% at partners — plus higher rates on welcome offers and tier drops.",
  },
  {
    q: "When do I get my cashback?",
    a: "Right when you pay. It hits your Mesita balance instantly. It redeems automatically on your next partner visit.",
  },
];

export default function QrPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col">
      <SimpleHeader title="Mesita" eyebrow="Your QR" />

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-6 scrollbar-hide">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Show this QR to the waiter
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Earn cashback at any Mesita venue — even without a saved coupon.
          </p>
        </div>

        <div className="mx-auto mt-6 aspect-square w-full max-w-[280px] rounded-3xl border border-border bg-card p-5 shadow-elev">
          <div className="relative h-full w-full">
            <FakeQR seed={CURRENT_USER.qrCode} size={21} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card ring-4 ring-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-peacock text-base shadow-glow">
                  🦚
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-full border border-border bg-card"
                style={isOpen ? { borderRadius: "1.5rem" } : undefined}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <HelpCircle className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="flex-1 text-sm font-semibold">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 pt-0 text-[13px] leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
