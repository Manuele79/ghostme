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
  window.speechSynthesis.speak(utterance);
}

  return {
    speak,
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