import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: users, error: usersError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, full_name");

    if (usersError) {
      console.log("PROACTIVE USERS ERROR:", usersError);
      return NextResponse.json({ success: false, error: usersError }, { status: 500 });
    }

    console.log("PROACTIVE USERS FOUND:", users?.length || 0);

    if (!users?.length) {
      return NextResponse.json({
        success: true,
        message: "Nessun profilo utente trovato",
        users: 0,
      });
    }

    let created = 0;

    for (const user of users) {
      const userId = user.user_id;

      const { data: calendar } = await supabaseAdmin
        .from("calendar_events")
        .select("title, type, start_at, remind_at")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("remind_at", { ascending: true })
        .limit(5);

      const { data: goals } = await supabaseAdmin
        .from("goals_desires")
        .select("title, description, importance")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("importance", { ascending: false })
        .limit(3);

      let message = `Buongiorno ${user.full_name || "Manuele"}.\n\n`;

      if (calendar?.length) {
        message += `📅 Hai ${calendar.length} appuntamenti o promemoria attivi.\n`;
        message += calendar
          .map((e) => `- ${e.title}`)
          .join("\n");
        message += "\n\n";
      }

      if (goals?.length) {
        message += `🎯 Hai ${goals.length} obiettivi aperti.\n`;
        message += goals
          .map((g) => `- ${g.title}`)
          .join("\n");
        message += "\n\n";
      }

      if (!calendar?.length && !goals?.length) {
        message += "Non vedo appuntamenti o obiettivi urgenti oggi.";
      }

      const { error: insertError } = await supabaseAdmin
        .from("ghost_proactive_messages")
        .insert({
          user_id: userId,
          title: "Daily Briefing",
          message,
          category: "daily_briefing",
          status: "unread",
          priority: 1,
          scheduled_for: new Date().toISOString(),
        });

      if (insertError) {
        console.log("PROACTIVE INSERT ERROR:", insertError);
      } else {
        created++;
      }
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