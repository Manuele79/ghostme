import { NextResponse } from "next/server";
import { buildHomeReasoning } from "@/lib/ghostme/homeAssistant/homeReasoningBuilder";

export async function GET() {
  const context = await buildHomeReasoning();

  return NextResponse.json({
    success: true,
    context,
  });
}