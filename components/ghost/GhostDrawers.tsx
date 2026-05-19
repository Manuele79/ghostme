"use client";

import { BrainData, ChatMessage } from "./types";



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
                {["actions", "profile", "traits"].includes(item.key)
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
}) {
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