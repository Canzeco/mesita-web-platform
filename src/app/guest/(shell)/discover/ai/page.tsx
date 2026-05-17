"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { AI_SUGGESTIONS } from "@/lib/guest-data";

export default function AiPage() {
  const [input, setInput] = useState("");

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 scrollbar-hide">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-peacock text-2xl shadow-glow">
          🦚
        </div>
        <h1 className="mt-5 text-center font-display text-3xl font-semibold tracking-tight">
          What are you in the mood for?
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          Tell me the plan — vibe, area, budget —
          <br />
          and I&apos;ll find the spot.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {AI_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="rounded-full border border-border bg-card px-5 py-3.5 text-left text-sm text-foreground transition hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background px-3 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-foreground transition disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
