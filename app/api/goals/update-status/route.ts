import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const goalId = body.goalId as string;
    const userId = body.userId as string;
    const status = body.status as "active" | "completed" | "archived";

    if (!goalId || !userId || !["active", "completed", "archived"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Dati non validi" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("goals_desires")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Errore API" },
      { status: 500 }
    );
  }
}