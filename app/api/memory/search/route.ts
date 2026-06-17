import { NextResponse } from "next/server";
import { memorySearchFlow } from "@/lib/ghostme/memory/memorySearchFlow";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await memorySearchFlow(body);

    if (result.status === 200) {
      return NextResponse.json(result.body);
    }

    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    console.log("MEMORY SEARCH ERROR:", err);
    return NextResponse.json(
      { error: "Errore ricerca memoria" },
      { status: 500 }
    );
  }
}
