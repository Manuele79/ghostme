"use client";

import { useState } from "react";
import { BrainData } from "../components/ghost/types";
import {
  buildGhostMeMessage,
  buildPersonalitySummary,
} from "../lib/personality";
import { getAuthenticatedJsonHeaders } from "../lib/ghostme/auth/clientAuthHeaders";
import { adaptBrainApiResponse } from "../lib/ghostme/ui/brainUiAdapter";

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
    snapshot: null,
    memories: [],
    timeline: [],
    goals: [],
    mentalState: null,
    actions: [],
     calendarEvents: [],
     proactiveMessage: null,
     proactiveMessages: [],
     people: null,
     projects: null,
     curiosity: null,
     trueProactive: null,
     house: null,
     homeUi: null,
     decisionSnapshot: null,
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
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Brain API HTTP ${res.status}`);
    }

    setBrainData((previous) =>
      adaptBrainApiResponse(data, previous.actions)
    );

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
