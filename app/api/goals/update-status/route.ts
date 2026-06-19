import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const goalId = body.goalId as string;
    const status = body.status as "active" | "completed" | "archived";

    if (!goalId || !["active", "completed", "archived"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Dati non validi" },
        { status: 400 }
      );
    }
    const userId = await getAuthenticatedUserId(req, body.userId);

    const { data: currentGoal, error: lookupError } = await supabaseAdmin
      .from("goals_desires")
      .select("id, status, completed_at, needs_review, review_requested_at")
      .eq("id", goalId)
      .eq("user_id", userId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { success: false, error: lookupError.message },
        { status: 500 }
      );
    }

    if (!currentGoal) {
      return NextResponse.json(
        { success: false, error: "Goal non trovato" },
        { status: 404 }
      );
    }

    if (currentGoal.status === status) {
      if (status === "active" && currentGoal.needs_review) {
        const { error: reviewError } = await supabaseAdmin
          .from("goals_desires")
          .update({
            needs_review: false,
            review_requested_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", goalId)
          .eq("user_id", userId)
          .eq("status", "active");

        if (reviewError) {
          return NextResponse.json(
            { success: false, error: reviewError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          status,
          unchanged: true,
          reviewResolved: true,
        });
      }

      return NextResponse.json({ success: true, status, unchanged: true });
    }

    if (["completed", "archived"].includes(currentGoal.status)) {
      return NextResponse.json(
        { success: false, error: "Riattivazione goal non consentita" },
        { status: 409 }
      );
    }

    if (status === "completed") {
      const { count, error: actionsError } = await supabaseAdmin
        .from("action_intents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("goal_id", goalId)
        .in("status", ["detected", "pending"]);

      if (actionsError) {
        return NextResponse.json(
          { success: false, error: actionsError.message },
          { status: 500 }
        );
      }

      if ((count || 0) > 0) {
        return NextResponse.json(
          { success: false, error: "Il goal ha ancora action aperte" },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("goals_desires")
      .update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        needs_review: false,
        review_requested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId)
      .eq("user_id", userId)
      .select("id, status, completed_at, needs_review, review_requested_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Goal non aggiornato" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, status, goal: data });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { success: false, error: "Errore API" },
      { status: 500 }
    );
  }
}
