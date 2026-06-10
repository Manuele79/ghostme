import { NextResponse } from "next/server";
import { buildHomeContext } from "@/lib/ghostme/homeAssistant/homeContextBuilder";

export async function GET() {
  const context = await buildHomeContext();

  return NextResponse.json({
    success: true,
    context,
  });
}