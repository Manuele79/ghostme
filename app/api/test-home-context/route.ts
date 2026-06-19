import { NextResponse } from "next/server";
import { buildHomeContext } from "@/lib/ghostme/homeAssistant/homeContextBuilder";
import { requireDevelopmentOrWorker, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function GET(req: Request) {
  try {
    requireDevelopmentOrWorker(req);
    const context = await buildHomeContext();

    return NextResponse.json({ success: true, context });
  } catch (err) {
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Errore test home context" }, { status: 500 });
  }
}
