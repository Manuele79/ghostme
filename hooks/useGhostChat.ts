"use client";

import { useState } from "react";
import { ChatMessage } from "@/components/ghost/types";

export function useGhostChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);

  return {
    input,
    setInput,
    messages,
    setMessages,
    loadingChat,
    setLoadingChat,
  };
}