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
  ProactiveMessage,
} from "@/components/ghost/types";

import GhostHeader from "@/components/ghost/GhostHeader";
import GhostChat from "@/components/ghost/GhostChat";
import GhostVoiceMode from "@/components/ghost/GhostVoiceMode";
import GhostLayout from "@/components/ghost/GhostLayout";
import GhostBackground from "@/components/ghost/GhostBackground";

import { useGhostVoice } from "@/hooks/useGhostVoice";
import { useGhostChat } from "@/hooks/useGhostChat";
import { useGhostBrain } from "@/hooks/useGhostBrain";
import { getAuthenticatedJsonHeaders } from "@/lib/ghostme/auth/clientAuthHeaders";

import {
  MemoryDrawer,
  ServicesDrawer,
  HistoryDrawer,
} from "@/components/ghost/GhostDrawers";

const GPS_HEARTBEAT_MS = 15 * 60 * 1000;
const GPS_SIGNIFICANT_MOVEMENT_METERS = 100;

function gpsDistanceMeters(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number }
) {
  const radius = 6371000;
  const dLat = ((second.latitude - first.latitude) * Math.PI) / 180;
  const dLon = ((second.longitude - first.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((first.latitude * Math.PI) / 180) *
      Math.cos((second.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

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
  const [pendingProactiveReplyId, setPendingProactiveReplyId] = useState<
    string | null
  >(null);
  const [pendingLocationCard, setPendingLocationCard] = useState<
    Pick<ProactiveMessage, "id" | "message" | "logical_key"> | null
  >(null);

  const [activeMemoryTab, setActiveMemoryTab] = useState<
    "memory" | "timeline" | "goals" | "state"
  >("memory");

  const [activeServiceTab, setActiveServiceTab] = useState<
    "actions" | "calendar" | "mail" | "web" | "home" | "profile" | "traits" | "places"
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

  const { brainData, setBrainData, loadBrainData } = ghostBrain;

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

  function hideProactiveMessage(messageId?: string) {
    if (!messageId) return;

    setBrainData((prev) => {
      const proactiveMessages = (prev.proactiveMessages || []).filter(
        (message) => message.id !== messageId
      );

      return {
        ...prev,
        proactiveMessage:
          prev.proactiveMessage?.id === messageId
            ? proactiveMessages[0] || null
            : prev.proactiveMessage,
        proactiveMessages,
      };
    });
  }

  function scheduleBrainRefresh(delayMs = 5000) {
    const userId = currentUserId || traits?.user_id;
    if (!userId) return;

    window.setTimeout(() => {
      void refreshBrain(userId);
    }, delayMs);
  }

  function openMemoryDrawer() {
    setMemoryOpen(true);
    if (currentUserId) void refreshBrain(currentUserId);
  }

  function openServicesDrawer() {
    setServicesOpen(true);
    if (currentUserId) void refreshBrain(currentUserId);
  }

  function selectMemoryTab(
    tab: "memory" | "timeline" | "goals" | "state"
  ) {
    setActiveMemoryTab(tab);
    if (tab === "goals" && currentUserId) {
      void refreshBrain(currentUserId);
    }
  }

  async function markProactiveMessage(
    messageId?: string,
    status: "read" | "dismissed" | "answered" = "dismissed"
  ) {
    if (!messageId || !currentUserId) return;

    const res = await fetch("/api/ghostme/proactive/read", {
      method: "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        id: messageId,
        userId: currentUserId,
        status,
      }),
    });

    if (!res.ok) {
      console.log("PROACTIVE STATUS ERROR:", await res.text());
      return;
    }

    hideProactiveMessage(messageId);
    await refreshBrain(currentUserId);
  }

  async function markProactiveAsRead(messageId?: string) {
    await markProactiveMessage(messageId, "dismissed");
  }

  async function markProactiveAsAnswered(messageId?: string) {
    if (!messageId) return;
    setPendingProactiveReplyId(messageId);
}

  async function markReminderAsDone(messageId?: string) {
    await markProactiveMessage(messageId, "answered");
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

      // message_order is NOT NULL in the live DB and has no default.
      // Keep the two-message batch ordered without relying on an undocumented trigger.
      const messageOrderBase = Date.now() * 1000;

      const { error } = await supabase.from("chat_messages").insert([
        {
          user_id: user.id,
          role: "user",
          content: userText,
          message_order: messageOrderBase,
        },
        {
          user_id: user.id,
          role: "assistant",
          content: assistantReply,
          message_order: messageOrderBase + 1,
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
    let cancelled = false;
    let gpsWatchId: number | null = null;
    let lastGpsSentAt = 0;
    let lastGpsPosition: { latitude: number; longitude: number } | null = null;
    let gpsUpdateInFlight = false;

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

      if (!cancelled && navigator.geolocation) {
        gpsWatchId = navigator.geolocation.watchPosition(
          async (position) => {
            const coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            const movedMeters = lastGpsPosition
              ? gpsDistanceMeters(lastGpsPosition, coordinates)
              : Infinity;
            if (
              gpsUpdateInFlight ||
              Date.now() - lastGpsSentAt < GPS_HEARTBEAT_MS &&
              movedMeters < GPS_SIGNIFICANT_MOVEMENT_METERS
            ) {
              return;
            }
            gpsUpdateInFlight = true;
            try {
              const response = await fetch("/api/location/update-current", {
                method: "POST",
                headers: await getAuthenticatedJsonHeaders(),
                body: JSON.stringify({
                  userId: user.id,
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  accuracy: position.coords.accuracy,
                  confidence: position.coords.accuracy <= 50 ? 80 : 60,
                  source: "browser_gps",
                }),
              });
              if (!response.ok) {
                throw new Error(`GPS update HTTP ${response.status}`);
              }
              lastGpsSentAt = Date.now();
              lastGpsPosition = coordinates;
            } catch (err) {
              console.log("AUTO LOCATION ERROR:", err);
            } finally {
              gpsUpdateInFlight = false;
            }
          },
          (err) => {
            console.log("GPS ERROR:", err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60_000,
          }
        );
      }   

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
            created_at: msg.created_at,
          }))
        );
      }

      await refreshBrain(user.id);
      setLoading(false);

      try {
        const lastRun = localStorage.getItem("ghost_proactive_last_run");
        const now = Date.now();

        if (!lastRun || now - Number(lastRun) > 1000 * 60 * 30) {
          fetch("/api/worker/proactive", {
            method: "GET",
          })
            .then(async (res) => {
              if (!res.ok) {
                throw new Error(`Proactive worker HTTP ${res.status}`);
              }

              localStorage.setItem("ghost_proactive_last_run", String(Date.now()));
              await refreshBrain(user.id);
            })
            .catch((err) => {
              console.log("PROACTIVE WORKER BACKGROUND ERROR:", err);
            });
        }
      } catch (err) {
        console.log("PROACTIVE WORKER BOOT ERROR:", err);
      }
    }

    boot();
    return () => {
      cancelled = true;
      if (gpsWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
    };
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
        headers: await getAuthenticatedJsonHeaders(),
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
      scheduleBrainRefresh();
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
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        message: userText,
        traits,
        messages,
        userId: traits.user_id,
        proactiveMessageId: pendingProactiveReplyId,
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
    scheduleBrainRefresh();

    if (pendingProactiveReplyId) {
      const answeredMessageId = pendingProactiveReplyId;
      setPendingProactiveReplyId(null);
      await markProactiveMessage(answeredMessageId, "answered");
    }
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

  function replyToProactiveMessage(
    message: string,
    messageId?: string,
    logicalKey?: string | null
  ) {
    if (messageId && String(logicalKey || "").startsWith("location_candidate_")) {
      setPendingLocationCard({ id: messageId, message, logical_key: logicalKey });
      setActiveServiceTab("places");
      setServicesOpen(true);
      return;
    }

    if (messageId) {
      setPendingProactiveReplyId(messageId);
    }

    setInput(
      `Sto rispondendo alla tua osservazione:\n\n"${message}"\n\nRisposta: `
    );

    setServicesOpen(false);
  }

  function replyToProactiveCard(message: {
    id: string;
    message: string;
    logical_key?: string | null;
  }) {
    replyToProactiveMessage(message.message, message.id, message.logical_key);
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
        setActiveTab={selectMemoryTab}
        brainData={brainData}
        currentUserId={currentUserId}
        refreshBrain={refreshBrain}
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
        brainData={brainData}
        actions={brainData.actions}
        calendarEvents={brainData.calendarEvents}
        refreshBrain={refreshBrain}
        currentUserId={currentUserId}
        logout={logout}
        onReplyObservation={replyToProactiveMessage}
        pendingLocationCard={pendingLocationCard}
        onLocationCandidateHandled={(messageId) => {
          hideProactiveMessage(messageId);
          setPendingLocationCard(null);
        }}
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
          openMemory={openMemoryDrawer}
          openServices={openServicesDrawer}
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
            openMemory={openMemoryDrawer}
            openServices={openServicesDrawer}
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
            proactiveMessages={brainData.proactiveMessages}
            onProactiveSeen={markProactiveAsRead}
            onProactiveReply={replyToProactiveCard}
            onReminderDone={markReminderAsDone}
            userName={userName}
            openHistory={() => setHistoryOpen(true)}
          />
        )}
      </div>
    </GhostLayout>
  );
}
