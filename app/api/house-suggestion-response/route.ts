import { NextResponse } from "next/server";
import { houseSuggestionResponseFlow } from "@/lib/ghostme/home/houseSuggestionResponseFlow";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);
    const result = await houseSuggestionResponseFlow({ ...body, userId });

    if (result.status === 200) {
      return NextResponse.json(result.body);
    }

    return NextResponse.json(result.body, { status: result.status });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: "Errore risposta suggerimento" }, { status: 500 });
  }
}
