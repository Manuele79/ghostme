import { NextResponse } from "next/server";
import { generateDailyConversationSummary } from "@/lib/ghostme/conversationSummary";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId mancante" },
        { status: 400 }
      );
    }

    const result = await generateDailyConversationSummary(body.userId);

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err) {
    console.log("CONVERSATION SUMMARY API ERROR:", err);

    return NextResponse.json(
      { error: "Errore creazione summary" },
      { status: 500 }
    );
  }
}