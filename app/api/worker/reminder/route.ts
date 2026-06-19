import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { refreshReminderMessage } from "@/lib/ghostme/agenda/reminderEngine";
import {
  requireWorkerRequest,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export async function GET(req: Request) {
  try {
    requireWorkerRequest(req);

    const { data: users, error } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id");

    if (error) {
      console.log("REMINDER WORKER USERS ERROR:", error);
      return NextResponse.json(
        { success: false, error: "Utenti reminder non disponibili" },
        { status: 500 }
      );
    }

    const userIds = [
      ...new Set(
        (users || [])
          .map((user) => user.user_id)
          .filter((userId): userId is string => Boolean(userId))
      ),
    ];
    let processed = 0;
    const failedUserIds: string[] = [];

    for (const userId of userIds) {
      try {
        await refreshReminderMessage(userId);
        processed++;
      } catch (err) {
        failedUserIds.push(userId);
        console.log("REMINDER WORKER USER ERROR:", userId, err);
      }
    }

    return NextResponse.json(
      {
        success: failedUserIds.length === 0,
        users: userIds.length,
        processed,
        failed: failedUserIds.length,
      },
      { status: failedUserIds.length ? 500 : 200 }
    );
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.status }
      );
    }

    console.log("REMINDER WORKER ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
