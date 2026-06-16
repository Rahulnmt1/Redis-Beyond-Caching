import { NextResponse } from "next/server";
import { searchCustomers, type SearchMode } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODES: SearchMode[] = ["prefix", "tag", "numeric", "combined", "fuzzy", "geo", "aggregate"];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { mode?: string; term?: string };
    const mode = (MODES.includes(body.mode as SearchMode) ? body.mode : "prefix") as SearchMode;
    const result = await searchCustomers(mode, body.term ?? "");
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
