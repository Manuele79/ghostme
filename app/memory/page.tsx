"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MemoryItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  importance: number;
  created_at: string;
  pinned?: boolean;
  updated_at?: string;
};

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("memories_active")
      .select("*")
      .eq("user_id", user.id)
      .order("pinned", { ascending: false })
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false });

    console.log("MEMORIES:", data);
    console.log("MEMORIES ERROR:", error);

    if (data) {
      setMemories(data);
    }

    setLoading(false);
  }

  async function deleteMemory(id: string) {
    await supabase
      .from("memories_active")
      .delete()
      .eq("id", id);

    setMemories((prev) =>
      prev.filter((m) => m.id !== id)
    );
  }

 async function togglePinned(id: string, current: boolean) {
  await supabase
    .from("memories_active")
    .update({
      pinned: !current,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  setMemories((prev) =>
    prev.map((m) =>
      m.id === id
        ? {
            ...m,
            pinned: !current,
          }
        : m
    )
  );
}

async function increaseImportance(
  id: string,
  current: number
) {
  const next = Math.min(current + 1, 10);

  await supabase
    .from("memories_active")
    .update({
      importance: next,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  setMemories((prev) =>
    prev.map((m) =>
      m.id === id
        ? {
            ...m,
            importance: next,
          }
        : m
    )
  );
}

  const filteredMemories = memories.filter((m) =>
    `${m.title} ${m.content} ${m.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">
          GhostMe sta cercando nei ricordi...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-5xl font-black">
          Memory Core
        </h1>

        <p className="mt-4 text-zinc-400">
          Ricordi salvati da GhostMe.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca memoria..."
          className="mt-8 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
        />

        <div className="mt-8 space-y-5">
          {filteredMemories.map((memory) => (
            <div
              key={memory.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs uppercase tracking-wider text-cyan-300">
                  {memory.category}
                </span>

                <span className="text-xs text-zinc-500">
                  Importanza: {memory.importance}/10
                </span>
              </div>

              <p className="mt-4 text-xl font-bold">
                {memory.title || "Memoria"}
              </p>

              <p className="mt-3 text-zinc-300 leading-relaxed">
                {memory.content}
              </p>

                <div className="mt-5 flex flex-wrap gap-3">
                <button
                    onClick={() =>
                    togglePinned(memory.id, !!memory.pinned)
                    }
                    className="rounded-2xl border border-yellow-500/30 px-4 py-2 text-sm text-yellow-300"
                >
                    {memory.pinned ? "Unpin" : "📌 Pin"}
                </button>

                <button
                    onClick={() =>
                    increaseImportance(
                        memory.id,
                        memory.importance
                    )
                    }
                    className="rounded-2xl border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300"
                >
                    ⭐ Importanza +
                </button>

                <button
                    onClick={() => deleteMemory(memory.id)}
                    className="rounded-2xl border border-red-500/30 px-4 py-2 text-sm text-red-400"
                >
                    🗑 Elimina
                </button>
                </div>         


            </div>
          ))}
        </div>
      </div>
    </main>
  );
}