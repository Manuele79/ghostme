"use client";

import { useState } from "react";
import { getAuthenticatedJsonHeaders } from "@/lib/ghostme/auth/clientAuthHeaders";
import { GhostMode, VoiceState } from "./types";

type ProactiveCard = {
  id: string;
  title?: string | null;
  message: string;
  category?: string | null;
};

export default function GhostChat({
  mode,
  voiceState,
  micEnabled,
  currentModeLabel,
  cycleMode,
  input,
  setInput,
  sendMessage,
  loadingChat,
  startVoiceInput,
  lastUserMessage,
  lastAssistantMessage,
  proactiveMessage,
  proactiveMessages,
  onProactiveSeen,
  onProactiveAnswered,
  onReminderDone,
  userName,
  openHistory,
}: {
  mode: GhostMode;
  voiceState: VoiceState;
  micEnabled: boolean;
  currentModeLabel: string;
  cycleMode: () => void;
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  loadingChat: boolean;
  startVoiceInput: () => void;
  lastUserMessage?: {
    role: "user" | "assistant";
    content: string;
  };
  lastAssistantMessage?: {
    role: "user" | "assistant";
    content: string;
  };
  proactiveMessage?: ProactiveCard | null;
  proactiveMessages?: ProactiveCard[];
  onProactiveSeen?: (messageId?: string) => void;
  onProactiveAnswered?: (messageId?: string) => void;
  onReminderDone?: (messageId?: string) => void;
  userName: string;
  openHistory: () => void;
}) {
  const visibleProactiveMessages =
    proactiveMessages && proactiveMessages.length > 0
      ? proactiveMessages
      : proactiveMessage
        ? [proactiveMessage]
        : [];

 function replyToProactive(message: ProactiveCard) {
  setInput(`Sto rispondendo a "${message.message || message.title || "GhostMe"}": `);
  onProactiveAnswered?.(message.id);
}      


  const [answeredHomeMessages, setAnsweredHomeMessages] = useState<Record<string, string>>({});

  async function answerHomeQuestion(messageId: string, response: "yes" | "no") {
    setAnsweredHomeMessages((prev) => ({
      ...prev,
      [messageId]: response,
    }));

    await fetch("/api/house-suggestion-response", {
      method: "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        proactiveMessageId: messageId,
        response,
      }),
    });

    onProactiveSeen?.(messageId);
  }        

  return (
    <section className="relative mx-auto mt-8 flex w-full max-w-4xl flex-1 flex-col justify-end">
      <div className="relative z-10 flex min-h-[42vh] flex-col justify-end gap-5 pb-5">
        {visibleProactiveMessages.length > 0 && (
          <div className="mx-auto mb-4 flex w-full max-w-3xl flex-col gap-3">
            {visibleProactiveMessages.map((message) => (
              <div
                key={message.id}
                className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-cyan-100 backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
                    {getProactiveLabel(message.category)}
                  </div>

                  {message.category !== "reminder" && (
                    <button
                      onClick={() => onProactiveSeen?.(message.id)}
                      className="rounded-lg px-2 py-1 text-cyan-300 hover:bg-cyan-400/10"
                      title="Archivia"
                    >
                      ✓
                    </button>
                  )}
                </div>

                <div className="whitespace-pre-line text-sm leading-relaxed">
                  {message.message}
                </div>

              {message.category !== "home_question" &&
                message.category !== "reminder" &&
                message.category !== "agenda" && (
              <div className="mt-4">
                <button
                  onClick={() => replyToProactive(message)}
                  className="rounded-2xl border border-cyan-400/40 px-4 py-2 text-xs font-black text-cyan-200 hover:bg-cyan-400/10"
                >
                  Rispondi
                </button>
              </div>
            )}              

                {message.category === "reminder" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => onReminderDone?.(message.id)}
                      className="rounded-2xl bg-emerald-400 px-4 py-2 text-xs font-black text-black"
                    >
                      Fatto
                    </button>
                    <button
                      onClick={() => onProactiveSeen?.(message.id)}
                      className="rounded-2xl border border-zinc-600 px-4 py-2 text-xs font-black text-zinc-200"
                    >
                      Archivia
                    </button>
                  </div>
                )}

                {message.category === "home_question" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => answerHomeQuestion(message.id, "yes")}
                      disabled={!!answeredHomeMessages[message.id]}
                      className="rounded-2xl bg-cyan-300 px-5 py-2 text-sm font-black text-black disabled:opacity-50"
                    >
                      Sì
                    </button>

                    <button
                      onClick={() => answerHomeQuestion(message.id, "no")}
                      disabled={!!answeredHomeMessages[message.id]}
                      className="rounded-2xl border border-red-400/40 px-5 py-2 text-sm font-black text-red-200 disabled:opacity-50"
                    >
                      No
                    </button>

                    {answeredHomeMessages[message.id] && (
                      <span className="self-center text-xs text-cyan-300">
                        Risposta salvata
                      </span>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {loadingChat ? (
          <>
            {lastAssistantMessage && (
              <ChatBubble
                role="assistant"
                label="GhostMe"
                content={lastAssistantMessage.content}
              />
            )}

            {lastUserMessage && (
              <ChatBubble
                role="user"
                label={userName}
                content={lastUserMessage.content}
              />
            )}
          </>
        ) : (
          <>
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
          </>
        )}

        {!lastUserMessage && !lastAssistantMessage && (
          <div className="mx-auto max-w-xl rounded-3xl border border-cyan-400/20 bg-black/45 p-5 text-center text-zinc-300 backdrop-blur-sm">
            Scrivi qualcosa. GhostMe ha già il cervello acceso.
          </div>
        )}
      </div>

      <button
        onClick={openHistory}
        className="absolute left-[-4.5rem] bottom-[1.1rem] z-20 hidden h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-black/70 text-lg text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/10 lg:flex"
        title="Cronologia chat"
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
              className="group flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-3xl text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.18)] transition-all duration-300 hover:scale-110 hover:bg-cyan-400/20"
            >
              <span className="transition-transform duration-300 group-hover:scale-110">
                🎙️
              </span>
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
            {loadingChat ? "..." : "Invia"}
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

function getProactiveLabel(category?: string | null) {
  if (category === "reminder") return "Promemoria";
  if (category === "agenda") return "Agenda di Oggi";
  if (category === "curiosity") return "Curiosità GhostMe";
  if (category === "observation") return "Osservazione GhostMe";
  if (category === "daily_briefing") return "Daily Briefing";
  if (category === "home_question") return "Domanda Casa";
  if (category === "situation_question") return "Domanda Situazione";

  return "GhostMe";
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
