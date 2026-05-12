import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = body.userId;
    const title = body.title;
    const content = body.content;
    const category = body.category || "general";
    const importance = body.importance || 5;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "Dati memoria mancanti" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("memories_active")
      .insert([
        {
          user_id: userId,
          title,
          content,
          category,
          importance,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log("MEMORY ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memory: data });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Errore memoria GhostMe" },
      { status: 500 }
    );
  }
}