import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runProactiveFlowForUser } from "@/lib/ghostme/proactive/proactiveUserFlow";

export async function GET() {
  try {
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
      const result = await runProactiveFlowForUser(user);
      created += result.created;
    }

    return NextResponse.json({
      success: true,
      users: users.length,
      created,
    });
  } catch (err) {
    console.log("PROACTIVE ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
