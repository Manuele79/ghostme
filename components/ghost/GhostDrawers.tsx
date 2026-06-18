"use client";

import { BrainData, ChatMessage, CalendarEvent } from "./types";

import { useEffect, useMemo, useState } from "react";



export function MemoryDrawer({
  open,
  onClose,
  activeTab,
  setActiveTab,
  brainData,
  currentUserId,
}: {
  open: boolean;
  onClose: () => void;
  activeTab: "memory" | "timeline" | "goals" | "state";
  setActiveTab: (tab: "memory" | "timeline" | "goals" | "state") => void;
  brainData: BrainData;
  currentUserId: string;
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
  actions,
  calendarEvents,
  refreshBrain,
  currentUserId,
  logout,
  onReplyObservation,
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
  actions: any[];
  calendarEvents: CalendarEvent[];
  refreshBrain: (userId: string) => Promise<void>;
  currentUserId: string;
  logout: () => void;
  onReplyObservation: (message: string, messageId?: string) => void;
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
                {["actions", "calendar", "web", "profile", "places", "traits"].includes(
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
            actions={actions}
            refreshBrain={refreshBrain}
            currentUserId={currentUserId}
            onReplyObservation={onReplyObservation}
            
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
  actions,
  calendarEvents,
  refreshBrain,
  currentUserId,
  onReplyObservation,
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
  actions: any[];
  calendarEvents: CalendarEvent[];
  refreshBrain: (userId: string) => Promise<void>;
  currentUserId: string;
  onReplyObservation: (message: string, messageId?: string) => void;
}) {
  const today = new Date();

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(calendarEvents || []);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [places, setPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [detectedPlaceId, setDetectedPlaceId] = useState<string | null>(null);
  const [currentPlace, setCurrentPlace] = useState<string | null>(null);
  const [newType, setNewType] = useState<"note" | "appointment">("note");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTime, setNewTime] = useState("00:00");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [loadingObservations, setLoadingObservations] = useState(false);


  const [hiddenObservations, setHiddenObservations] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("ghost_hidden_observations") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "ghost_hidden_observations",
      JSON.stringify(hiddenObservations)
    );
  }, [hiddenObservations]);

  const [hiddenActions, setHiddenActions] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("ghost_hidden_actions") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("ghost_hidden_actions", JSON.stringify(hiddenActions));
  }, [hiddenActions]);


  useEffect(() => {
    setLocalEvents(calendarEvents || []);
  }, [calendarEvents]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const monthName = today.toLocaleDateString("it-IT", {
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUserId,
          }),
        }),

        fetch("/api/location/current-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUserId,
          }),
        }),
      ]);

      const placesData = await placesRes.json();
      const stateData = await stateRes.json();

      setPlaces(placesData.places || []);

      if (stateData.location?.current_place_id) {
        setDetectedPlaceId(stateData.location.current_place_id);
        setCurrentPlace(stateData.location.current_place_label || null);
      } else {
        setDetectedPlaceId(null);
        setCurrentPlace(null);
      }
    } catch (err) {
      console.log("LOAD PLACES ERROR:", err);
    }

    setLoadingPlaces(false);
  }

  loadPlaces();
}, [activeTab, currentUserId]);

async function markObservationHandled(
  item: any,
  status: "read" | "answered" = "read"
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item.id,
        userId: currentUserId,
        status,
      }),
    });

    if (!res.ok) {
      console.log("MARK OBSERVATION READ ERROR:", await res.text());
      return false;
    }

    if (currentUserId) {
      await refreshBrain(currentUserId);
    }

    return true;
  } catch (err) {
    console.log("MARK OBSERVATION READ FRONT ERROR:", err);
    return false;
  }
}

useEffect(() => {
  if (!currentUserId) return;
  if (activeTab !== "web") return;

  async function loadObservations() {
    setLoadingObservations(true);

    try {
      const res = await fetch("/api/proactive/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
}, [activeTab, currentUserId]);



  function getEventDate(event: CalendarEvent) {
    return event.remind_at || event.start_at || null;
  }

  function eventsForDay(day: number) {
    return localEvents.filter((event) => {
      if (event.status && event.status !== "active") return false;

      const dateValue = getEventDate(event);
      if (!dateValue) return false;

      const d = new Date(dateValue);

      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });
  }

  const selectedEvents = eventsForDay(selectedDay);

  async function saveCalendarItem() {
    if (!newTitle.trim()) return;

    const userId =
      userProfile?.user_id ||
      traits?.user_id ||
      localEvents[0]?.user_id;

    if (!userId) {
      alert("User ID mancante. GhostMe non sa a chi salvare l'evento.");
      return;
    }

    setSaving(true);

    const [hour, minute] = newTime.split(":").map(Number);
    const eventDate = new Date(year, month, selectedDay, hour || 9, minute || 0);

    const remindDate = new Date(eventDate);

    if (newType === "appointment") {
      remindDate.setHours(remindDate.getHours() - 1);
    }

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
      endAt: newType === "appointment" ? endDate.toISOString() : eventDate.toISOString(),
      remindAt:
        newType === "appointment"
          ? remindDate.toISOString()
          : eventDate.toISOString(),
    };

    const res = await fetch("/api/calendar-events", {
      method: editingEventId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

              <div className="flex justify-end">
                <button
                  onClick={() => markObservationHandled(item, "read")}
                  className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-500 hover:border-red-400 hover:text-red-300"
                  title="Nascondi dal pannello"
                >
                  ✕
                </button>
              </div>

                <p className="text-sm font-black text-cyan-200">
                  {item.title || "Osservazione GhostMe"}
                </p>

                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {item.message}
                </p>

                <p className="mt-3 text-xs text-zinc-500">
                  {item.category || "observation"} · priorità {item.priority || 1}
                </p>
                <button
                  onClick={() => {
                    onReplyObservation(item.message || "", item.id);
                  }}
                  className="mt-3 rounded-xl border border-cyan-400/30 px-3 py-2 text-xs font-bold text-cyan-300"
                >
                  Rispondi
                </button>
              </div>
            ))}
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
          headers: {
            "Content-Type": "application/json",
          },
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
                const res = await fetch("/api/location/current-place", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: currentUserId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  }),
                });

                const data = await res.json();

                if (data.place) {
                  setDetectedPlaceId(data.place.id);
                  setCurrentPlace(data.place.label);

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
                      headers: {
                        "Content-Type": "application/json",
                      },
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
            Eventi salvati: {localEvents.length}
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
                  })}
                </p>
              )}

              {event.remind_at && (
                <p className="mt-1 text-xs text-cyan-300">
                  Promemoria:{" "}
                  {new Date(event.remind_at).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditingEventId(event.id);

                    setNewType(
                      event.type === "appointment"
                        ? "appointment"
                        : "note"
                    );

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
                      userProfile?.user_id ||
                      traits?.user_id ||
                      localEvents[0]?.user_id;

                    await fetch("/api/calendar-events", {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                      },
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
        const visibleActions = actions.filter(
          (item) => !hiddenActions.includes(item.id)
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

          <div className="flex justify-end">
            <button
              onClick={() =>
                setHiddenActions((prev) =>
                  prev.includes(item.id) ? prev : [...prev, item.id]
                )
              }
              className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-500 hover:border-red-400 hover:text-red-300"
              title="Nascondi dal pannello"
            >
              ✕
            </button>
          </div>

            <p className="text-sm font-black text-cyan-200">
              {item.title || item.intent_type}
            </p>
            <p className="mt-2 text-sm text-zinc-300">
              {item.description || "Nessuna descrizione"}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              {item.intent_type} · priorità {item.priority}
            </p>
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
}: {
  activeTab: "memory" | "timeline" | "goals" | "state";
  brainData: BrainData;
  currentUserId: string;
}) {
  const [hiddenCards, setHiddenCards] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(localStorage.getItem("ghost_hidden_cards") || "[]");
    } catch {
      return [];
    }
  });

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
      headers: {
        "Content-Type": "application/json",
      },
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

    try {
      const res = await fetch("/api/goals/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      setHiddenCards((prev) => [...prev, `goals-${goalId}`]);
    } catch (err) {
      console.log("GOAL STATUS FRONT ERROR:", err);
    }
  }
  useEffect(() => {
    localStorage.setItem("ghost_hidden_cards", JSON.stringify(hiddenCards));
  }, [hiddenCards]);

  if (activeTab === "state") {
    const s = brainData.mentalState;

    if (!s) return <EmptyBrainBox text="Nessuno stato mentale salvato." />;

    return (
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
    );
  }

  const list =
    activeTab === "memory"
      ? brainData.memories
      : activeTab === "timeline"
        ? brainData.timeline
        : brainData.goals;

  const visibleList = list.filter(
    (item) => !hiddenCards.includes(`${activeTab}-${item.id}`)
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

    {!visibleList.length ? (
      <EmptyBrainBox text="Nessun dato visibile." />
    ) : (
      visibleList.map((item: any) => (
        <div
          key={item.id}
          className="rounded-3xl border border-zinc-800 bg-black/60 p-4"
        >
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
