import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runProactiveFlowForUser } from "@/lib/ghostme/proactive/proactiveUserFlow";
import { requireWorkerRequest, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function GET(req: Request) {
  try {
    requireWorkerRequest(req);
    const { data: users, error: usersError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, full_name, job, hobbies, sports, location");

    if (usersError) {
      console.log("PROACTIVE USERS ERROR:", usersError);
      return NextResponse.json(
        { success: false, error: usersError },
        { status: 500 }
      );
    }

    if (!users?.length) {
      return NextResponse.json({ success: true, users: 0, created: 0 });
    }

    let created = 0;

    for (const user of users) {
      try {
        const result = await runProactiveFlowForUser(user);
        created += result.created;
      } catch (err) {
        console.log("PROACTIVE USER ERROR:", user.user_id, err);
      }
    }

    return NextResponse.json({
      success: true,
      users: users.length,
      created,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.log("PROACTIVE ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
