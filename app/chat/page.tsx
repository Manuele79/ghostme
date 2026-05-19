"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  buildGhostMeMessage,
  buildPersonalitySummary,
} from "@/lib/personality";

import GhostCore from "@/components/ghost/GhostCore";
import GhostHeader from "@/components/ghost/GhostHeader";
import GhostChat from "@/components/ghost/GhostChat";
import GhostVoiceMode from "@/components/ghost/GhostVoiceMode";
import GhostLayout from "@/components/ghost/GhostLayout";
import GhostBackground from "@/components/ghost/GhostBackground";
import { useGhostVoice } from "@/hooks/useGhostVoice";

import {
  MemoryDrawer,
  ServicesDrawer,
  HistoryDrawer,
} from "@/components/ghost/GhostDrawers";

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

  const [micEnabled, setMicEnabled] = useState(false);
  const autoMicOffRef = useRef<any>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const speakingRef = useRef(false);
  const modeRef = useRef<Mode>("chat-chat");
  const ghostVoice = useGhostVoice();

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

  useEffect(() => {
    modeRef.current = mode;

    if (mode === "chat-chat") {
      try {
        recognitionRef.current?.stop();
      } catch {}

      recognitionRef.current = null;

      clearTimeout(silenceTimeoutRef.current);

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      speakingRef.current = false;
      setVoiceState("idle");
    }
  }, [mode]);


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


    function startVoiceInput() {
      if (modeRef.current === "chat-chat") return;
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

    if (modeRef.current === "chat-chat") {
      setVoiceState("idle");
      return;
    }
  if (!voiceText.trim()) return;
  if (!traits) return;
  setInput("");

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

    setLoadingChat(false);

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

if (modeRef.current === "voce-voce") {
  ghostVoice.speak(
  assistantReply,
  mode,
  startVoiceInput
);
} else {
  setVoiceState("idle");
}
  } catch (err) {
    console.log(err);

    setVoiceState("idle");
  }
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

      setLoadingChat(false);

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
        ghostVoice.speak(
        assistantReply,
        mode,
        startVoiceInput
      );
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
    <GhostLayout>

      {mode !== "voce-voce" && (
        <GhostBackground mode={mode} voiceState={voiceState} />
      )}

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
        <GhostHeader
          mode={mode}
          userName={userName}
          openMemory={() => setMemoryOpen(true)}
          openServices={() => setServicesOpen(true)}
        />

        {mode === "voce-voce" ? (
          <GhostVoiceMode
            voiceState={voiceState}
            micEnabled={micEnabled}
            setMicEnabled={setMicEnabled}
            autoMicOffRef={autoMicOffRef}
            recognitionRef={recognitionRef}
            speakingRef={speakingRef}
            setVoiceState={setVoiceState}
            currentModeLabel={currentModeLabel}
            cycleMode={cycleMode}
            startVoiceInput={startVoiceInput}
            openMemory={() => setMemoryOpen(true)}
            openServices={() => setServicesOpen(true)}
          />
        ) : (
          <GhostChat
            mode={mode}
            voiceState={voiceState}
            micEnabled={micEnabled}
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
    </GhostLayout>
  );
}



