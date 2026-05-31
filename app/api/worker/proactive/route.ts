import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: users } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, full_name");

    if (!users?.length) {
      return NextResponse.json({ ok: true });
    }

    for (const user of users) {
      const userId = user.user_id;

      const { data: calendar } = await supabaseAdmin
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("remind_at", { ascending: true })
        .limit(5);

      const { data: goals } = await supabaseAdmin
        .from("goals_desires")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("importance", { ascending: false })
        .limit(3);

      let message = `Buongiorno ${user.full_name || ""}.\n\n`;

      if (calendar?.length) {
        message += `📅 Hai ${calendar.length} promemoria o appuntamenti attivi.\n`;
      }

      if (goals?.length) {
        message += `🎯 Hai ${goals.length} obiettivi ancora aperti.\n`;
      }

      if (!calendar?.length && !goals?.length) {
        message +=
          "Nessun appuntamento e nessun obiettivo urgente registrato.";
      }

      await supabaseAdmin.from("ghost_proactive_messages").insert({
        user_id: userId,
        title: "Daily Briefing",
        message,
        category: "daily_briefing",
        status: "unread",
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.log("PROACTIVE ERROR", err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}