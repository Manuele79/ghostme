"use client";

import { useState } from "react";
import { BrainData } from "../components/ghost/types";
import {
  buildGhostMeMessage,
  buildPersonalitySummary,
} from "../lib/personality";

type LoadBrainArgs = {
  userId: string;
  setUserProfile: (value: any) => void;
  setUserName: (value: string) => void;
  setTraits: (value: any) => void;
  setGhostMessage: (value: string) => void;
  setSummary: (value: string[]) => void;
};

export function useGhostBrain() {
  const [brainData, setBrainData] = useState<BrainData>({
    memories: [],
    timeline: [],
    goals: [],
    mentalState: null,
    actions: [],
     calendarEvents: [],
     proactiveMessage: null,
  });

  async function loadBrainData(args: LoadBrainArgs) {
    const {
      userId,
      setUserProfile,
      setUserName,
      setTraits,
      setGhostMessage,
      setSummary,
    } = args;

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
      calendarEvents: data.calendarEvents || [],
      proactiveMessage: data.proactiveMessage || null,
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

    return data;

  }

  return {
    brainData,
    setBrainData,
    loadBrainData,
  };
}