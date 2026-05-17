import { NextResponse } from "next/server";
import { placeDetails } from "@/lib/google-places";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { placeId?: string; sessionToken?: string };

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const placeId = (body.placeId ?? "").toString();
  const sessionToken = (body.sessionToken ?? "").toString();
  if (!placeId) {
    return NextResponse.json({ ok: false, error: "Missing placeId" }, { status: 400 });
  }
  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Missing sessionToken" }, { status: 400 });
  }
  const result = await placeDetails(placeId, sessionToken);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
