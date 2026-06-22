import { NextResponse } from "next/server";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { completeActionIntentById } from "@/lib/ghostme/goals/goalsActionsLifecycle";

const ALLOWED_STATUSES = ["completed", "archived", "pending"] as const;
const OPEN_ACTION_STATUSES = ["detected", "active", "open", "pending"];

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body.id as string;
    const status = body.status as (typeof ALLOWED_STATUSES)[number];

    if (!id || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Dati non validi" },
        { status: 400 }
      );
    }

    const userId = await getAuthenticatedUserId(req, body.userId);
    const updatedAt = new Date().toISOString();

    if (status === "completed") {
      const result = await completeActionIntentById({ userId, actionId: id });

      if (result.error) {
        return NextResponse.json(
          { success: false, error: result.error.message },
          { status: 500 }
        );
      }

      if (!result.action) {
        return NextResponse.json(
          {
            success: false,
            error: result.invalidTransition
              ? "Transizione azione non consentita"
              : "Azione non trovata",
          },
          { status: result.invalidTransition ? 409 : 404 }
        );
      }

      return NextResponse.json({
        success: true,
        action: result.action,
        unchanged: result.alreadyCompleted || false,
        goalReviewRequested: result.reviewRequested || false,
      });
    }

    const { data: currentAction, error: lookupError } = await supabaseAdmin
      .from("action_intents")
      .select("id, status, goal_id, completed_at, updated_at")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { success: false, error: lookupError.message },
        { status: 500 }
      );
    }

    if (!currentAction) {
      return NextResponse.json(
        { success: false, error: "Azione non trovata" },
        { status: 404 }
      );
    }

    if (currentAction.status === status) {
      return NextResponse.json({
        success: true,
        action: currentAction,
        unchanged: true,
      });
    }

    if (!OPEN_ACTION_STATUSES.includes(currentAction.status)) {
      return NextResponse.json(
        { success: false, error: "Transizione azione non consentita" },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("action_intents")
      .update({ status, updated_at: updatedAt })
      .eq("id", id)
      .eq("user_id", userId)
      .in("status", OPEN_ACTION_STATUSES)
      .select("id, status, goal_id, completed_at, updated_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Azione non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, action: data });
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
