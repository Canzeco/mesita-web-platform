import { NextResponse } from "next/server";
import { placesAutocomplete } from "@/lib/google-places";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { input?: string; sessionToken?: string };

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const input = (body.input ?? "").toString();
  const sessionToken = (body.sessionToken ?? "").toString();
  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Missing sessionToken" }, { status: 400 });
  }
  const result = await placesAutocomplete(input, sessionToken);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
