import { NextResponse } from "next/server";
import { houseSuggestionResponseFlow } from "@/lib/ghostme/home/houseSuggestionResponseFlow";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await houseSuggestionResponseFlow(body);

  if (result.status === 200) {
    return NextResponse.json(result.body);
  }

  return NextResponse.json(result.body, { status: result.status });
}
