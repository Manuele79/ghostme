"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  buildGhostMeMessage,
  buildPersonalitySummary,
} from "@/lib/personality";

export default function ChatPage() {
  const [loading, setLoading] = useState(true);
  const [traits, setTraits] = useState<any>(null);
  const [ghostMessage, setGhostMessage] = useState("");
  const [summary, setSummary] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
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
      if (data) {
        setGhostMessage(buildGhostMeMessage(data));
        setSummary(buildPersonalitySummary(data));
}
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

  async function sendMessage() {
  if (!input.trim()) return;

  setLoadingChat(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
        traits,
      }),
    });

    const data = await res.json();

    console.log("CHAT RESPONSE:", data);

    setReply(data.reply || "Nessuna risposta.");
  } catch (err) {
    console.log(err);
    setReply("Errore comunicazione GhostMe.");
  }

  setLoadingChat(false);
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

        <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            GhostMe
        </p>

        <p className="mt-4 text-xl leading-relaxed text-cyan-50">
            {ghostMessage}
        </p>

        <div className="mt-8 space-y-3">
            {summary.map((item, index) => (
            <div
                key={index}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-sm text-zinc-200"
            >
                • {item}
            </div>
            ))}
        </div>
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Chat con GhostMe
        </p>

        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi qualcosa..."
            className="mt-4 h-32 w-full rounded-2xl border border-zinc-700 bg-black p-4 text-white outline-none"
        />

        <button
            onClick={sendMessage}
            disabled={loadingChat}
            className="mt-4 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-black"
        >
            {loadingChat ? "GhostMe pensa..." : "Invia"}
        </button>

        {reply && (
            <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
            <p className="text-cyan-100 leading-relaxed">
                {reply}
            </p>
            </div>
        )}
        </div>
    </main>
  );
}