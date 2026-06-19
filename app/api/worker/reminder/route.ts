import { NextResponse } from "next/server";
import { refreshActiveReminderUsers } from "@/lib/ghostme/agenda/reminderEngine";
import {
  requireWorkerRequest,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export async function GET(req: Request) {
  try {
    requireWorkerRequest(req);

    const result = await refreshActiveReminderUsers();

    return NextResponse.json(
      {
        success: result.failed === 0,
        ...result,
      },
      { status: result.failed ? 500 : 200 }
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
