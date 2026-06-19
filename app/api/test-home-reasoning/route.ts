import { NextResponse } from "next/server";
import { buildHomeReasoning } from "@/lib/ghostme/homeAssistant/homeReasoningBuilder";
import { requireDevelopmentOrWorker, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function GET(req: Request) {
  try {
    requireDevelopmentOrWorker(req);
    const context = await buildHomeReasoning();

    return NextResponse.json({ success: true, context });
  } catch (err) {
    if (err instanceof UserContextAuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Errore test home reasoning" }, { status: 500 });
  }
}
