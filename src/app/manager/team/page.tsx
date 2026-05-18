import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, Phone, MessageCircle, Crown, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/manager/Topbar";
import { TEAM, VALIDATORS } from "@/lib/manager-data";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/manager/sign-in?next=/manager/team");

  return (
    <>
      <Topbar title="Team" subtitle="Managers and WhatsApp validators" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col gap-6">
          <div className="rounded-2xl border border-dashed border-secondary/40 bg-secondary/5 px-4 py-3 text-[12px] text-secondary">
            Preview — the team data below is a sketch. Real member + validator management lands
            after the manager-list-team Edge Function is wired up.
          </div>
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Managers · Full access
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Can edit place, promos, wallet, and team.
                </p>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[12px] font-semibold text-background">
                <Plus className="h-3 w-3" />
                Invite manager
              </button>
            </div>
            <div className="mt-4 divide-y divide-border">
              {TEAM.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src={m.avatar} alt={m.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold">{m.name}</p>
                      {m.role === "Owner" && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-tier-gold/40 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-foreground">
                          <Crown className="h-2.5 w-2.5" />
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{m.role}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Active {m.lastActive}</span>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  WhatsApp validators
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Waiters and hosts who scan guest QRs from their own phone.
                </p>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp-gradient px-4 py-2 text-[12px] font-semibold text-white shadow-sm">
                <MessageCircle className="h-3 w-3" />
                Add validator
              </button>
            </div>
            <div className="mt-4 divide-y divide-border">
              {VALIDATORS.map((w) => (
                <div key={w.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-whatsapp/15 text-sm font-bold text-whatsapp-deep">
                    {w.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{w.name}</p>
                    <p className="text-[11px] text-muted-foreground">{w.role}</p>
                  </div>
                  <p className="hidden md:block text-[12px] font-mono text-muted-foreground">
                    <Phone className="mr-1.5 inline-block h-3 w-3 align-text-bottom text-whatsapp" />
                    {w.phone}
                  </p>
                  <span className="text-[11px] text-muted-foreground">Active {w.lastActive}</span>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-border p-5 text-center text-[13px] text-muted-foreground">
            Validators only need to follow{" "}
            <span className="font-semibold text-whatsapp-deep">@mesita.bot</span> on WhatsApp and send{" "}
            <span className="font-mono">VERIFY</span>. No app install, no training.
          </section>
        </div>
      </div>
    </>
  );
}
