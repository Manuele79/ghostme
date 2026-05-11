"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
  const [loading, setLoading] = useState(true);
  const [traits, setTraits] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserEmail(user.email || "");

      const { data, error } = await supabase
        .from("traits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("CHAT TRAITS:", data);
      console.log("CHAT ERROR:", error);

      setTraits(data);
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">
          GhostMe sta leggendo la tua mente...
        </p>
      </main>
    );
  }

  if (!traits) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-lg rounded-3xl border border-red-500/30 bg-zinc-950 p-8">
          <h1 className="text-3xl font-black text-red-400">
            Nessun profilo trovato.
          </h1>

          <p className="mt-4 text-zinc-300">
            Prima devi completare il setup psicologico di GhostMe 😄
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          GhostMe Chat
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Il tuo GhostMe è pronto.
        </h1>

        <p className="mt-4 text-zinc-400">
          Profilo collegato:
          <span className="ml-2 text-cyan-400">
            {userEmail}
          </span>
        </p>

        <div className="mt-10 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8">
          <h2 className="text-2xl font-black text-cyan-300">
            Profilo mentale rilevato
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Object.entries(traits)
              .filter(([key]) =>
                ![
                  "id",
                  "user_id",
                  "created_at",
                ].includes(key)
              )
              .map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-zinc-800 bg-black/40 p-4"
                >
                  <p className="text-sm uppercase tracking-wider text-zinc-500">
                    {key.replaceAll("_", " ")}
                  </p>

                  <p className="mt-2 text-3xl font-black text-white">
                    {String(value)}
                  </p>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-zinc-400">
            Presto qui parlerai con te 😄
          </p>
        </div>
      </div>
    </main>
  );
}