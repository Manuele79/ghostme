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

type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

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
  const [userName, setUserName] = useState("Tu");
  const [userProfile, setUserProfile] = useState<any>(null);

  const [ghostMessage, setGhostMessage] = useState("");
  const [summary, setSummary] = useState<string[]>([]);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const [mode, setMode] = useState<Mode>("chat-chat");
  const [voiceState, setVoiceState] =
  useState<VoiceState>("idle");

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const speakingRef = useRef(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [activeMemoryTab, setActiveMemoryTab] = useState<
    "memory" | "timeline" | "goals" | "state"
  >("memory");

  const [activeServiceTab, setActiveServiceTab] = useState<
    "actions" | "calendar" | "mail" | "web" | "home" | "profile" | "traits"
  >("actions");

  const [brainData, setBrainData] = useState<BrainData>({
    memories: [],
    timeline: [],
    goals: [],
    mentalState: null,
    actions: [],
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentModeLabel = useMemo(() => modeLabels[mode], [mode]);

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

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
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!profile) {
        router.push("/setup/profile");
        return;
      }

      setUserProfile(profile);
      setUserName(profile.full_name || "Tu");

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
  }, [messages, historyOpen]);

async function loadBrainData(userId: string) {
  const res = await fetch("/api/ghostme/brain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json();

  setBrainData({
    memories: data.memories || [],
    timeline: data.timeline || [],
    goals: data.goals || [],
    mentalState: data.mentalState || null,
    actions: data.actions || [],
  });

  if (data.profile) {
    setUserProfile(data.profile);
    setUserName(data.profile.full_name || "Tu");
  }

  if (data.traits) {
    setTraits(data.traits);
    setGhostMessage(buildGhostMeMessage(data.traits));
    setSummary(buildPersonalitySummary(data.traits));
  }
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

    setVoiceState("speaking");

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "it-IT";
    utterance.rate = 1;
    utterance.pitch = 1;

    speakingRef.current = true;

    utterance.onend = () => {
      speakingRef.current = false;

      setVoiceState("idle");

      if (mode === "voce-voce") {
        setTimeout(() => {
          startVoiceInput();
        }, 600);
      }
    };

    utterance.onerror = () => {
      speakingRef.current = false;
      setVoiceState("idle");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function startVoiceInput() {
    if (speakingRef.current) return;

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert("Riconoscimento vocale non supportato.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    setVoiceState("listening");

    recognition.onresult = (event: any) => {
      clearTimeout(silenceTimeoutRef.current);

      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      const combined = (finalTranscript + interim).trim();

      setInput(combined);

      silenceTimeoutRef.current = setTimeout(async () => {
        const text = combined.trim();

        if (!text) return;

        recognition.stop();

        setVoiceState("thinking");

        setInput(text);

        setTimeout(async () => {
          await sendVoiceMessage(text);
        }, 300);
      }, 1400);
    };

    recognition.onerror = () => {
      setVoiceState("idle");
    };

    recognition.onend = () => {
      if (voiceState === "listening") {
        setVoiceState("idle");
      }
    };

    recognition.start();
  }

  async function sendVoiceMessage(voiceText: string) {
  if (!voiceText.trim()) return;
  if (!traits) return;

  setLoadingChat(true);

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: voiceText,
    },
  ]);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: voiceText,
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
      await supabase
        .from("chat_messages")
        .insert([
          {
            user_id: user.id,
            role: "user",
            content: voiceText,
          },
          {
            user_id: user.id,
            role: "assistant",
            content: assistantReply,
          },
        ]);

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

    speak(assistantReply);
  } catch (err) {
    console.log(err);

    setVoiceState("idle");
  }

  setLoadingChat(false);
}

  async function sendMessage() {
    if (!input.trim()) return;
    if (!traits) return;

    const userText = input.trim();

    if (mode !== "chat-chat") {
      setVoiceState("thinking");
    }
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

    if (mode !== "voce-voce") {
    setVoiceState("idle");
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
      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 211, 238, 0.75) rgba(0, 0, 0, 0.35);
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.35);
          border-radius: 999px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.75);
          border-radius: 999px;
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.45);
        }

        @keyframes ghostCorePulse {
          0%,
          100% {
            transform: scale(0.96);
            opacity: 0.72;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes ghostOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes ghostReverseOrbit {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes ghostFlicker {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.9;
          }
        }
      `}</style>

      <GhostEnergyBackground mode={mode} />

      <MemoryDrawer
        open={memoryOpen}
        onClose={() => setMemoryOpen(false)}
        activeTab={activeMemoryTab}
        setActiveTab={setActiveMemoryTab}
        brainData={brainData}
      />

      <ServicesDrawer
        open={servicesOpen}
        onClose={() => setServicesOpen(false)}
        activeTab={activeServiceTab}
        setActiveTab={setActiveServiceTab}
        userEmail={userEmail}
        userProfile={userProfile}
        traits={traits}
        summary={summary}
        ghostMessage={ghostMessage}
        actions={brainData.actions}
        logout={logout}
      />

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        messages={messages}
        userName={userName}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-4 pt-6 sm:px-6">
        <header className="relative mx-auto w-full max-w-5xl text-center">
          <button
            onClick={() => setMemoryOpen(true)}
            className="absolute left-0 top-8 hidden rounded-2xl border border-cyan-400/25 bg-black/50 px-5 py-3 text-sm font-bold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.16)] sm:block"
          >
            Memoria
          </button>

          <button
            onClick={() => setServicesOpen(true)}
            className="absolute right-0 top-8 hidden rounded-2xl border border-cyan-400/25 bg-black/50 px-5 py-3 text-sm font-bold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.16)] sm:block"
          >
            Servizi
          </button>

          <p className="text-xs uppercase tracking-[0.45em] text-cyan-400">
            GhostMe
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl">
            GhostMe
          </h1>

          <p className="mt-2 text-sm text-zinc-400 sm:text-base">
            Memoria cognitiva attiva
          </p>

          <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
            <button
              onClick={() => setMemoryOpen(true)}
              className="rounded-2xl border border-cyan-400/25 bg-black/50 px-4 py-3 text-sm font-bold text-cyan-200"
            >
              Memoria
            </button>

            <button
              onClick={() => setServicesOpen(true)}
              className="rounded-2xl border border-cyan-400/25 bg-black/50 px-4 py-3 text-sm font-bold text-cyan-200"
            >
              Servizi
            </button>
          </div>
        </header>

        {mode === "voce-voce" ? (
          <VoiceOnlyMode
            currentModeLabel={currentModeLabel}
            cycleMode={cycleMode}
            startVoiceInput={startVoiceInput}
            openMemory={() => setMemoryOpen(true)}
            openServices={() => setServicesOpen(true)}
          />
        ) : (
          <ChatMode
            mode={mode}
            currentModeLabel={currentModeLabel}
            cycleMode={cycleMode}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            loadingChat={loadingChat}
            startVoiceInput={startVoiceInput}
            lastUserMessage={lastUserMessage}
            lastAssistantMessage={lastAssistantMessage}
            userName={userName}
            openHistory={() => setHistoryOpen(true)}
          />
        )}
      </div>
    </main>
  );
}

function GhostEnergyBackground({ mode }: { mode: Mode }) {
  const voiceOnly = mode === "voce-voce";

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[46%]" : "top-[45%]"
        } h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[130px]`}
        style={{ animation: "ghostCorePulse 5s ease-in-out infinite" }}
      />

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[47%]"
        } h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 bg-cyan-400/8 shadow-[0_0_120px_rgba(34,211,238,0.20)]`}
      />

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[47%]"
        } h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full`}
        style={{ animation: "ghostOrbit 12s linear infinite" }}
      >
        <div className="absolute left-1/2 top-0 h-3 w-20 -translate-x-1/2 rounded-full bg-cyan-200/70 blur-[2px] shadow-[0_0_35px_rgba(34,211,238,0.8)]" />
        <div className="absolute bottom-8 right-6 h-2 w-16 rounded-full bg-cyan-400/60 blur-[2px] shadow-[0_0_28px_rgba(34,211,238,0.7)]" />
      </div>

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[47%]"
        } h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full`}
        style={{ animation: "ghostReverseOrbit 8s linear infinite" }}
      >
        <div className="absolute right-0 top-1/2 h-2 w-14 rounded-full bg-cyan-100/70 blur-[1px] shadow-[0_0_35px_rgba(125,249,255,0.85)]" />
      </div>

      <div
        className={`absolute left-1/2 ${
          voiceOnly ? "top-[47%]" : "top-[47%]"
        } h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100/35 shadow-[0_0_90px_rgba(34,211,238,0.8)]`}
        style={{ animation: "ghostCorePulse 2.8s ease-in-out infinite" }}
      />

      <div
        className="absolute left-[18%] top-[28%] h-1 w-1 rounded-full bg-cyan-200"
        style={{ animation: "ghostFlicker 3s ease-in-out infinite" }}
      />
      <div
        className="absolute right-[22%] top-[36%] h-1 w-1 rounded-full bg-cyan-200"
        style={{ animation: "ghostFlicker 4s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[22%] left-[34%] h-1 w-1 rounded-full bg-cyan-300"
        style={{ animation: "ghostFlicker 5s ease-in-out infinite" }}
      />
    </div>
  );
}

function ChatMode({
  mode,
  currentModeLabel,
  cycleMode,
  input,
  setInput,
  sendMessage,
  loadingChat,
  startVoiceInput,
  lastUserMessage,
  lastAssistantMessage,
  userName,
  openHistory,
}: {
  mode: Mode;
  currentModeLabel: string;
  cycleMode: () => void;
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  loadingChat: boolean;
  startVoiceInput: () => void;
  lastUserMessage?: ChatMessage;
  lastAssistantMessage?: ChatMessage;
  userName: string;
  openHistory: () => void;
}) {
  return (
    <section className="relative mx-auto mt-8 flex w-full max-w-4xl flex-1 flex-col justify-end">
      <div className="relative z-10 flex min-h-[36vh] flex-col justify-end gap-5 pb-5">
        {lastUserMessage && (
          <ChatBubble
            role="user"
            label={userName}
            content={lastUserMessage.content}
          />
        )}

        {lastAssistantMessage && (
          <ChatBubble
            role="assistant"
            label="GhostMe"
            content={lastAssistantMessage.content}
          />
        )}

        {!lastUserMessage && !lastAssistantMessage && (
          <div className="mx-auto max-w-xl rounded-3xl border border-cyan-400/20 bg-black/45 p-5 text-center text-zinc-300 backdrop-blur-sm">
            Scrivi qualcosa. GhostMe ha già il cervello acceso.
          </div>
        )}
      </div>

      <button
        onClick={openHistory}
        className="absolute left-[-3.8rem] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-400/25 bg-black/70 text-xs font-black text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.18)] lg:flex"
        title="Cronologia"
      >
        ↺
      </button>

      <div className="relative z-20 rounded-[1.6rem] border border-cyan-400/10 bg-black/60 p-2 backdrop-blur-md">
        <div className="flex gap-2">
          <button
            onClick={cycleMode}
            className="hidden rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 text-xs font-black text-cyan-100 sm:block"
          >
            {currentModeLabel}
          </button>

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
            className="h-16 flex-1 resize-none rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-400"
          />

          <button
            onClick={sendMessage}
            disabled={loadingChat}
            className="rounded-2xl bg-cyan-300 px-5 font-black text-black shadow-[0_0_25px_rgba(34,211,238,0.28)] disabled:opacity-50"
          >
            {loadingChat ? "..." : "↗"}
          </button>
        </div>

        <div className="mt-2 flex justify-between gap-2 sm:hidden">
          <button
            onClick={openHistory}
            className="rounded-2xl border border-cyan-400/20 px-4 py-2 text-xs font-bold text-cyan-200"
          >
            Cronologia
          </button>

          <button
            onClick={cycleMode}
            className="rounded-2xl border border-cyan-400/20 px-4 py-2 text-xs font-bold text-cyan-200"
          >
            {currentModeLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

function VoiceOnlyMode({
  currentModeLabel,
  cycleMode,
  startVoiceInput,
  openMemory,
  openServices,
}: {
  currentModeLabel: string;
  cycleMode: () => void;
  startVoiceInput: () => void;
  openMemory: () => void;
  openServices: () => void;
}) {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center pb-10">
      <button
        onClick={startVoiceInput}
        className="relative z-20 flex h-44 w-44 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_120px_rgba(34,211,238,0.45)] transition hover:scale-105"
      >
        <div className="h-24 w-24 rounded-full bg-cyan-200/40 shadow-[0_0_80px_rgba(34,211,238,0.9)]" />
      </button>

      <p className="relative z-20 mt-10 text-lg text-cyan-100">
        GhostMe è in ascolto
      </p>

      <div className="relative z-20 mt-10 grid w-full max-w-md grid-cols-3 gap-3">
        <button
          onClick={openMemory}
          className="rounded-2xl border border-cyan-400/25 bg-black/60 px-4 py-3 text-sm font-bold text-cyan-200"
        >
          Memoria
        </button>

        <button
          onClick={cycleMode}
          className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm font-black text-cyan-100"
        >
          {currentModeLabel}
        </button>

        <button
          onClick={openServices}
          className="rounded-2xl border border-cyan-400/25 bg-black/60 px-4 py-3 text-sm font-bold text-cyan-200"
        >
          Servizi
        </button>
      </div>
    </section>
  );
}

function ChatBubble({
  role,
  label,
  content,
}: {
  role: "user" | "assistant";
  label: string;
  content: string;
}) {
  return (
    <div
      className={`rounded-3xl px-5 py-4 text-base leading-relaxed shadow-[0_0_20px_rgba(0,0,0,0.22)] ${
        role === "user"
          ? "ml-auto max-w-[88%] border border-cyan-400/25 bg-cyan-400/10 text-white"
          : "mr-auto max-w-[88%] border border-zinc-800 bg-zinc-900/88 text-zinc-100"
      }`}
    >
      <div
        className={`mb-2 text-[11px] uppercase tracking-[0.32em] ${
          role === "user" ? "text-cyan-300/90" : "text-cyan-200/85"
        }`}
      >
        {label}
      </div>

      {content}
    </div>
  );
}

function MemoryDrawer({
  open,
  onClose,
  activeTab,
  setActiveTab,
  brainData,
}: {
  open: boolean;
  onClose: () => void;
  activeTab: "memory" | "timeline" | "goals" | "state";
  setActiveTab: (tab: "memory" | "timeline" | "goals" | "state") => void;
  brainData: BrainData;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative h-full w-[94%] max-w-md overflow-y-auto border-r border-cyan-400/20 bg-zinc-950/95 p-5 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
              GhostMe Memory
            </p>

            <h2 className="mt-2 text-2xl font-black">Memoria viva</h2>
          </div>

          <button
            onClick={onClose}
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
              onClick={() => setActiveTab(key as any)}
              className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                activeTab === key
                  ? "border-cyan-300 bg-cyan-300 text-black"
                  : "border-zinc-800 bg-black text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <BrainPanelContent activeTab={activeTab} brainData={brainData} />
        </div>
      </aside>
    </div>
  );
}

function ServicesDrawer({
  open,
  onClose,
  activeTab,
  setActiveTab,
  userEmail,
  userProfile,
  traits,
  summary,
  ghostMessage,
  actions,
  logout,
}: {
  open: boolean;
  onClose: () => void;
  activeTab:
    | "actions"
    | "calendar"
    | "mail"
    | "web"
    | "home"
    | "profile"
    | "traits";
  setActiveTab: (
    tab:
      | "actions"
      | "calendar"
      | "mail"
      | "web"
      | "home"
      | "profile"
      | "traits"
  ) => void;
  userEmail: string;
  userProfile: any;
  traits: any;
  summary: string[];
  ghostMessage: string;
  actions: any[];
  logout: () => void;
}) {
  if (!open) return null;

  const serviceButtons: {
    key:
      | "actions"
      | "calendar"
      | "mail"
      | "web"
      | "home"
      | "profile"
      | "traits";
    label: string;
  }[] = [
    { key: "actions", label: "Azioni" },
    { key: "calendar", label: "Calendario" },
    { key: "mail", label: "Mail" },
    { key: "web", label: "Web" },
    { key: "home", label: "Home Assistant" },
    { key: "profile", label: "Profilo" },
    { key: "traits", label: "Valutazione" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative h-full w-[94%] max-w-lg overflow-y-auto border-l border-cyan-400/20 bg-zinc-950/95 p-5 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
              GhostMe Systems
            </p>

            <h2 className="mt-2 text-2xl font-black">Servizi</h2>

            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-cyan-300">
              Profilo collegato
            </p>

            <p className="mt-1 text-sm text-zinc-300">{userEmail}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {serviceButtons.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`rounded-2xl border p-4 text-left ${
                activeTab === item.key
                  ? "border-cyan-300 bg-cyan-300 text-black"
                  : "border-zinc-800 bg-black/60 text-cyan-100"
              }`}
            >
              <p className="font-bold">{item.label}</p>
              <p
                className={`mt-2 text-xs ${
                  activeTab === item.key ? "text-black/60" : "text-zinc-500"
                }`}
              >
                {["actions", "profile", "traits"].includes(item.key)
                  ? "Online"
                  : "Offline / coming soon"}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <ServicePanelContent
            activeTab={activeTab}
            userProfile={userProfile}
            traits={traits}
            summary={summary}
            ghostMessage={ghostMessage}
            actions={actions}
          />
        </div>

        <button
          onClick={logout}
          className="mt-8 w-full rounded-2xl border border-red-500/30 px-4 py-3 text-sm font-bold text-red-300"
        >
          Logout
        </button>
      </aside>
    </div>
  );
}

function ServicePanelContent({
  activeTab,
  userProfile,
  traits,
  summary,
  ghostMessage,
  actions,
}: {
  activeTab:
    | "actions"
    | "calendar"
    | "mail"
    | "web"
    | "home"
    | "profile"
    | "traits";
  userProfile: any;
  traits: any;
  summary: string[];
  ghostMessage: string;
  actions: any[];
}) {
  if (activeTab === "profile") {
    return (
      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <p className="text-lg font-black text-cyan-200">Profilo utente</p>

        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          {[
            ["Nome", userProfile?.full_name],
            ["Età", userProfile?.age],
            ["Genere", userProfile?.gender],
            ["Lavoro", userProfile?.job],
            ["Hobby", userProfile?.hobbies],
            ["Sport", userProfile?.sports],
            ["Relazione", userProfile?.relationship_status],
            ["Figli", userProfile?.children_info],
            ["Interessi", userProfile?.interests],
            ["Bio", userProfile?.short_bio],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-zinc-800 bg-black/45 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                {label}
              </p>
              <p className="mt-1 text-zinc-100">{String(value || "—")}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "traits") {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-lg font-black text-cyan-200">
            Valutazione profilo
          </p>

          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {ghostMessage}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(traits || {})
            .filter(([key]) => !["id", "user_id", "created_at"].includes(key))
            .map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border border-zinc-800 bg-black/50 p-3"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {key.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  {String(value)}
                </p>
              </div>
            ))}
        </div>

        <div className="space-y-2">
          {summary.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-800 bg-black/40 p-3 text-sm text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "actions") {
    if (!actions.length) {
      return <EmptyBrainBox text="Nessuna azione futura rilevata." />;
    }

    return (
      <div className="space-y-3">
        {actions.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-zinc-800 bg-black/60 p-4"
          >
            <p className="text-sm font-black text-cyan-200">
              {item.title || item.intent_type}
            </p>
            <p className="mt-2 text-sm text-zinc-300">
              {item.description || "Nessuna descrizione"}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              {item.intent_type} · priorità {item.priority}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <EmptyBrainBox text="Servizio predisposto. Lo colleghiamo quando il cervello è stabile." />
  );
}

function HistoryDrawer({
  open,
  onClose,
  messages,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  userName: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative h-full w-[94%] max-w-lg overflow-y-auto border-l border-cyan-400/20 bg-zinc-950/95 p-5 shadow-[0_0_60px_rgba(34,211,238,0.18)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
              GhostMe Chat
            </p>
            <h2 className="mt-2 text-2xl font-black">Cronologia</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              role={msg.role}
              label={msg.role === "user" ? userName : "GhostMe"}
              content={msg.content}
            />
          ))}

          <div />
        </div>
      </aside>
    </div>
  );
}

function BrainPanelContent({
  activeTab,
  brainData,
}: {
  activeTab: "memory" | "timeline" | "goals" | "state";
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
        : brainData.goals;

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