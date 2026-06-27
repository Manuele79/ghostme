import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MAPS_DIR = path.join(ROOT, "docs", "maps");
const STATE_DIR = path.join(ROOT, "docs", "state");

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeDoc(name, content) {
  fs.mkdirSync(MAPS_DIR, { recursive: true });
  fs.writeFileSync(path.join(MAPS_DIR, name), content);
  console.log(`Generated docs/maps/${name}`);
}

function list(items) {
  const values = [...new Set((items || []).filter(Boolean))].sort();
  return values.length ? values.map((item) => `- ${item}`).join("\n") : "- nessuno";
}

function basename(file) {
  return path.basename(file).replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, "");
}

function moduleKind(file) {
  const name = basename(file);
  if (file.startsWith("app/api/worker/")) return "worker";
  if (file.startsWith("app/api/")) return "api";
  if (file.startsWith("app/") || file.startsWith("components/")) return "ui";
  if (file.startsWith("hooks/")) return "hook";
  if (/Orchestrator$/.test(name)) return "orchestrator";
  if (/Engine$/.test(name)) return "engine";
  if (/Snapshot$/.test(name)) return "snapshot";
  if (/Service$/.test(name) || file.includes("/services/")) return "service";
  if (/Flow$/.test(name)) return "flow";
  if (/Adapter$/.test(name) || file.includes("/ui/")) return "adapter";
  return "module";
}

function responsibility(file) {
  const kind = moduleKind(file);
  const name = basename(file);
  const area = file.split("/").slice(0, -1).join("/");
  const labels = {
    api: "Espone un punto di ingresso HTTP.",
    worker: "Esegue un ciclo worker o cron.",
    ui: "Renderizza o coordina esperienza utente.",
    hook: "Gestisce stato client e chiamate UI.",
    orchestrator: "Coordina un flusso applicativo multi-modulo.",
    engine: "Calcola decisioni, insight o trasformazioni cognitive.",
    snapshot: "Costruisce una vista strutturata dello stato utente/sistema.",
    service: "Integra servizi o accesso dati specializzato.",
    flow: "Implementa un workflow applicativo specifico.",
    adapter: "Adatta dati tra domini o verso la UI.",
    module: "Modulo di supporto applicativo.",
  };
  return `${labels[kind]} Area: ${area || "."}. Modulo: ${name}.`;
}

function statusFor(entry) {
  if (!entry) return "ORFANO";
  if (String(entry.status || "").includes("orphan")) return "ORFANO";
  if (entry.file?.toLowerCase().includes("legacy")) return "LEGACY";
  return "ATTIVO";
}

function linkedByKind(entry, fileUsage, kind) {
  const related = [...(entry.imports || []), ...(entry.importedBy || [])];
  return related.filter((file) => moduleKind(fileUsage[file]?.file || file) === kind);
}

function buildSystemMap(fileUsage) {
  const rows = Object.values(fileUsage).sort((a, b) => a.file.localeCompare(b.file));
  const groups = {
    engine: [],
    snapshot: [],
    service: [],
    flow: [],
    adapter: [],
    ui: [],
    api: [],
    worker: [],
    orchestrator: [],
    hook: [],
    module: [],
  };

  for (const row of rows) {
    groups[moduleKind(row.file)]?.push(row);
  }

  const lines = [
    "# GHOSTME SYSTEM MAP V6",
    "",
    `Generato automaticamente: ${new Date().toISOString()}`,
    "",
    "## Inventario",
    "",
    ...Object.entries(groups).map(([kind, items]) => `- ${kind}: ${items.length}`),
    "",
    "## Punti di ingresso",
    "",
    ...rows
      .filter((row) => row.file.startsWith("app/") || row.file.startsWith("hooks/"))
      .map((row) => `- ${row.file}`),
    "",
    "## Punti di uscita",
    "",
    ...rows
      .filter(
        (row) =>
          row.tablesWritten.length ||
          row.tablesUpdated.length ||
          row.tablesDeleted.length ||
          row.file.includes("webSearchService") ||
          row.file.includes("weatherService") ||
          row.file.includes("haClient") ||
          row.file.includes("OpenAI"),
      )
      .map((row) => `- ${row.file}`),
    "",
    "## Moduli",
    "",
  ];

  for (const row of rows) {
    const tables = [
      ...row.tablesRead.map((table) => `${table} (read)`),
      ...row.tablesWritten.map((table) => `${table} (write)`),
      ...row.tablesUpdated.map((table) => `${table} (update)`),
      ...row.tablesDeleted.map((table) => `${table} (delete)`),
    ];

    lines.push(
      `### ${row.file}`,
      "",
      `Tipo: **${moduleKind(row.file)}**`,
      "",
      `Stato: **${statusFor(row)}**`,
      "",
      `Responsabilita: ${responsibility(row.file)}`,
      "",
      "Chi lo chiama:",
      list(row.importedBy),
      "",
      "Chi chiama:",
      list(row.imports),
      "",
      "Tabelle usate:",
      list(tables),
      "",
      "Engine collegati:",
      list(linkedByKind(row, fileUsage, "engine")),
      "",
      "Snapshot collegati:",
      list(linkedByKind(row, fileUsage, "snapshot")),
      "",
    );
  }

  return lines.join("\n");
}

function dependencyViolations(dependencyGraph, name) {
  return (dependencyGraph.summary?.violations || [])
    .filter((violation) => violation.rule?.name === name)
    .map((violation) =>
      name === "no-orphans"
        ? violation.from
        : [violation.from, violation.to].filter(Boolean).join(" -> "),
    )
    .filter(Boolean)
    .sort();
}

function duplicateBasenames(fileUsage) {
  const groups = new Map();
  for (const file of Object.keys(fileUsage)) {
    const key = basename(file).toLowerCase();
    if (["route", "page", "layout", "index"].includes(key)) continue;
    groups.set(key, [...(groups.get(key) || []), file]);
  }
  return [...groups.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([name, files]) => `- ${name}: ${files.join(", ")}`);
}

function buildPriorityFix(fileUsage, dependencyGraph) {
  const rows = Object.values(fileUsage).sort((a, b) => a.file.localeCompare(b.file));
  const orphans = rows.filter((row) => String(row.status || "").includes("orphan"));
  const cycles = dependencyViolations(dependencyGraph, "no-circular");
  const deadDependencies = dependencyViolations(dependencyGraph, "no-orphans");
  const uncalled = rows.filter(
    (row) =>
      !row.importedBy.length &&
      !row.file.startsWith("app/") &&
      !row.file.startsWith("components/") &&
      !row.file.startsWith("hooks/"),
  );
  const duplicates = duplicateBasenames(fileUsage);

  return [
    "# GHOSTME PRIORITY FIX LIST",
    "",
    `Generato automaticamente: ${new Date().toISOString()}`,
    "",
    "## Riepilogo",
    "",
    `- File orfani: ${orphans.length}`,
    `- Dipendenze morte/moduli orfani dependency-cruiser: ${deadDependencies.length}`,
    `- Moduli mai chiamati: ${uncalled.length}`,
    `- Cicli: ${cycles.length}`,
    `- Duplicazioni nome file: ${duplicates.length}`,
    "",
    "## File orfani",
    "",
    list(orphans.map((row) => row.file)),
    "",
    "## Dipendenze morte",
    "",
    list(deadDependencies),
    "",
    "## Moduli mai chiamati",
    "",
    list(uncalled.map((row) => row.file)),
    "",
    "## Cicli",
    "",
    list(cycles),
    "",
    "## Duplicazioni",
    "",
    duplicates.length ? duplicates.join("\n") : "- nessuna",
  ].join("\n");
}

const routingSteps = [
  {
    name: "Messaggio",
    files: ["app/chat/page.tsx", "hooks/useGhostChat.ts", "app/api/chat/route.ts"],
    responsibility: "Raccoglie input utente, invia richiesta autenticata e apre il flusso chat.",
    input: "Testo, userId, cronologia locale, eventuale risposta a card proattiva.",
    output: "Request verso /api/chat e stream/risposta assistant.",
  },
  {
    name: "messageClassifier",
    files: ["lib/ghostme/core/messageClassifier.ts"],
    responsibility: "Classifica intenzione generale e costruisce la CognitiveDecision base.",
    input: "Messaggio utente.",
    output: "Classe di messaggio e decisione cognitiva iniziale.",
  },
  {
    name: "chatMessageAnalyzer",
    files: ["lib/ghostme/chat/chatMessageAnalyzer.ts"],
    responsibility: "Combina classificazione, topic, entity e relazioni, poi raffina la CognitiveDecision.",
    input: "Messaggio utente e contesto base.",
    output: "Analisi strutturata e CognitiveDecision per orchestrator e post-processing.",
  },
  {
    name: "contextBuilder",
    files: [
      "lib/ghostme/chat/chatContextBuilder.ts",
      "lib/ghostme/context/reasoningService.ts",
      "lib/ghostme/context/contextBuilder.ts",
    ],
    responsibility: "Costruisce contesto runtime, snapshot e segnali rilevanti.",
    input: "userId, analisi messaggio, CognitiveDecision, memoria, calendario, casa, luoghi.",
    output: "Chat context, GhostBrainSnapshot e cognitiveDecisionContext.",
  },
  {
    name: "chatPromptBuilder",
    files: ["lib/ghostme/chat/chatPromptBuilder.ts"],
    responsibility: "Trasforma il contesto in prompt di sistema e applica l'identita operativa derivata dalla CognitiveDecision.",
    input: "Chat context, CognitiveDecision, profilo, memoria, regole e servizi.",
    output: "Prompt finale per OpenAI con direttive di stile, profondita, domande, osservazioni, proattivita e silenzio.",
  },
  {
    name: "calendar",
    files: ["lib/ghostme/chat/chatCalendarFlow.ts", "lib/ghostme/calendar/calendarService.ts"],
    responsibility: "Interpreta e persiste eventi/reminder quando il messaggio e calendar-related.",
    input: "Intent calendario, data/ora, descrizione evento.",
    output: "calendar_events e card reminder/agenda.",
  },
  {
    name: "behavior",
    files: ["lib/ghostme/behavior/behaviorRulesEngine.ts"],
    responsibility: "Legge/applica regole comportamentali e salva preferenze durevoli.",
    input: "Messaggio e profilo utente.",
    output: "ghost_behavior_rules e prompt comportamentale.",
  },
  {
    name: "memory",
    files: [
      "lib/ghostme/chat/chatPostProcessing.ts",
      "lib/ghostme/retrieval.ts",
      "lib/ghostme/memory/memorySnapshot.ts",
    ],
    responsibility: "Recupera e aggiorna memorie attive, episodi, summary e topic.",
    input: "Conversazione, analisi topic, userId e CognitiveDecision.",
    output: "memories_active, episodic_memories, conversation_summaries.",
  },
  {
    name: "people graph",
    files: ["lib/ghostme/people/peopleGraphService.ts", "lib/ghostme/people/peopleGraphLinkService.ts"],
    responsibility: "Deriva persone e link relazionali dai topic e dalle memorie.",
    input: "life_topics, memories, relationship signals.",
    output: "people_graph e people_graph_links.",
  },
  {
    name: "topic",
    files: ["lib/ghostme/topicDetector.ts", "lib/ghostme/topicLinks.ts"],
    responsibility: "Estrae topic e collega argomenti correlati.",
    input: "Messaggio e memoria contestuale.",
    output: "life_topics e topic_links.",
  },
  {
    name: "timeline",
    files: ["lib/ghostme/timeline.ts"],
    responsibility: "Registra eventi autobiografici rilevanti.",
    input: "Messaggio classificato come episodio/evento.",
    output: "autobiographical_timeline.",
  },
  {
    name: "proactive",
    files: [
      "lib/ghostme/proactive/proactiveUserFlow.ts",
      "lib/ghostme/proactive/proactiveCandidateBuilder.ts",
      "lib/ghostme/proactive/proactiveMessageService.ts",
    ],
    responsibility: "Costruisce, ranka e deduplica card proattive.",
    input: "Snapshot, calendario, pattern, osservazioni, casa, curiosity.",
    output: "ghost_proactive_messages.",
  },
  {
    name: "daily briefing",
    files: [
      "lib/ghostme/proactive/dailyBriefingRepository.ts",
      "lib/ghostme/proactive/dailyBriefingBuilder.ts",
    ],
    responsibility: "Crea briefing quotidiano se manca quello della giornata.",
    input: "Calendario, azioni, mental state, casa, luoghi, pattern, summary.",
    output: "Card daily_briefing deduplicata.",
  },
  {
    name: "osservazioni",
    files: [
      "lib/ghostme/observation/observationInsightEngine.ts",
      "lib/ghostme/patterns/patternInsightEngine.ts",
      "lib/ghostme/curiosity/curiositySnapshot.ts",
    ],
    responsibility: "Trasforma pattern, osservazioni e gap utili in insight o domande ad alto valore futuro.",
    input: "behavior_patterns, observation_events, snapshot curiosity.",
    output: "Candidate/card observation o curiosity.",
  },
  {
    name: "risposta",
    files: ["lib/ghostme/chat/ghostChatOrchestrator.ts", "app/api/chat/route.ts"],
    responsibility: "Produce risposta finale e avvia post-processing non bloccante.",
    input: "Prompt, servizi esterni, risultato calendar flow.",
    output: "Risposta assistant e aggiornamenti post-response.",
  },
];

function buildCognitiveRoutingMap() {
  const infoTypes = [
    "Messaggio libero",
    "Richiesta calendario/reminder",
    "Preferenza comportamentale",
    "Memoria/fatto personale",
    "Persona o relazione",
    "Luogo o Home Assistant",
    "Goal/progetto/azione",
    "Risposta a card proattiva",
  ];

  const lines = [
    "# COGNITIVE ROUTING MAP",
    "",
    `Generato automaticamente: ${new Date().toISOString()}`,
    "",
    "## Tipi di informazione ricevuta",
    "",
    ...infoTypes.map((type) => `- ${type}`),
    "",
    "## Flusso decisionale completo",
    "",
    routingSteps.map((step) => step.name).join("\n\nv\n\n"),
    "",
    "## Dettaglio passaggi",
    "",
  ];

  for (const step of routingSteps) {
    lines.push(
      `### ${step.name}`,
      "",
      "File coinvolti:",
      list(step.files),
      "",
      `Responsabilita: ${step.responsibility}`,
      "",
      `Input: ${step.input}`,
      "",
      `Output: ${step.output}`,
      "",
    );
  }

  return lines.join("\n");
}

const fileUsage = readJson(path.join(MAPS_DIR, "FILE_USAGE_MAP.json"), {});
const dependencyGraph = readJson(path.join(STATE_DIR, "dependency-graph.json"), {});

writeDoc("GHOSTME_SYSTEM_MAP_V6.md", buildSystemMap(fileUsage));
writeDoc("GHOSTME_PRIORITY_FIX_LIST.md", buildPriorityFix(fileUsage, dependencyGraph));
writeDoc("COGNITIVE_ROUTING_MAP.md", buildCognitiveRoutingMap());
