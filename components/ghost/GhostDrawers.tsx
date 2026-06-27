"use client";

import { BrainData, ChatMessage, CalendarEvent } from "./types";

import { useEffect, useMemo, useState } from "react";
import { getAuthenticatedJsonHeaders } from "@/lib/ghostme/auth/clientAuthHeaders";

function proactivePriorityLabel(value: unknown) {
  const priority = Number(value || 0);
  if (priority >= 9) return "critical";
  if (priority >= 7) return "high";
  if (priority >= 4) return "normal";
  return "low";
}

function readableHomeStatus(value: unknown) {
  const status = String(value || "").toLowerCase();
  if (["enabled", "active", "approved", "useful"].includes(status)) return "utile";
  if (["disabled", "rejected", "not_useful"].includes(status)) return "non utile";
  if (["ignored", "dismissed", "archived"].includes(status)) return "ignorato";
  if (["wrong", "invalid"].includes(status)) return "sbagliato";
  return "da valutare";
}

function readableHomeTitle(item: Record<string, unknown>) {
  return String(
    item?.title ||
      item?.automation_name ||
      item?.automation_key ||
      item?.rule_key ||
      item?.pattern_type ||
      "Elemento casa"
  ).replaceAll("_", " ");
}

function proactiveReplyButtonLabel(category?: string | null) {
  if (category === "curiosity") return "Rispondi in chat";
  if (category === "daily_briefing") return "Apri in chat";
  if (
    category === "observation" ||
    category === "suggestion" ||
    category === "home_question" ||
    category === "situation_question"
  ) {
    return "Commenta in chat";
  }

  return "Rispondi in chat";
}



export function MemoryDrawer({
  open,
  onClose,
  activeTab,
  setActiveTab,
  brainData,
  currentUserId,
  refreshBrain,
}: {
  open: boolean;
  onClose: () => void;
  activeTab: "memory" | "timeline" | "goals" | "state";
  setActiveTab: (tab: "memory" | "timeline" | "goals" | "state") => void;
  brainData: BrainData;
  currentUserId: string;
  refreshBrain: (userId: string) => Promise<void>;
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
          <BrainPanelContent
            activeTab={activeTab}
            brainData={brainData}
            currentUserId={currentUserId}
            refreshBrain={refreshBrain}
          />
        </div>
      </aside>
    </div>
  );
}

export function ServicesDrawer ({
  open,
  onClose,
  activeTab,
  setActiveTab,
  userEmail,
  userProfile,
  traits,
  summary,
  ghostMessage,
  brainData,
  actions,
  calendarEvents,
  refreshBrain,
  currentUserId,
  logout,
  onReplyObservation,
  pendingLocationCard,
  onLocationCandidateHandled,
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
    | "traits"
    | "places";
  setActiveTab: (
    tab:
      | "actions"
      | "calendar"
      | "mail"
      | "web"
      | "home"
      | "profile"
      | "traits"
      | "places"
  ) => void;
  userEmail: string;
  userProfile: any;
  traits: any;
  summary: string[];
  ghostMessage: string;
  brainData: BrainData;
  actions: any[];
  calendarEvents: CalendarEvent[];
  refreshBrain: (userId: string) => Promise<void>;
  currentUserId: string;
  logout: () => void;
  onReplyObservation: (
    message: string,
    messageId?: string,
    logicalKey?: string | null,
    meta?: { title?: string | null; category?: string | null }
  ) => void;
  pendingLocationCard?: { id: string; message: string; logical_key?: string | null } | null;
  onLocationCandidateHandled?: (messageId: string) => void;
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
      | "traits"
      | "places";
    label: string;
  }[] = [
    { key: "actions", label: "Azioni" },
    { key: "calendar", label: "Calendario" },
    { key: "mail", label: "Mail" },
    { key: "web", label: "Osservazioni" },
    { key: "home", label: "Home Assistant" },
    { key: "profile", label: "Profilo" },
    { key: "places", label: "Luoghi" },
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
                {["actions", "calendar", "web", "home", "profile", "places", "traits"].includes(
                  item.key
                )
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
            calendarEvents={calendarEvents}
            traits={traits}
            summary={summary}
            ghostMessage={ghostMessage}
            brainData={brainData}
            actions={actions}
            refreshBrain={refreshBrain}
            currentUserId={currentUserId}
            onReplyObservation={onReplyObservation}
            pendingLocationCard={pendingLocationCard}
            onLocationCandidateHandled={onLocationCandidateHandled}
            
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
  brainData,
  actions,
  calendarEvents,
  refreshBrain,
  currentUserId,
  onReplyObservation,
  pendingLocationCard,
  onLocationCandidateHandled,
}: {
  activeTab:
    | "actions"
    | "calendar"
    | "mail"
    | "web"
    | "home"
    | "profile"
    | "traits"
    | "places";
  userProfile: any;
  traits: any;
  summary: string[];
  ghostMessage: string;
  brainData: BrainData;
  actions: any[];
  calendarEvents: CalendarEvent[];
  refreshBrain: (userId: string) => Promise<void>;
  currentUserId: string;
  onReplyObservation: (
    message: string,
    messageId?: string,
    logicalKey?: string | null,
    meta?: { title?: string | null; category?: string | null }
  ) => void;
  pendingLocationCard?: { id: string; message: string; logical_key?: string | null } | null;
  onLocationCandidateHandled?: (messageId: string) => void;
}) {
  const openActionStatuses = new Set(["detected", "active", "open", "pending"]);
  const today = new Date();
  const resolvedActions = brainData.actions.length ? brainData.actions : actions;
  const resolvedCalendarEvents = brainData.calendarEvents.length
    ? brainData.calendarEvents
    : calendarEvents;

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(
    resolvedCalendarEvents || []
  );
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [places, setPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [detectedPlaceId, setDetectedPlaceId] = useState<string | null>(null);
  const [currentPlace, setCurrentPlace] = useState<string | null>(null);
  const [lastKnownPlace, setLastKnownPlace] = useState<string | null>(null);
  const [locationCandidate, setLocationCandidate] = useState<any>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateCategory, setCandidateCategory] = useState("other");
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const [newType, setNewType] = useState<CalendarEvent["type"]>("note");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTime, setNewTime] = useState("00:00");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [loadingObservations, setLoadingObservations] = useState(false);
  const [homeSection, setHomeSection] = useState<
    "habits" | "rules" | "actions" | null
  >(null);
  const [expandedHomeItem, setExpandedHomeItem] = useState<string | null>(null);
  const [updatingHomeItem, setUpdatingHomeItem] = useState<string | null>(null);
  const [ignoredHomeItems, setIgnoredHomeItems] = useState<string[]>([]);
  const [homeFeedback, setHomeFeedback] = useState("");


  const [hiddenObservations, setHiddenObservations] = useState<string[]>([]);
  const [hiddenActions, setHiddenActions] = useState<string[]>([]);

  function proactiveForHomeControl(control: Record<string, unknown>) {
    if (control?.proactiveMessageId) {
      return (brainData.proactiveMessages || []).find(
        (message) => message.id === control.proactiveMessageId
      );
    }
    const key = String(control?.automation_key || "");
    return (brainData.proactiveMessages || []).find((message) => {
      const logicalKey = String(message.logical_key || "");
      return (
        logicalKey === `home_control_${key}` ||
        logicalKey.startsWith(`home_control_${key}_`)
      );
    });
  }

  async function respondToHomeControl(
    control: Record<string, unknown>,
    response: "yes" | "no"
  ) {
    const proactive = proactiveForHomeControl(control);
    const itemId = String(control.id || control.automation_key || "");
    if (!proactive?.id) {
      setHomeFeedback("Questa azione è disponibile solo in lettura: manca la proposta collegata.");
      return;
    }
    setUpdatingHomeItem(itemId);
    setHomeFeedback("");
    const res = await fetch("/api/house-suggestion-response", {
      method: "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        userId: currentUserId,
        proactiveMessageId: proactive.id,
        response,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setHomeFeedback(data.error || "Azione casa non aggiornata.");
    } else {
      setHomeFeedback(response === "yes" ? "Segnata come utile." : "Segnata come non utile.");
      await refreshBrain(currentUserId);
    }
    setUpdatingHomeItem(null);
  }

  async function ignoreHomeControl(control: Record<string, unknown>) {
    const proactive = proactiveForHomeControl(control);
    const itemId = String(control.id || control.automation_key || "");
    if (!proactive?.id) {
      setIgnoredHomeItems((items) =>
        items.includes(itemId) ? items : [...items, itemId]
      );
      setHomeFeedback("Nascosta solo in questa vista; nessuna automazione è stata modificata.");
      return;
    }
    setUpdatingHomeItem(itemId);
    const res = await fetch("/api/ghostme/proactive/read", {
      method: "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        userId: currentUserId,
        id: proactive.id,
        status: "dismissed",
      }),
    });
    if (res.ok) {
      setIgnoredHomeItems((items) =>
        items.includes(itemId) ? items : [...items, itemId]
      );
      setHomeFeedback("Proposta ignorata; nessun comando è stato inviato a Home Assistant.");
    } else {
      const data = await res.json();
      setHomeFeedback(data.error || "Impossibile ignorare la proposta.");
    }
    setUpdatingHomeItem(null);
  }


  useEffect(() => {
    setLocalEvents(resolvedCalendarEvents || []);
  }, [resolvedCalendarEvents]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const monthName = visibleMonth.toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const calendarDays = useMemo(() => {
    return [
      ...Array.from({ length: startOffset }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [startOffset, daysInMonth]);

useEffect(() => {
  if (!currentUserId) return;
  if (activeTab !== "places") return;

  async function loadPlaces() {
    setLoadingPlaces(true);

    try {
      const [placesRes, stateRes] = await Promise.all([
        fetch("/api/location/places", {
          method: "POST",
          headers: await getAuthenticatedJsonHeaders(),
          body: JSON.stringify({
            userId: currentUserId,
          }),
        }),

        fetch("/api/location/current-state", {
          method: "POST",
          headers: await getAuthenticatedJsonHeaders(),
          body: JSON.stringify({
            userId: currentUserId,
          }),
        }),
      ]);

      const placesData = await placesRes.json();
      const stateData = await stateRes.json();

      setPlaces(placesData.places || []);

      if (stateData.locationStatus === "current" && stateData.location?.current_place_id) {
        setDetectedPlaceId(stateData.location.current_place_id);
        setCurrentPlace(stateData.location.current_place_label || null);
        setLastKnownPlace(null);
      } else {
        setDetectedPlaceId(null);
        setCurrentPlace(null);
        setLastKnownPlace(
          stateData.locationStatus === "stale"
            ? stateData.lastKnownLocation?.current_place_label || null
            : null
        );
      }
    } catch (err) {
      console.log("LOAD PLACES ERROR:", err);
    }

    setLoadingPlaces(false);
  }

  loadPlaces();
}, [activeTab, currentUserId]);

useEffect(() => {
  if (!currentUserId || activeTab !== "places" || !pendingLocationCard?.id) {
    if (!pendingLocationCard) setLocationCandidate(null);
    return;
  }

  let cancelled = false;
  async function loadCandidate() {
    setCandidateError("");
    const res = await fetch("/api/location/candidate", {
      method: "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        userId: currentUserId,
        proactiveMessageId: pendingLocationCard!.id,
      }),
    });
    const data = await res.json();
    if (cancelled) return;
    if (!res.ok) {
      setCandidateError(data.error || "Candidato luogo non disponibile.");
      return;
    }
    setLocationCandidate(data.candidate);
    setCandidateCategory(data.candidate.suggestedCategory || "other");
  }
  void loadCandidate();
  return () => { cancelled = true; };
}, [activeTab, currentUserId, pendingLocationCard]);

async function markObservationHandled(
  item: any,
  status: "read" | "dismissed" | "answered" = "dismissed"
) {
  if (!currentUserId || !item?.id) return false;

  setObservations((prev) =>
    prev.filter((observation) => observation.id !== item.id)
  );
  setHiddenObservations((prev) =>
    prev.includes(item.id) ? prev : [...prev, item.id]
  );

  try {
    const res = await fetch("/api/ghostme/proactive/read", {
      method: "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        id: item.id,
        userId: currentUserId,
        status,
      }),
    });

    if (!res.ok) {
      setObservations((prev) =>
        prev.some((observation) => observation.id === item.id)
          ? prev
          : [item, ...prev]
      );
      setHiddenObservations((prev) => prev.filter((id) => id !== item.id));
      console.log("MARK OBSERVATION READ ERROR:", await res.text());
      return false;
    }

    if (currentUserId) {
      await refreshBrain(currentUserId);
    }

    return true;
  } catch (err) {
    setObservations((prev) =>
      prev.some((observation) => observation.id === item.id)
        ? prev
        : [item, ...prev]
    );
    setHiddenObservations((prev) => prev.filter((id) => id !== item.id));
    console.log("MARK OBSERVATION READ FRONT ERROR:", err);
    return false;
  }
}

useEffect(() => {
  if (!currentUserId) return;
  if (activeTab !== "web") return;

  if (brainData.proactiveMessages.length) {
    setObservations(brainData.proactiveMessages);
    setLoadingObservations(false);
    return;
  }

  async function loadObservations() {
    setLoadingObservations(true);

    try {
      const res = await fetch("/api/proactive/messages", {
        method: "POST",
        headers: await getAuthenticatedJsonHeaders(),
        body: JSON.stringify({
          userId: currentUserId,
        }),
      });

      const data = await res.json();

      setObservations(data.messages || []);
    } catch (err) {
      console.log("LOAD OBSERVATIONS ERROR:", err);
    }

    setLoadingObservations(false);
  }

  loadObservations();
}, [activeTab, currentUserId, brainData.proactiveMessages]);

async function updateActionStatus(
  item: any,
  status: "completed" | "archived" | "pending"
) {
  if (!currentUserId || !item?.id) return;

  setHiddenActions((prev) =>
    prev.includes(item.id) ? prev : [...prev, item.id]
  );

  try {
    const res = await fetch("/api/actions/update-status", {
      method: "PATCH",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        id: item.id,
        userId: currentUserId,
        status,
      }),
    });

    if (!res.ok) {
      setHiddenActions((prev) => prev.filter((id) => id !== item.id));
      console.log("UPDATE ACTION STATUS ERROR:", await res.text());
      return;
    }

    await refreshBrain(currentUserId);
  } catch (err) {
    setHiddenActions((prev) => prev.filter((id) => id !== item.id));
    console.log("UPDATE ACTION STATUS FRONT ERROR:", err);
  }
}

async function saveLocationCandidate() {
  if (!currentUserId || !pendingLocationCard?.id || !candidateName.trim()) return;
  setSavingCandidate(true);
  setCandidateError("");
  try {
    const res = await fetch("/api/location/candidate", {
      method: "PATCH",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        userId: currentUserId,
        proactiveMessageId: pendingLocationCard.id,
        label: candidateName.trim(),
        category: candidateCategory,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setCandidateError(data.error || "Salvataggio luogo non riuscito.");
      return;
    }
    setPlaces((prev) => {
      const withoutSaved = prev.filter((place) => place.id !== data.place.id);
      return [data.place, ...withoutSaved];
    });
    setLocationCandidate(null);
    setCandidateName("");
    onLocationCandidateHandled?.(pendingLocationCard.id);
    await refreshBrain(currentUserId);
  } catch (error) {
    console.log("SAVE LOCATION CANDIDATE ERROR:", error);
    setCandidateError("Salvataggio luogo non riuscito.");
  } finally {
    setSavingCandidate(false);
  }
}



  function getEventDate(event: CalendarEvent) {
    return event.start_at || event.remind_at || null;
  }

  function getRomeDateParts(value: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Rome",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(value));

    return Object.fromEntries(
      parts.map((part) => [part.type, Number(part.value)])
    );
  }

  function eventsForDay(day: number) {
    return localEvents.filter((event) => {
      if (event.status && event.status !== "active") return false;

      const dateValue = getEventDate(event);
      if (!dateValue) return false;

      const eventDate = getRomeDateParts(dateValue);

      return (
        eventDate.year === year &&
        eventDate.month === month + 1 &&
        eventDate.day === day
      );
    });
  }

  const visibleEventCount = localEvents.filter(
    (event) => !event.status || event.status === "active"
  ).length;
  const selectedEvents = eventsForDay(selectedDay);

  async function saveCalendarItem() {
    if (!newTitle.trim()) return;

    const userId =
      currentUserId ||
      userProfile?.user_id ||
      traits?.user_id ||
      localEvents[0]?.user_id;

    if (!userId) {
      alert("User ID mancante. GhostMe non sa a chi salvare l'evento.");
      return;
    }

    setSaving(true);

    const [rawHour, rawMinute] = newTime.split(":").map(Number);
    const hour = Number.isNaN(rawHour) ? 9 : rawHour;
    const minute = Number.isNaN(rawMinute) ? 0 : rawMinute;
    const eventDate = new Date(year, month, selectedDay, hour, minute);

    const endDate = new Date(eventDate);

    if (newType === "appointment") {
      endDate.setHours(endDate.getHours() + 1);
    }

    const payload = {
      id: editingEventId,
      userId,
      type: newType,
      title: newTitle.trim(),
      description: newDescription.trim(),
      startAt: eventDate.toISOString(),
      endAt: newType === "appointment" ? endDate.toISOString() : null,
      remindAt:
        newType === "reminder"
          ? eventDate.toISOString()
          : editingEventId
            ? undefined
            : null,
    };

    const res = await fetch("/api/calendar-events", {
      method: editingEventId ? "PATCH" : "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setSaving(false);

  if (data.event) {
    if (editingEventId) {
      setLocalEvents((prev) =>
        prev.map((e) =>
          e.id === editingEventId ? data.event : e
        )
      );

      setEditingEventId(null);

      setSavedMessage("✅ Evento modificato");
    } else {
      setLocalEvents((prev) => [...prev, data.event]);

      setSavedMessage("✅ Evento creato");
    }

    if (currentUserId) {
      await refreshBrain(currentUserId);
    }

    setNewTitle("");
    setNewDescription("");
    setNewTime("00:00");
    setNewType("note");

    setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  }
}

  if (activeTab === "web") {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-lg font-black text-cyan-200">
            Osservazioni GhostMe
          </p>

          <p className="mt-3 text-sm text-zinc-300">
            Qui trovi osservazioni, suggerimenti e messaggi proattivi generati da GhostMe.
          </p>
        </div>

        {loadingObservations ? (
          <EmptyBrainBox text="Caricamento osservazioni..." />
        ) : observations.length === 0 ? (
          <EmptyBrainBox text="Nessuna osservazione attiva." />
        ) : (
          <div className="space-y-3">
            {observations
                .filter((item) => !hiddenObservations.includes(item.id))
                .map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-zinc-800 bg-black/60 p-4"
              >

                <p className="text-sm font-black text-cyan-200">
                  {item.title || "Osservazione GhostMe"}
                </p>

                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {item.message}
                </p>

                <p className="mt-3 text-xs text-zinc-500">
                  {item.category || "observation"} · priorità {proactivePriorityLabel(item.priority)}
                </p>
                <div className="mt-3 flex gap-2">
                  {item.category === "reminder" ? (
                    <button
                      onClick={() => markObservationHandled(item, "answered")}
                      className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-black"
                    >
                      Fatto
                    </button>
                  ) : item.category !== "agenda" ? (
                    <button
                      onClick={() => {
                        onReplyObservation(
                          item.message || "",
                          item.id,
                          item.logical_key,
                          {
                            title: item.title,
                            category: item.category,
                          }
                        );
                      }}
                      className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/20"
                    >
                      {proactiveReplyButtonLabel(item.category)}
                    </button>
                  ) : null}
                  <button
                    onClick={() => markObservationHandled(item, "dismissed")}
                    className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-red-400 hover:text-red-300"
                  >
                    Archivia
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "home") {
    const house = brainData.house;
    const state = house?.state;
    const homeUi = brainData.homeUi;

    if (!house || !state || !homeUi) {
      return <EmptyBrainBox text="Snapshot Home Assistant non disponibile." />;
    }

    const routes = house.routes?.knownRoutes || [];
    const habits = [
      ...(house.patterns || []).map((pattern) => ({
        id: pattern.id || pattern.pattern_type,
        title: readableHomeTitle(pattern),
        description: pattern.description || pattern.place_label || null,
      })),
      ...routes.map((route) => ({
        id: `route-${route.from}-${route.to}`,
        title: `${route.from} → ${route.to}`,
        description: `Percorso ${route.source === "learned" ? "appreso" : "conosciuto"} · confidenza ${route.confidence}%`,
      })),
    ];
    const rules = house.learnedRules || [];
    const homeSuggestions = (brainData.proactiveMessages || [])
      .filter(
        (message) =>
          message.category === "home_question" &&
          !String(message.logical_key || "").startsWith("home_control_")
      )
      .map((message) => ({
        id: `suggestion-${message.id}`,
        automation_name: message.title || "Suggerimento casa",
        status: "pending",
        last_reason: message.message,
        proactiveMessageId: message.id,
      }));
    const controls = [...(house.automationControls || []), ...homeSuggestions];
    const homeSections: Array<{
      key: NonNullable<typeof homeSection>;
      label: string;
      count: number;
    }> = [
      { key: "habits", label: "Abitudini", count: habits.length },
      { key: "rules", label: "Regole", count: rules.length },
      { key: "actions", label: "Azioni casa", count: controls.length },
    ];

    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-lg font-black text-cyan-200">Stato casa</p>
          <p className="mt-2 text-base font-bold text-zinc-100">
            {homeUi.statusLabel}
          </p>
          <p className={`mt-1 text-xs ${homeUi.reliable ? "text-emerald-300" : "text-amber-300"}`}>
            {homeUi.confidenceLabel}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {homeUi.people.map((person) => (
              <div key={person.key} className="rounded-2xl border border-zinc-800 bg-black/40 p-3">
                <p className="text-sm font-bold text-zinc-100">{person.label}</p>
                <p className={`mt-1 text-xs ${person.isHome ? "text-emerald-300" : "text-zinc-500"}`}>
                  {person.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {homeUi.activeRooms.length > 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-black/60 p-4">
            <p className="text-sm font-black text-cyan-200">Stanze attive</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {homeUi.activeRooms.map((room) => (
                <span key={room} className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-100">
                  {room}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {homeSections.map(({ key, label, count }) => (
            <button
              key={String(key)}
              onClick={() => setHomeSection(homeSection === key ? null : key)}
              className={`rounded-2xl border p-3 transition ${homeSection === key ? "border-cyan-300 bg-cyan-300 text-black" : "border-zinc-800 bg-black/50 text-zinc-300"}`}
            >
              <p className="text-xl font-black">{count}</p>
              <p>{label}</p>
            </button>
          ))}
        </div>

        {homeSection === "habits" && (
          <div className="rounded-3xl border border-zinc-800 bg-black/60 p-4">
            <p className="text-sm font-black text-cyan-200">Abitudini e percorsi</p>
            <div className="mt-3 space-y-2">
              {!habits.length ? <EmptyBrainBox text="Nessuna abitudine casa disponibile." /> : habits.map((habit) => (
                <div key={habit.id} className="rounded-2xl border border-zinc-800 bg-black/50 p-3">
                  <p className="text-sm font-bold capitalize text-zinc-100">{habit.title}</p>
                  {habit.description && <p className="mt-1 text-xs text-zinc-500">{habit.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {homeSection === "rules" && (
          <div className="rounded-3xl border border-zinc-800 bg-black/60 p-4">
            <p className="text-sm font-black text-cyan-200">Regole apprese</p>
            <div className="mt-3 space-y-2">
              {!rules.length ? <EmptyBrainBox text="Nessuna regola appresa." /> : rules.map((rule) => (
                <div key={rule.id || rule.rule_key} className="rounded-2xl border border-zinc-800 bg-black/50 p-3">
                  <p className="text-sm font-bold text-zinc-100">{readableHomeTitle(rule)}</p>
                  <p className="mt-1 text-xs text-zinc-500">{rule.description || "Regola osservata da GhostMe."}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {homeSection === "actions" && (
          <div className="rounded-3xl border border-zinc-800 bg-black/60 p-4">
            <p className="text-sm font-black text-cyan-200">Azioni casa</p>
            {homeFeedback && <p className="mt-2 text-xs text-cyan-200">{homeFeedback}</p>}
            <div className="mt-3 space-y-3">
              {!controls.length ? <EmptyBrainBox text="Nessuna azione casa da valutare." /> : controls.map((control) => {
                const itemId = String(control.id || control.automation_key);
                const ignored = ignoredHomeItems.includes(itemId);
                const actionable = Boolean(proactiveForHomeControl(control)?.id);
                const expanded = expandedHomeItem === itemId;
                return (
                  <div key={itemId} className="rounded-2xl border border-zinc-800 bg-black/50 p-3">
                    <p className="text-sm font-bold text-zinc-100">{readableHomeTitle(control)}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {ignored ? "ignorato" : readableHomeStatus(control.status)}
                      {control.room_key ? ` · ${String(control.room_key).replaceAll("_", " ")}` : ""}
                    </p>
                    {expanded && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                        {String(control.last_reason || "Nessun dettaglio aggiuntivo.").split(" | confidenza")[0]}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button disabled={!actionable || updatingHomeItem === itemId} onClick={() => respondToHomeControl(control, "yes")} className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-bold text-black disabled:opacity-40">Utile</button>
                      <button disabled={!actionable || updatingHomeItem === itemId} onClick={() => respondToHomeControl(control, "no")} className="rounded-xl border border-red-400/40 px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-40">Non utile</button>
                      <button disabled={updatingHomeItem === itemId} onClick={() => ignoreHomeControl(control)} className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 disabled:opacity-40">Ignora</button>
                      <button onClick={() => setExpandedHomeItem(expanded ? null : itemId)} className="rounded-xl border border-cyan-400/30 px-3 py-2 text-xs font-bold text-cyan-200">Dettagli</button>
                    </div>
                    {!actionable && <p className="mt-2 text-[11px] text-zinc-600">Valutazione read-only: nessuna proposta backend collegata.</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

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
            ["Località", userProfile?.location],
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

  if (activeTab === "places") {

  async function saveCurrentPlace() {
    if (!currentUserId) {
      alert("User ID mancante.");
      return;
    }

    if (!navigator.geolocation) {
      alert("GPS non disponibile su questo dispositivo.");
      return;
    }



    const label = prompt("Nome luogo? Es: Casa, Lavoro, Palestra");
    if (!label?.trim()) return;

    const category =
      prompt("Categoria? home, work, gym, shop, bar, travel", "unknown") ||
      "unknown";

    const radiusInput = prompt("Raggio in metri?", "30");
    const radiusMeters = Number(radiusInput || 30);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const res = await fetch("/api/location/save-place", {
          method: "POST",
          headers: await getAuthenticatedJsonHeaders(),
          body: JSON.stringify({
            userId: currentUserId,
            label: label.trim(),
            category,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radiusMeters,
          }),
        });

        const data = await res.json();

        if (data.success) {
          alert("📍 Luogo salvato.");
        } else {
          alert("Errore salvataggio luogo.");
        }
      },
      () => {
        alert("Permesso GPS negato o posizione non disponibile.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <p className="text-lg font-black text-cyan-200">
          Luoghi significativi
        </p>

        <p className="mt-3 text-sm text-zinc-300">
          Salva posti come Casa, Lavoro o Palestra. GhostMe potrà usarli per
          capire dove sei.
        </p>

        {pendingLocationCard && (
          <div className="mt-4 rounded-2xl border border-cyan-300/40 bg-cyan-300/10 p-4">
            <p className="text-sm font-black text-cyan-200">Completa il luogo rilevato</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {locationCandidate?.message || pendingLocationCard.message}
            </p>

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Nome luogo
            </label>
            <input
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
              placeholder="Es. Palestra sotto casa"
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
            />

            <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Categoria
            </label>
            <select
              value={candidateCategory}
              onChange={(event) => setCandidateCategory(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
            >
              <option value="home">Casa</option>
              <option value="work">Lavoro</option>
              <option value="supermarket">Supermercato</option>
              <option value="fuel">Benzinaio</option>
              <option value="bar">Bar</option>
              <option value="restaurant">Ristorante</option>
              <option value="gym">Palestra</option>
              <option value="shop">Negozio</option>
              <option value="park">Parco</option>
              <option value="friend_relative">Amico/parente</option>
              <option value="other">Altro</option>
            </select>

            {candidateError && (
              <p className="mt-3 text-xs text-red-300">{candidateError}</p>
            )}

            <button
              onClick={saveLocationCandidate}
              disabled={savingCandidate || candidateName.trim().length < 2}
              className="mt-4 w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-black disabled:opacity-40"
            >
              {savingCandidate ? "Salvataggio..." : "Salva luogo"}
            </button>
          </div>
        )}

        <button
          onClick={saveCurrentPlace}
          className="mt-4 w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-black"
        >
          📍 Salva luogo attuale
        </button>

        <button
          onClick={async () => {
            if (!currentUserId) return;

            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const res = await fetch("/api/location/update-current", {
                  method: "POST",
                  headers: await getAuthenticatedJsonHeaders(),
                  body: JSON.stringify({
                    userId: currentUserId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    confidence: position.coords.accuracy <= 50 ? 80 : 60,
                    source: "browser_gps",
                  }),
                });

                const data = await res.json();

                if (data.place) {
                  setDetectedPlaceId(data.place.id);
                  setCurrentPlace(data.place.label);
                  setLastKnownPlace(null);

                  alert(`📍 Sei in: ${data.place.label}`);
                } else {
                  setDetectedPlaceId(null);
                  setCurrentPlace(null);

                  alert("📍 Non sei in nessun luogo salvato.");
                }
              },
              () => {
                alert("GPS non disponibile.");
              }
            );
          }}
          className="mt-2 w-full rounded-2xl border border-cyan-400/30 px-4 py-3 text-sm font-bold text-cyan-300"
        >
          Dove sono?
        </button>  

        {currentPlace && (
          <div className="mt-3 rounded-2xl border border-yellow-300 bg-yellow-400/10 p-3">
            <p className="text-sm font-bold text-yellow-200">
              📍 Luogo attuale: {currentPlace}
            </p>
          </div>
        )}       

        {!currentPlace && lastKnownPlace && (
          <div className="mt-3 rounded-2xl border border-zinc-600 bg-zinc-800/30 p-3">
            <p className="text-sm font-bold text-zinc-300">
              Ultimo luogo noto: {lastKnownPlace}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Il dato non è abbastanza recente per indicare una presenza attuale.
            </p>
          </div>
        )}

        {!currentPlace && !lastKnownPlace && (
          <p className="mt-3 text-sm text-zinc-500">Posizione corrente sconosciuta.</p>
        )}


        <div className="mt-4 space-y-2">
          {loadingPlaces ? (
            <p className="text-sm text-zinc-400">
              Caricamento luoghi...
            </p>
          ) : places.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nessun luogo salvato.
            </p>
          ) : (
            places.map((place) => (
              <div
                key={place.id}
                  className={`rounded-2xl border p-3 ${
                    detectedPlaceId === place.id
                      ? "border-yellow-300 bg-yellow-400/10"
                      : "border-zinc-800 bg-black/50"
                  }`}
              >
                <p className="font-bold text-cyan-200">
                  {place.label}
                </p>

                <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                  {place.category}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Raggio: {place.radius_meters} m
                </p>
                <button
                  onClick={async () => {
                    if (!confirm(`Eliminare ${place.label}?`)) return;

                    await fetch("/api/location/delete-place", {
                      method: "DELETE",
                      headers: await getAuthenticatedJsonHeaders(),
                      body: JSON.stringify({
                        id: place.id,
                      }),
                    });

                    setPlaces((prev) =>
                      prev.filter((p) => p.id !== place.id)
                    );
                  }}
                  className="mt-3 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300"
                >
                  Elimina
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

  if (activeTab === "calendar") {

      const upcomingReminders = localEvents.filter((event) => {
        if (event.status && event.status !== "active") return false;
        if (!event.remind_at) return false;

        const remindDate = new Date(event.remind_at);

        const diffMinutes =
          (remindDate.getTime() - Date.now()) / 60000;

        return diffMinutes >= 0 && diffMinutes <= 60;
      });

    return (
      <div className="space-y-4">

        {upcomingReminders.length > 0 && (
          <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-4">
            <p className="font-black text-yellow-300">
              🔔 Promemoria imminenti
            </p>

            <div className="mt-3 space-y-2">
              {upcomingReminders.map((event) => (
                <div key={event.id}>
                  <p className="text-sm font-bold text-white">
                    {event.title}
                  </p>

                  <p className="text-xs text-yellow-300">
                    {new Date(event.remind_at!).toLocaleTimeString(
                      "it-IT",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              const previous = new Date(year, month - 1, 1);
              setVisibleMonth(previous);
              setSelectedDay(1);
            }}
            className="rounded-2xl border border-zinc-800 px-3 py-2 text-sm font-black text-cyan-200"
          >
            ←
          </button>

          <p className="text-lg font-black capitalize text-cyan-200">
            {monthName}
          </p>

          <button
            onClick={() => {
              const next = new Date(year, month + 1, 1);
              setVisibleMonth(next);
              setSelectedDay(1);
            }}
            className="rounded-2xl border border-zinc-800 px-3 py-2 text-sm font-black text-cyan-200"
          >
            →
          </button>
        </div>
          <p className="mt-2 text-sm text-zinc-400">
            Eventi salvati: {visibleEventCount}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500">
          {["L", "M", "M", "G", "V", "S", "D"].map((d, i) => (
            <div key={`${d}-${i}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayEvents = day ? eventsForDay(day) : [];
            const selected = day === selectedDay;

            const isToday =
              day &&
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day;

            return (
              <button
                key={index}
                disabled={!day}
                onClick={() => day && setSelectedDay(day)}
                className={`min-h-14 rounded-2xl border p-2 text-left text-sm ${
                  !day
                    ? "border-transparent"
                    : selected
                      ? "border-cyan-300 bg-cyan-300 text-black"
                      : isToday
                        ? "border-yellow-400 bg-yellow-400/10 text-yellow-200"
                        : "border-zinc-800 bg-black/50 text-zinc-200"
                }`}
              >
                {day && (
                  <>
                    <p className="font-bold">{day}</p>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-yellow-300" />

                        <span className="text-[10px] font-black text-cyan-300">
                          {dayEvents.length}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-black/60 p-4">
          <p className="font-black text-cyan-200">
            {new Date(year, month, selectedDay).toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {selectedEvents.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              Nessun evento in questo giorno.
            </p>
          ) : (
        <div className="mt-3 space-y-2">
          {selectedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
            >
              <p className="text-sm font-bold text-cyan-200">
                {event.title}
              </p>

              <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                {event.type}
              </p>

              {event.start_at && (
                <p className="mt-1 text-sm text-yellow-300">
                  Appuntamento:{" "}
                  {new Date(event.start_at).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Rome",
                  })}
                </p>
              )}

              {event.remind_at && (
                <p className="mt-1 text-xs text-cyan-300">
                  Promemoria:{" "}
                  {new Date(event.remind_at).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Rome",
                  })}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditingEventId(event.id);

                    setNewType(event.type);

                    setNewTitle(event.title || "");
                    setNewDescription(event.description || "");

                    const sourceDate =
                      event.start_at || event.remind_at;

                    if (sourceDate) {
                      setNewTime(
                        new Date(sourceDate)
                          .toLocaleTimeString("it-IT", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "Europe/Rome",
                          })
                      );
                    }
                  }}
                  className="rounded-xl border border-cyan-400/30 px-3 py-2 text-xs font-bold text-cyan-300"
                >
                  Modifica
                </button>

                <button
                  onClick={async () => {
                    if (!confirm("Eliminare questo evento?")) return;

                    const userId =
                      currentUserId ||
                      userProfile?.user_id ||
                      traits?.user_id ||
                      localEvents[0]?.user_id;

                    await fetch("/api/calendar-events", {
                      method: "DELETE",
                      headers: await getAuthenticatedJsonHeaders(),
                      body: JSON.stringify({
                        id: event.id,
                        userId,
                      }),
                    });

                    setLocalEvents((prev) =>
                      prev.filter((e) => e.id !== event.id)
                    );

                    if (currentUserId) {
                      await refreshBrain(currentUserId);
                    }

                  }}
                  className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300"
                >
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>

          )}
        </div>

        <div className="rounded-3xl border border-cyan-400/20 bg-black/60 p-4">
          <p className="text-sm font-black text-cyan-200">
            Aggiungi al giorno {selectedDay}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setNewType("note")}
              className={`rounded-2xl border px-3 py-2 text-sm font-bold ${
                newType === "note"
                  ? "border-cyan-300 bg-cyan-300 text-black"
                  : "border-zinc-800 text-zinc-300"
              }`}
            >
              Nota
            </button>

            <button
              onClick={() => setNewType("appointment")}
              className={`rounded-2xl border px-3 py-2 text-sm font-bold ${
                newType === "appointment"
                  ? "border-cyan-300 bg-cyan-300 text-black"
                  : "border-zinc-800 text-zinc-300"
              }`}
            >
              Appuntamento
            </button>
          </div>

          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titolo"
            className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none"
          />

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Descrizione"
            className="mt-3 h-24 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none"
          />

          <input
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            type="time"
            className="mt-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none"
          />

          <button
            onClick={saveCalendarItem}
            disabled={saving}
            className="mt-3 w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black text-black disabled:opacity-50"
          >
            {saving ? "Salvataggio..." : "Salva nel calendario"}
          </button>

          {savedMessage && (
            <p className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-300">
              {savedMessage}
            </p>
          )}

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
        const visibleActions = resolvedActions.filter(
          (item) =>
            openActionStatuses.has(String(item.status || "").toLowerCase()) &&
            !hiddenActions.includes(item.id)
        );

        if (!visibleActions.length) {
          return <EmptyBrainBox text="Nessuna azione futura visibile." />;
        }

        return (
          <div className="space-y-3">
            {visibleActions.map((item) => (
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
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => updateActionStatus(item, "completed")}
                className="rounded-xl border border-emerald-400/40 px-3 py-2 text-xs font-bold text-emerald-300"
              >
                Completa
              </button>
              <button
                onClick={() => updateActionStatus(item, "archived")}
                className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-red-400 hover:text-red-300"
              >
                Archivia
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <EmptyBrainBox text="Servizio predisposto. Lo colleghiamo quando il cervello è stabile." />
  );
}

export function HistoryDrawer({
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
            <HistoryBubble
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
  currentUserId,
  refreshBrain,
}: {
  activeTab: "memory" | "timeline" | "goals" | "state";
  brainData: BrainData;
  currentUserId: string;
  refreshBrain: (userId: string) => Promise<void>;
}) {
  const [hiddenCards, setHiddenCards] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = JSON.parse(
        localStorage.getItem("ghost_hidden_cards") || "[]"
      );

      return Array.isArray(stored)
        ? stored.filter((key) => !String(key).startsWith("goals-"))
        : [];
    } catch {
      return [];
    }
  });
  const [updatingGoalIds, setUpdatingGoalIds] = useState<string[]>([]);

const [memorySearch, setMemorySearch] = useState("");
const [memorySearchResults, setMemorySearchResults] = useState<any | null>(null);
const [searchingMemory, setSearchingMemory] = useState(false);

async function searchMemory() {
  if (!currentUserId) return;

  if (!memorySearch.trim()) {
    setMemorySearchResults(null);
    return;
  }

  setSearchingMemory(true);

  try {
    const res = await fetch("/api/memory/search", {
      method: "POST",
      headers: await getAuthenticatedJsonHeaders(),
      body: JSON.stringify({
        userId: currentUserId,
        query: memorySearch.trim(),
      }),
    });

    const data = await res.json();
    setMemorySearchResults(data.results || null);
  } catch (err) {
    console.log("MEMORY SEARCH FRONT ERROR:", err);
  }

  setSearchingMemory(false);
}

  async function updateGoalStatus(
    goalId: string,
    status: "completed" | "archived"
  ) {
    if (!currentUserId || !goalId) return;

    setUpdatingGoalIds((prev) =>
      prev.includes(goalId) ? prev : [...prev, goalId]
    );

    try {
      const res = await fetch("/api/goals/update-status", {
        method: "POST",
        headers: await getAuthenticatedJsonHeaders(),
        body: JSON.stringify({
          goalId,
          userId: currentUserId,
          status,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        console.log("GOAL STATUS UPDATE ERROR:", data.error);
        return;
      }

      await refreshBrain(currentUserId);
    } catch (err) {
      console.log("GOAL STATUS FRONT ERROR:", err);
    } finally {
      setUpdatingGoalIds((prev) => prev.filter((id) => id !== goalId));
    }
  }
  useEffect(() => {
    const persistentCards = hiddenCards.filter(
      (key) => !String(key).startsWith("goals-")
    );
    localStorage.setItem("ghost_hidden_cards", JSON.stringify(persistentCards));
  }, [hiddenCards]);

  if (activeTab === "state") {
    const s = brainData.mentalState;
    const decision = brainData.decisionSnapshot;

    if (!s && !decision) {
      return <EmptyBrainBox text="Nessuno stato mentale salvato." />;
    }

    return (
      <div className="space-y-3">
        {s && (
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
        )}

        {decision && (
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-sm font-black text-cyan-200">Decision snapshot</p>
            <p className="mt-2 text-sm text-zinc-300">
              Focus: {decision.suggestedFocus.replaceAll("_", " ")}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Prossima azione: {decision.nextBestAction.replaceAll("_", " ")}
            </p>
          </div>
        )}
      </div>
    );
  }

  const visibleGoals = (brainData.goals || []).filter(
    (goal) =>
      !["completed", "archived", "cancelled"].includes(
        String(goal.status || "").toLowerCase()
      )
  );

  const list =
    activeTab === "memory"
      ? brainData.memories
      : activeTab === "timeline"
        ? brainData.timeline
        : visibleGoals;

  const visibleList = list.filter((item) =>
    activeTab === "goals"
      ? !updatingGoalIds.includes(item.id)
      : !hiddenCards.includes(`${activeTab}-${item.id}`)
  );

return (
  <div className="space-y-3">
    {activeTab === "memory" && (
      <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
        <p className="text-sm font-black text-cyan-200">
          Cerca nella memoria
        </p>

        <div className="mt-3 flex gap-2">
          <input
            value={memorySearch}
            onChange={(e) => setMemorySearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchMemory();
            }}
            placeholder="NOMI, LUOGHI, PROGETTI..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white outline-none"
          />

          <button
            onClick={searchMemory}
            disabled={searchingMemory}
            className="rounded-2xl bg-cyan-300 px-4 text-sm font-black text-black disabled:opacity-50"
          >
            {searchingMemory ? "..." : "Cerca"}
          </button>
        </div>

        {memorySearchResults && (
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {Object.entries(memorySearchResults).map(([section, items]: any) =>
              items?.length ? (
                <div
                  key={section}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3"
                >
                  <p className="font-black text-cyan-200">{section}</p>

                  <div className="mt-2 space-y-2">
                    {items.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="text-xs text-zinc-400">
                        <p className="font-bold text-zinc-200">
                          {item.topic ||
                            item.title ||
                            item.source_topic ||
                            "Elemento"}
                        </p>

                        <p>
                          {item.description ||
                            item.content ||
                            item.summary ||
                            item.target_topic ||
                            item.source_message ||
                            "Nessun dettaglio"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    )}

    {activeTab === "memory" && (
      <div className="rounded-3xl border border-zinc-800 bg-black/50 p-4 text-xs text-zinc-400">
        <p className="text-sm font-black text-cyan-200">Contesto Brain</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <span>
            Relazioni: {brainData.people?.relationshipMemory.relationships.length || 0}
          </span>
          <span>
            Social: {brainData.people?.socialSuggestions.relationshipAttention.length || 0}
          </span>
          <span>
            Curiosity: {brainData.curiosity?.curiosities.length || 0}
          </span>
          <span>
            True proactive: {brainData.trueProactive?.selected.length || 0}
          </span>
          <span>
            Incoerenze: {brainData.projects?.consistency.consistencyIssues.length || 0}
          </span>
          <span>
            Focus progetto: {brainData.projects?.advisor.currentFocus?.project || "nessuno"}
          </span>
        </div>
      </div>
    )}

    {!visibleList.length ? (
      <EmptyBrainBox text="Nessun dato visibile." />
    ) : (
      visibleList.map((item: any) => (
        <div
          key={item.id}
          className="rounded-3xl border border-zinc-800 bg-black/60 p-4"
        >
          {activeTab !== "goals" && (
            <div className="flex justify-end">
              <button
                onClick={() =>
                  setHiddenCards((prev) => [
                    ...prev,
                    `${activeTab}-${item.id}`,
                  ])
                }
                className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-500 hover:border-red-400 hover:text-red-300"
                title="Nascondi dal pannello"
              >
                ✕
              </button>
            </div>
          )}

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
            {activeTab === "goals" && item.needs_review && (
              <span className="text-yellow-300">da rivedere</span>
            )}
            {item.importance && <span>importanza {item.importance}</span>}
            {item.emotional_tone && <span>{item.emotional_tone}</span>}
          </div>

          {activeTab === "goals" && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => updateGoalStatus(item.id, "completed")}
                className="rounded-2xl bg-emerald-400 px-3 py-2 text-xs font-black text-black"
              >
                Completa
              </button>

              <button
                onClick={() => updateGoalStatus(item.id, "archived")}
                className="rounded-2xl border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-300"
              >
                Archivia
              </button>
            </div>
          )}          
        </div>
      ))
    )}
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

function HistoryBubble({
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
