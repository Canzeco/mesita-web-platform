"use client";

import { useState } from "react";
import { Send, Sparkles, Plus } from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { COPILOT_SUGGESTIONS, COPILOT_HISTORY } from "@/lib/manager-data";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; text: string };

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>(COPILOT_HISTORY);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      {
        role: "assistant",
        text: "Drafting that for you… your most magnetic guests this month are Diamond + Gold from Tec and Stanford. I'd target Thursdays + Saturdays first.",
      },
    ]);
    setInput("");
  };

  return (
    <>
      <Topbar
        title="AI Copilot"
        subtitle="Ask questions, draft campaigns, audit performance"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-6">
            <div className="mb-6 rounded-2xl bg-peacock p-5 text-white shadow-glow">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] opacity-80">
                <Sparkles className="h-3.5 w-3.5" />
                Hello, Iván
              </div>
              <p className="mt-1 font-display text-2xl font-semibold leading-tight">
                Your numbers are stronger than you think.
              </p>
              <p className="mt-1 text-[13px] opacity-85">
                Saturday visits are up 23%. Profile views climbed 31% week-over-week. Ask me what
                to do next.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-2">
              {COPILOT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm transition hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      m.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-peacock text-white",
                    )}
                  >
                    {m.role === "user" ? "IS" : "🦚"}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-foreground text-background"
                        : "border border-border bg-card text-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-6 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-sm">
            <button
              type="button"
              aria-label="Attach"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(input);
              }}
              placeholder="Ask Copilot anything about your venue…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-gradient text-white shadow-sm disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
