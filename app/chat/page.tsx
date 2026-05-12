"use client";

import { useEffect, useRef, useState } from "react";
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
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

      const { data: chatHistory, error: chatError } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(20);

      console.log("CHAT HISTORY:", chatHistory);
      console.log("CHAT HISTORY ERROR:", chatError);

      if (chatHistory) {
        setMessages(
          chatHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }))
        );

        const lastAssistant = [...chatHistory]
          .reverse()
          .find((msg) => msg.role === "assistant");

        if (lastAssistant) {
          setReply(lastAssistant.content);
        }
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

    useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

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
        messages,
        user_Id: traits.user_id,
      }),
    });

    const data = await res.json();

    console.log("CHAT RESPONSE:", data);

    setReply(data.reply || "Nessuna risposta.");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
      {
        role: "assistant",
        content: data.reply,
      },
    ]);

    setInput("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("chat_messages").insert([
        {
          user_id: user.id,
          role: "user",
          content: input,
        },
        {
          user_id: user.id,
          role: "assistant",
          content: data.reply,
        },
      ]);
    }

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
        <span className="ml-2 text-cyan-400">{userEmail}</span>
      </p>

      <button
        onClick={() => setShowProfile((prev) => !prev)}
        className="mt-6 rounded-2xl border border-cyan-500/40 px-5 py-3 text-sm font-bold text-cyan-300"
      >
        {showProfile ? "Nascondi profilo" : "Mostra profilo"}
      </button>

      <div className="mt-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-zinc-950 p-8 text-center">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-cyan-400/50 bg-black shadow-[0_0_45px_rgba(34,211,238,0.25)]">
        <span className="text-4xl font-black text-cyan-300">G</span>
      </div>

      <p className="mt-5 text-sm uppercase tracking-[0.35em] text-cyan-300">
        GhostMe Core
      </p>

      <p className="mt-3 text-zinc-300">
        Modalità attiva: chat testuale
      </p>

      <button
        className="mt-5 rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-300"
      >
        Modalità voce — presto
      </button>
    </div>

    {showProfile && (
     <>
      <div className="mt-10 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-8">
        <h2 className="text-2xl font-black text-cyan-300">
          Profilo mentale rilevato
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.entries(traits)
            .filter(([key]) => !["id", "user_id", "created_at"].includes(key))
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
     </>
  )}
      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Chat con GhostMe
        </p>

        <div className="mt-6 h-[55vh] overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-3xl border px-5 py-4 text-lg leading-relaxed ${
                msg.role === "user"
                  ? "ml-auto max-w-[80%] border-cyan-500/40 bg-cyan-500/10 text-white"
                  : "mr-auto max-w-[80%] border-zinc-800 bg-zinc-900 text-zinc-100"
              }`}
            >
              <div className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                {msg.role === "user" ? "Tu" : "GhostMe"}
              </div>

              {msg.content}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Scrivi qualcosa..."
          className="mt-4 h-28 w-full rounded-2xl border border-zinc-700 bg-black p-4 text-white outline-none"
        />

        <button
          onClick={sendMessage}
          disabled={loadingChat}
          className="mt-4 ml-auto block rounded-2xl bg-cyan-400 px-8 py-3 font-bold text-black"
        >
          {loadingChat ? "GhostMe pensa..." : "Invia"}
        </button>
      </div>
    </div>
  </main>
);
}