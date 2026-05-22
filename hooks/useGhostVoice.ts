"use client";

import { useRef, useState } from "react";
import { GhostMode, VoiceState } from "@/components/ghost/types";

export function useGhostVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [micEnabled, setMicEnabled] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const autoMicOffRef = useRef<any>(null);
  const speakingRef = useRef(false);
  const modeRef = useRef<GhostMode>("chat-chat");

function speak(text: string, mode: GhostMode, startVoiceInput?: () => void) {
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

    if (mode === "voce-voce" && startVoiceInput) {
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

  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 150);
}

function startVoiceInput({
  mode,
  traits,
  setInput,
  sendVoiceMessage,
}: {
  mode: GhostMode;
  traits: any;
  setInput: (value: string) => void;
  sendVoiceMessage: (text: string) => Promise<void>;
}) {
  modeRef.current = mode;

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

  if (!traits) return;

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
    setVoiceState((current) =>
      current === "listening" ? "idle" : current
    );
  };

  recognition.start();
}

  return {
    speak,
    startVoiceInput,
    voiceState,
    setVoiceState,
    micEnabled,
    setMicEnabled,
    recognitionRef,
    silenceTimeoutRef,
    autoMicOffRef,
    speakingRef,
    modeRef,
  };
}