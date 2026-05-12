import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("MEMORY API HIT:", body);

    const {
      user_id,
      title,
      content,
      category,
      importance,
    } = body;

    const { data, error } = await supabase
      .from("memories_active")
      .insert([
        {
          user_id,
          title,
          content,
          category,
          importance,
        },
      ])
      .select();

    console.log("MEMORY INSERT:", data);
    console.log("MEMORY ERROR:", error);

    if (error) {
      return NextResponse.json({
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json({
      error: "memory route failed",
    });
  }
}