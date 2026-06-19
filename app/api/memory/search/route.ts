import { NextResponse } from "next/server";
import { memorySearchFlow } from "@/lib/ghostme/memory/memorySearchFlow";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);
    const result = await memorySearchFlow({ ...body, userId });

    if (result.status === 200) {
      return NextResponse.json(result.body);
    }

    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.log("MEMORY SEARCH ERROR:", err);
    return NextResponse.json(
      { error: "Errore ricerca memoria" },
      { status: 500 }
    );
  }
}
