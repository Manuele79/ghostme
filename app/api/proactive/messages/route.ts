import { NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import { loadVisibleProactiveMessages } from "@/lib/ghostme/proactive/visibleProactiveMessages";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = await getAuthenticatedUserId(req, body.userId);

    const messages = await loadVisibleProactiveMessages(userId);

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.log("GET PROACTIVE MESSAGES ERROR:", err);
    return NextResponse.json({ error: "Errore lettura osservazioni" }, { status: 500 });
  }
}
