"use client";

import { BrainData, ChatMessage, CalendarEvent } from "./types";

import { useEffect, useMemo, useState } from "react";



export function MemoryDrawer({
  open,
  onClose,
  activeTab,
  setActiveTab,
  brainData,
}: {
  open: boolean;
  onClose: () => void;
  activeTab: "memory" | "timeline" | "goals" | "state";
  setActiveTab: (tab: "memory" | "timeline" | "goals" | "state") => void;
  brainData: BrainData;
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
          <BrainPanelContent activeTab={activeTab} brainData={brainData} />
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
  logout,
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
    | "traits";
  setActiveTab: (
    tab:
      | "actions"
      | "calendar"
      | "mail"
      | "web"
      | "home"
      | "profile"
      | "traits"
  ) => void;
  userEmail: string;
  userProfile: any;
  traits: any;
  summary: string[];
  ghostMessage: string;
  actions: any[];
  calendarEvents: CalendarEvent[];
  logout: () => void;
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
      | "traits";
    label: string;
  }[] = [
    { key: "actions", label: "Azioni" },
    { key: "calendar", label: "Calendario" },
    { key: "mail", label: "Mail" },
    { key: "web", label: "Web" },
    { key: "home", label: "Home Assistant" },
    { key: "profile", label: "Profilo" },
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
                {["actions", "calendar", "web", "profile", "traits"].includes(item.key)
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
}: {
  activeTab:
    | "actions"
    | "calendar"
    | "mail"
    | "web"
    | "home"
    | "profile"
    | "traits";
  userProfile: any;
  traits: any;
  summary: string[];
  ghostMessage: string;
  actions: any[];
  calendarEvents: CalendarEvent[];
}) {
  const today = new Date();

  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(calendarEvents || []);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [newType, setNewType] = useState<"note" | "appointment">("note");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalEvents(calendarEvents || []);
  }, [calendarEvents]);

  const year = today.getFullYear();
  const month = today.getMonth();

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

  function getEventDate(event: CalendarEvent) {
    return event.remind_at || event.start_at || null;
  }

  function eventsForDay(day: number) {
    return localEvents.filter((event) => {
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

    const payload = {
      userId,
      type: newType,
      title: newTitle.trim(),
      description: newDescription.trim(),
      startAt: eventDate.toISOString(),
      remindAt: newType === "appointment" ? eventDate.toISOString() : null,
    };

    const res = await fetch("/api/calendar-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setSaving(false);

    if (data.event) {
      setLocalEvents((prev) => [...prev, data.event]);
      setNewTitle("");
      setNewDescription("");
      setNewTime("09:00");
    }
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

  if (activeTab === "calendar") {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-lg font-black capitalize text-cyan-200">
            {monthName}
          </p>
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
                      : "border-zinc-800 bg-black/50 text-zinc-200"
                }`}
              >
                {day && (
                  <>
                    <p className="font-bold">{day}</p>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 h-2 w-2 rounded-full bg-yellow-300" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-black/60 p-4">
          <p className="font-black text-cyan-200">
            Giorno {selectedDay}
          </p>

          {selectedEvents.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              Nessun evento in questo giorno.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedEvents.map((event) => (
                <div key={event.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-sm font-bold text-cyan-200">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
                    {event.type}
                  </p>
                  {(event.remind_at || event.start_at) && (
                    <p className="mt-1 text-sm text-yellow-300">
                      {new Date(event.remind_at || event.start_at || "").toLocaleTimeString("it-IT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
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
    if (!actions.length) {
      return <EmptyBrainBox text="Nessuna azione futura rilevata." />;
    }

    return (
      <div className="space-y-3">
        {actions.map((item) => (
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
}: {
  activeTab: "memory" | "timeline" | "goals" | "state";
  brainData: BrainData;
}) {
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

  if (!list.length) return <EmptyBrainBox text="Nessun dato ancora." />;

  return (
    <div className="space-y-3">
      {list.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border border-zinc-800 bg-black/60 p-4"
        >
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
        </div>
      ))}
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