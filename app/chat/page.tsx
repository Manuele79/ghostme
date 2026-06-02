"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  buildGhostMeMessage,
  buildPersonalitySummary,
} from "@/lib/personality";

import {
  GhostMode,
  modeLabels,
} from "@/components/ghost/types";

import GhostHeader from "@/components/ghost/GhostHeader";
import GhostChat from "@/components/ghost/GhostChat";
import GhostVoiceMode from "@/components/ghost/GhostVoiceMode";
import GhostLayout from "@/components/ghost/GhostLayout";
import GhostBackground from "@/components/ghost/GhostBackground";

import { useGhostVoice } from "@/hooks/useGhostVoice";
import { useGhostChat } from "@/hooks/useGhostChat";
import { useGhostBrain } from "@/hooks/useGhostBrain";

import {
  MemoryDrawer,
  ServicesDrawer,
  HistoryDrawer,
} from "@/components/ghost/GhostDrawers";

export default function ChatPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [traits, setTraits] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("Tu");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState("");

  const [ghostMessage, setGhostMessage] = useState("");
  const [summary, setSummary] = useState<string[]>([]);

  const [mode, setMode] = useState<GhostMode>("chat-chat");

  const [memoryOpen, setMemoryOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [activeMemoryTab, setActiveMemoryTab] = useState<
    "memory" | "timeline" | "goals" | "state"
  >("memory");

  const [activeServiceTab, setActiveServiceTab] = useState<
    "actions" | "calendar" | "mail" | "web" | "home" | "profile" | "traits"
  >("actions");

  const ghostVoice = useGhostVoice();
  const ghostChat = useGhostChat();
  const ghostBrain = useGhostBrain();

  const {
    voiceState,
    setVoiceState,
    micEnabled,
    setMicEnabled,
    recognitionRef,
    silenceTimeoutRef,
    autoMicOffRef,
    speakingRef,
    modeRef,
  } = ghostVoice;

  const {
    input,
    setInput,
    messages,
    setMessages,
    loadingChat,
    setLoadingChat,
  } = ghostChat;

  const { brainData, loadBrainData } = ghostBrain;

  const currentModeLabel = useMemo(() => modeLabels[mode], [mode]);

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  async function refreshBrain(userId: string) {
    const freshBrainData = await loadBrainData({
      userId,
      setUserProfile,
      setUserName,
      setTraits,
      setGhostMessage,
      setSummary,
    });
  }

  async function markProactiveAsRead(messageId?: string) {
    if (!messageId || !currentUserId) return;

    await fetch("/api/ghostme/proactive/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: messageId,
        userId: currentUserId,
      }),
    });
  }

  async function saveConversationInBackground({
    userText,
    assistantReply,
  }: {
    userText: string;
    assistantReply: string;
  }) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from("chat_messages").insert([
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

      if (error) return;

      await fetch("/api/conversation-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      await refreshBrain(user.id);
    } catch (err) {
      console.log("GhostMe background save error:", err);
    }
  }

  useEffect(() => {
    const savedMode =
      typeof window !== "undefined"
        ? (localStorage.getItem("ghostme_mode") as GhostMode | null)
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

      setCurrentUserId(user.id);

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

      await refreshBrain(user.id);
      setLoading(false);
    }

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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
  }, [
    mode,
    modeRef,
    recognitionRef,
    silenceTimeoutRef,
    speakingRef,
    setVoiceState,
  ]);

  function cycleMode() {
    const next: GhostMode =
      mode === "chat-chat"
        ? "voce-chat"
        : mode === "voce-chat"
          ? "voce-voce"
          : "chat-chat";

    setMode(next);
    localStorage.setItem("ghostme_mode", next);
  }

  async function sendVoiceMessage(voiceText: string) {
    if (modeRef.current === "chat-chat") {
      setVoiceState("idle");
      return;
    }

    if (!voiceText.trim()) return;
    if (!traits) return;

    const userText = voiceText.trim();

    setInput("");
    setLoadingChat(true);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          traits,
          messages,
          userId: traits.user_id,
        }),
      });

      setLoadingChat(false);

      // Crea subito un messaggio assistant vuoto da riempire a chunk
      let assistant = { role: "assistant" as const, content: "" };
      setMessages((prev) => [...prev, assistant]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistant.content += chunk;

          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...assistant };
            return copy;
          });
        }
      } else {
        // fallback non-streaming
        const data = await res.json();
        assistant.content = data.reply || "Nessuna risposta.";
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...assistant };
          return copy;
        });
      }

      if (modeRef.current === "voce-voce") {
        ghostVoice.speak(assistant.content, "voce-voce", startGhostVoiceInput);
      } else {
        setVoiceState("idle");
      }

      void saveConversationInBackground({
        userText,
        assistantReply: assistant.content,
      });
    } catch (err) {
      console.log(err);

      setLoadingChat(false);
      setVoiceState("idle");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Errore comunicazione GhostMe.",
        },
      ]);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        traits,
        messages,
        userId: traits.user_id,
      }),
    });

    setLoadingChat(false);

    // Crea subito un messaggio assistant vuoto da riempire a chunk
    let assistant = { role: "assistant" as const, content: "" };
    setMessages((prev) => [...prev, assistant]);

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistant.content += chunk;

        // aggiorna l’ultimo messaggio con il nuovo contenuto
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...assistant };
          return copy;
        });
      }
    } else {
      // fallback non-streaming
      const data = await res.json();
      assistant.content = data.reply || "Nessuna risposta.";
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...assistant };
        return copy;
      });
    }

    if (mode === "voce-voce") {
      ghostVoice.speak(assistant.content, mode, startGhostVoiceInput);
    } else {
      setVoiceState("idle");
    }

    void saveConversationInBackground({
      userText,
      assistantReply: assistant.content,
    });
  } catch (err) {
    console.log(err);

    setLoadingChat(false);
    setVoiceState("idle");

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Errore comunicazione GhostMe.",
      },
    ]);
  }
}

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function startGhostVoiceInput() {
    ghostVoice.startVoiceInput({
      mode,
      traits,
      setInput,
      sendVoiceMessage,
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
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
        calendarEvents={brainData.calendarEvents}
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
            startVoiceInput={startGhostVoiceInput}
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
            startVoiceInput={startGhostVoiceInput}
            lastUserMessage={lastUserMessage}
            lastAssistantMessage={lastAssistantMessage}
            proactiveMessage={brainData.proactiveMessage}
            onProactiveSeen={markProactiveAsRead}
            userName={userName}
            openHistory={() => setHistoryOpen(true)}
          />
        )}
      </div>
    </GhostLayout>
  );
}
