"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  buildGhostMeMessage,
  buildPersonalitySummary,
} from "@/lib/personality";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Mode = "chat-chat" | "voce-chat" | "voce-voce";

type BrainData = {
  memories: any[];
  timeline: any[];
  goals: any[];
  mentalState: any | null;
  actions: any[];
};

const modeLabels: Record<Mode, string> = {
  "chat-chat": "Chat → Chat",
  "voce-chat": "Voce → Chat",
  "voce-voce": "Voce → Voce",
};

export default function ChatPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [traits, setTraits] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");

  const [ghostMessage, setGhostMessage] = useState("");
  const [summary, setSummary] = useState<string[]>([]);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const [mode, setMode] = useState<Mode>("chat-chat");
  const [brainOpen, setBrainOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeBrainTab, setActiveBrainTab] = useState<
    "memory" | "timeline" | "goals" | "state" | "actions"
  >("memory");

  const [brainData, setBrainData] = useState<BrainData>({
    memories: [],
    timeline: [],
    goals: [],
    mentalState: null,
    actions: [],
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentModeLabel = useMemo(() => modeLabels[mode], [mode]);

  useEffect(() => {
    const savedMode =
      typeof window !== "undefined"
        ? (localStorage.getItem("ghostme_mode") as Mode | null)
        : null;

    if (
      savedMode === "chat-chat" ||
      savedMode === "voce-chat" ||
      savedMode === "voce-voce"
    ) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    async function boot() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!profile) {
        router.push("/setup/profile");
        return;
      }

      const { data: traitsData } = await supabase
        .from("traits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!traitsData) {
        router.push("/setup");
        return;
      }

      setTraits(traitsData);
      setGhostMessage(buildGhostMeMessage(traitsData));
      setSummary(buildPersonalitySummary(traitsData));

      const { data: chatHistory } = await supabase
        .from("chat_messages")
        .select("role, content, created_at, id, message_order")
        .eq("user_id", user.id)
        .order("message_order", { ascending: false })
        .limit(60);

      if (chatHistory) {
        const orderedHistory = [...chatHistory].reverse();

        setMessages(
          orderedHistory.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }))
        );
      }

      await loadBrainData(user.id);

      setLoading(false);
    }

    boot();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function loadBrainData(userId: string) {
    const [memoriesRes, timelineRes, goalsRes, mentalRes, actionsRes] =
      await Promise.all([
        supabase
          .from("memories_active")
          .select("*")
          .eq("user_id", userId)
          .order("pinned", { ascending: false })
          .order("importance", { ascending: false })
          .limit(20),

        supabase
          .from("autobiographical_timeline")
          .select("*")
          .eq("user_id", userId)
          .order("event_date", { ascending: false })
          .limit(20),

        supabase
          .from("goals_desires")
          .select("*")
          .eq("user_id", userId)
          .order("importance", { ascending: false })
          .limit(20),

        supabase
          .from("mental_states")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("action_intents")
          .select("*")
          .eq("user_id", userId)
          .order("priority", { ascending: false })
          .limit(20),
      ]);

    setBrainData({
      memories: memoriesRes.data || [],
      timeline: timelineRes.data || [],
      goals: goalsRes.data || [],
      mentalState: mentalRes.data || null,
      actions: actionsRes.data || [],
    });
  }

  function cycleMode() {
    const next: Mode =
      mode === "chat-chat"
        ? "voce-chat"
        : mode === "voce-chat"
          ? "voce-voce"
          : "chat-chat";

    setMode(next);
    localStorage.setItem("ghostme_mode", next);
  }

  function speak(text: string) {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function startVoiceInput() {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert("Il riconoscimento vocale non è supportato da questo browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
    };

    recognition.start();
  }

  async function sendMessage() {
    if (!input.trim()) return;
    if (!traits) return;

    const userText = input.trim();

    setLoadingChat(true);
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userText,
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          traits,
          messages,
          userId: traits.user_id,
        }),
      });

      const data = await res.json();

      const assistantReply = data.reply || "Nessuna risposta.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantReply,
        },
      ]);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: insertError } = await supabase
          .from("chat_messages")
          .insert([
            {
              user_id: user.id,
              role: "user",
              content: userText,
            },
            {
              user_id: user.id,
              role: "assistant",
              content: assistantReply,
            },
          ]);

        if (!insertError) {
          await fetch("/api/conversation-summary", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
            }),
          });

          await loadBrainData(user.id);
        }
      }

      if (mode === "voce-voce") {
        speak(assistantReply);
      }
    } catch (err) {
      console.log(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Errore comunicazione GhostMe.",
        },
      ]);
    }

    setLoadingChat(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-cyan-300">GhostMe si sta riattivando...</p>
      </main>
    );
  }

return (
  <main className="relative min-h-screen overflow-hidden bg-black text-white">
    {/* ENERGIA BACKGROUND */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[28%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[120px] animate-pulse" />

      <div className="absolute left-1/2 top-[28%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 bg-cyan-300/10 blur-[2px]" />

      <div className="absolute left-1/2 top-[28%] h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/20 shadow-[0_0_80px_rgba(34,211,238,0.55)]" />
    </div>

    {/* DRAWER MEMORIA */}
    {brainOpen && (
      <div className="fixed inset-0 z-50 flex">
        <button
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setBrainOpen(false)}
        />

        <aside className="relative h-full w-[92%] max-w-md overflow-y-auto border-r border-cyan-400/20 bg-zinc-950/95 p-5 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
                GhostMe Memory
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Memoria viva
              </h2>
            </div>

            <button
              onClick={() => setBrainOpen(false)}
              className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {[
              ["memory", "Memoria"],
              ["timeline", "Timeline"],
              ["goals", "Goals"],
              ["state", "Mental"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveBrainTab(key as any)}
                className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                  activeBrainTab === key
                    ? "border-cyan-300 bg-cyan-300 text-black"
                    : "border-zinc-800 bg-black text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <BrainPanelContent
              activeTab={activeBrainTab}
              brainData={brainData}
            />
          </div>
        </aside>
      </div>
    )}

    {/* DRAWER SERVIZI */}
    {profileOpen && (
      <div className="fixed inset-0 z-50 flex justify-end">
        <button
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setProfileOpen(false)}
        />

        <aside className="relative h-full w-[92%] max-w-md overflow-y-auto border-l border-cyan-400/20 bg-zinc-950/95 p-5 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
                GhostMe Systems
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Servizi
              </h2>
            </div>

            <button
              onClick={() => setProfileOpen(false)}
              className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300"
            >
              ✕
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              "Azioni",
              "Calendario",
              "Mail",
              "Web",
              "Home Assistant",
              "Voce",
              "GPS",
              "Notifiche",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-zinc-800 bg-black/60 p-4"
              >
                <p className="font-bold text-cyan-200">
                  {item}
                </p>

                <p className="mt-2 text-xs text-zinc-500">
                  Offline / coming soon
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Profilo collegato
            </p>

            <p className="mt-3 text-sm text-zinc-300">
              {userEmail}
            </p>

            <div className="mt-5 space-y-2">
              {summary.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-800 bg-black/40 p-3 text-sm text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={logout}
              className="mt-5 w-full rounded-2xl border border-red-500/30 px-4 py-3 text-sm font-bold text-red-300"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>
    )}

    {/* CONTENUTO */}
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-5 pt-6">
      
      {/* HEADER */}
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.45em] text-cyan-400">
          GhostMe
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
          GhostMe
        </h1>

        <p className="mt-3 text-sm text-zinc-400 sm:text-base">
          Memoria cognitiva attiva
        </p>

        {/* TASTI */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setBrainOpen(true)}
            className="rounded-2xl border border-cyan-400/25 bg-black/50 px-5 py-3 text-sm font-bold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.16)]"
          >
            Memoria
          </button>

          <button
            onClick={() => setProfileOpen(true)}
            className="rounded-2xl border border-cyan-400/25 bg-black/50 px-5 py-3 text-sm font-bold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.16)]"
          >
            Servizi
          </button>

          <button
            onClick={cycleMode}
            className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100"
          >
            {currentModeLabel}
          </button>
        </div>
      </header>

      {/* CHAT MODE */}
      {(mode === "chat-chat" || mode === "voce-chat") && (
        <section className="relative mt-10 flex min-h-0 flex-1 flex-col">
          
          {/* CHAT */}
          <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-black/45 backdrop-blur-sm">
            
            <div className="max-h-[58vh] min-h-[300px] overflow-y-auto px-4 py-5 sm:px-6">
              <div className="space-y-5">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-3xl px-5 py-4 text-base leading-relaxed shadow-[0_0_20px_rgba(0,0,0,0.22)] ${
                      msg.role === "user"
                        ? "ml-auto max-w-[88%] border border-cyan-400/25 bg-cyan-400/10 text-white"
                        : "mr-auto max-w-[88%] border border-zinc-800 bg-zinc-900/88 text-zinc-100"
                    }`}
                  >
                    <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                      {msg.role === "user" ? "Tu" : "GhostMe"}
                    </div>

                    {msg.content}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* INPUT */}
            <div className="border-t border-cyan-400/10 bg-black/55 p-3">
              <div className="flex gap-2">
                
                {mode === "voce-chat" && (
                  <button
                    onClick={startVoiceInput}
                    className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 text-cyan-200"
                  >
                    🎙
                  </button>
                )}

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
                  className="h-16 flex-1 resize-none rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-400"
                />

                <button
                  onClick={sendMessage}
                  disabled={loadingChat}
                  className="rounded-2xl bg-cyan-300 px-5 font-black text-black shadow-[0_0_25px_rgba(34,211,238,0.28)] disabled:opacity-50"
                >
                  ↗
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SOLO VOCE */}
      {mode === "voce-voce" && (
        <section className="relative flex flex-1 items-center justify-center">
          <div className="relative flex flex-col items-center">
            
            <div className="absolute h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[120px] animate-pulse" />

            <button
              onClick={startVoiceInput}
              className="relative flex h-44 w-44 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_120px_rgba(34,211,238,0.45)] transition hover:scale-105"
            >
              <div className="h-24 w-24 rounded-full bg-cyan-200/40 shadow-[0_0_80px_rgba(34,211,238,0.9)] animate-pulse" />
            </button>

            <p className="mt-10 text-lg text-cyan-100">
              GhostMe è in ascolto
            </p>
          </div>
        </section>
      )}
    </div>
  </main>
);
}

function BrainPanelContent({
  activeTab,
  brainData,
}: {
  activeTab: "memory" | "timeline" | "goals" | "state" | "actions";
  brainData: BrainData;
}) {
  if (activeTab === "state") {
    const s = brainData.mentalState;

    if (!s) return <EmptyBrainBox text="Nessuno stato mentale salvato." />;

    return (
      <div className="rounded-3xl border border-zinc-800 bg-black/60 p-4">
        <p className="text-lg font-black text-cyan-200">Mental State</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {[
            "stress",
            "entusiasmo",
            "stanchezza",
            "controllo",
            "nostalgia",
            "frustrazione",
            "focus",
            "socialita",
          ].map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
            >
              <p className="text-xs uppercase text-zinc-500">{key}</p>
              <p className="mt-1 text-2xl font-black text-white">
                {s[key] ?? 0}
              </p>
            </div>
          ))}
        </div>

        {s.notes && <p className="mt-4 text-sm text-zinc-300">{s.notes}</p>}
      </div>
    );
  }

  const list =
    activeTab === "memory"
      ? brainData.memories
      : activeTab === "timeline"
        ? brainData.timeline
        : activeTab === "goals"
          ? brainData.goals
          : brainData.actions;

  if (!list.length) return <EmptyBrainBox text="Nessun dato ancora." />;

  return (
    <div className="space-y-3">
      {list.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border border-zinc-800 bg-black/60 p-4"
        >
          <p className="text-sm font-black text-cyan-200">
            {item.title || item.trait || item.intent_type || "Elemento"}
          </p>

          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {item.content ||
              item.summary ||
              item.description ||
              item.notes ||
              "Nessuna descrizione"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500">
            {item.category && <span>{item.category}</span>}
            {item.status && <span>{item.status}</span>}
            {item.importance && <span>importanza {item.importance}</span>}
            {item.emotional_tone && <span>{item.emotional_tone}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyBrainBox({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black/60 p-5 text-sm text-zinc-400">
      {text}
    </div>
  );
}