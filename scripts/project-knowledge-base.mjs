import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const OUT_MD = path.join(ROOT, "docs/maps/PROJECT_KNOWLEDGE_BASE.md");
const OUT_JSON = path.join(ROOT, "docs/state/PROJECT_KNOWLEDGE_BASE.json");

const INPUTS = {
  systemMap: "docs/maps/GHOSTME_SYSTEM_MAP_V6.md",
  cognitiveRouting: "docs/maps/COGNITIVE_ROUTING_MAP.md",
  databaseUsage: "docs/maps/DATABASE_USAGE_MAP.md",
  fileUsage: "docs/maps/FILE_USAGE_MAP.md",
  supabaseSchemaMd: "docs/maps/SUPABASE_SCHEMA_MAP.md",
  supabaseSchemaJson: "docs/state/SUPABASE_SCHEMA_MAP.json",
  priorityFix: "docs/maps/GHOSTME_PRIORITY_FIX_LIST.md",
  dependencyText: "docs/maps/DEPENDENCY_TEXT_MAP.txt",
};

function readText(relativePath) {
  const full = path.join(ROOT, relativePath);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function readJson(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) return null;
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    return null;
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function lineCount(text) {
  return text.split(/\r?\n/).filter(Boolean).length;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))].sort();
}

function tableByName(schemaJson) {
  const out = {};
  for (const table of schemaJson?.tables ?? []) {
    out[table.table] = table;
  }
  return out;
}

function tableSummary(table) {
  if (!table) return null;

  return {
    table: table.table,
    readers: table.readers ?? [],
    writers: table.writers ?? [],
    deleters: table.deleters ?? [],
    selectedColumns: table.selectedColumns ?? [],
    writtenColumns: table.writtenColumns ?? [],
    missingColumns: table.missingColumns ?? [],
    realColumns: table.realColumns ?? [],
    readOnly: Boolean(table.readOnly),
    writeOnly: Boolean(table.writeOnly),
  };
}

const texts = Object.fromEntries(
  Object.entries(INPUTS).map(([key, file]) => [key, readText(file)])
);

const supabaseSchema = readJson(INPUTS.supabaseSchemaJson);
const tables = tableByName(supabaseSchema);

const loadedDocs = Object.fromEntries(
  Object.entries(INPUTS).map(([key, file]) => [
    key,
    {
      file,
      exists: exists(file),
      lineCount: lineCount(readText(file)),
    },
  ])
);

const CORE_TABLES = [
  "chat_messages",
  "memories_active",
  "episodic_memories",
  "conversation_summaries",
  "life_topics",
  "topic_links",
  "people_graph",
  "people_graph_links",
  "goals_desires",
  "action_intents",
  "calendar_events",
  "ghost_behavior_rules",
  "mental_states",
  "dynamic_self_profile",
  "user_location_state",
  "significant_places",
  "observation_events",
  "behavior_patterns",
  "house_events",
  "house_entities",
  "house_patterns",
  "house_suggestions",
  "ghost_proactive_messages",
];

const FLOWS = [
  {
    name: "Chat → Cognitive Core → Risposta",
    goal: "Capire il messaggio, costruire contesto, rispondere e avviare post-processing.",
    files: [
      "app/api/chat/route.ts",
      "lib/ghostme/chat/ghostChatOrchestrator.ts",
      "lib/ghostme/core/messageClassifier.ts",
      "lib/ghostme/chat/chatMessageAnalyzer.ts",
      "lib/ghostme/chat/chatContextBuilder.ts",
      "lib/ghostme/chat/chatPromptBuilder.ts",
      "lib/ghostme/chat/chatPostProcessing.ts",
    ],
    tables: [
      "chat_messages",
      "memories_active",
      "episodic_memories",
      "life_topics",
      "topic_links",
      "goals_desires",
      "action_intents",
      "calendar_events",
      "ghost_behavior_rules",
      "mental_states",
    ],
    output: "Risposta chat + aggiornamenti memoria/goal/action/behavior.",
  },
  {
    name: "Memoria → Topic → People Graph",
    goal: "Trasformare messaggi e ricordi in persone, relazioni e collegamenti.",
    files: [
      "lib/ghostme/chat/chatPostProcessing.ts",
      "lib/ghostme/topicDetector.ts",
      "lib/ghostme/topicLinks.ts",
      "lib/ghostme/people/peopleGraphService.ts",
      "lib/ghostme/people/peopleGraphLinkService.ts",
      "lib/ghostme/people/peopleSnapshot.ts",
    ],
    tables: [
      "memories_active",
      "episodic_memories",
      "life_topics",
      "topic_links",
      "people_graph",
      "people_graph_links",
    ],
    output: "People Snapshot, relationship context, deep recall.",
  },
  {
    name: "Luoghi → Observation → Pattern",
    goal: "Capire dove si trova Manu, cosa cambia e quali abitudini emergono.",
    files: [
      "lib/ghostme/location/locationUpdateFlow.ts",
      "lib/ghostme/location/haLocationBridgeFlow.ts",
      "lib/ghostme/location/locationLearningFlow.ts",
      "lib/ghostme/location/placeService.ts",
      "lib/ghostme/observation/observationEngine.ts",
      "lib/ghostme/patterns/patternInsightEngine.ts",
    ],
    tables: [
      "user_location_state",
      "significant_places",
      "observation_events",
      "behavior_patterns",
    ],
    output: "currentSituation, place events, location patterns.",
  },
  {
    name: "Home Assistant → House Snapshot → Situation",
    goal: "Trasformare eventi casa/sensori in situazione leggibile.",
    files: [
      "app/api/home-assistant/event/route.ts",
      "lib/ghostme/homeAssistant/homeEventLogger.ts",
      "lib/ghostme/home/houseStateSnapshot.ts",
      "lib/ghostme/homeAssistant/housePatternEngine.ts",
      "lib/ghostme/homeAssistant/houseAutomationSuggestionEngine.ts",
      "lib/ghostme/context/reasoningService.ts",
    ],
    tables: [
      "house_events",
      "house_entities",
      "house_patterns",
      "house_suggestions",
      "house_automation_controls",
      "house_learned_rules",
    ],
    output: "House snapshot, room/activity signals, house suggestions.",
  },
  {
    name: "Proactive → Daily → Card UI",
    goal: "Decidere cosa mostrare all’utente senza aspettare la chat.",
    files: [
      "app/api/ghostme/brain/route.ts",
      "lib/ghostme/proactive/proactiveUserFlow.ts",
      "lib/ghostme/proactive/proactiveCandidateBuilder.ts",
      "lib/ghostme/proactive/proactiveCandidateRanker.ts",
      "lib/ghostme/proactive/proactiveMessageService.ts",
      "lib/ghostme/proactive/dailyBriefingBuilder.ts",
      "lib/ghostme/proactive/visibleProactiveMessages.ts",
      "components/ghost/GhostDrawers.tsx",
    ],
    tables: [
      "ghost_proactive_messages",
      "calendar_events",
      "action_intents",
      "goals_desires",
      "observation_events",
      "behavior_patterns",
      "user_location_state",
      "house_events",
    ],
    output: "Daily briefing, curiosity, observation, continuity cards.",
  },
  {
    name: "Continuity / Open Loops",
    goal: "Riprendere storie aperte quando il momento è giusto.",
    files: [
      "lib/ghostme/proactive/proactiveUserFlow.ts",
      "lib/ghostme/proactive/proactiveCandidateBuilder.ts",
      "lib/ghostme/proactive/proactiveCandidateRanker.ts",
      "lib/ghostme/proactive/proactiveMessageService.ts",
    ],
    tables: [
      "action_intents",
      "calendar_events",
      "autobiographical_timeline",
      "episodic_memories",
      "conversation_summaries",
      "observation_events",
      "user_location_state",
      "ghost_proactive_messages",
    ],
    output: "Card continuity: grigliata, rientro, luogo nuovo, evento aperto.",
  },
];

const tableSummaries = CORE_TABLES.map((name) => tableSummary(tables[name])).filter(Boolean);

const missingColumnWarnings = (supabaseSchema?.warnings?.missingColumns ?? []).map((w) => ({
  table: w.table,
  columns: w.columns ?? [],
}));

const readOnlyWarnings = supabaseSchema?.warnings?.readOnly ?? [];
const writeOnlyWarnings = supabaseSchema?.warnings?.writeOnly ?? [];

const impactMap = {};
for (const table of tableSummaries) {
  impactMap[table.table] = {
    ifThisChangesCheck: unique([
      ...(table.readers ?? []),
      ...(table.writers ?? []),
    ]),
    consumers: table.readers ?? [],
    producers: table.writers ?? [],
    missingColumns: table.missingColumns ?? [],
  };
}

const json = {
  generatedAt: new Date().toISOString(),
  version: "1",
  inputs: loadedDocs,
  coreTables: tableSummaries,
  flows: FLOWS,
  warnings: {
    missingColumnWarnings,
    readOnlyWarnings,
    writeOnlyWarnings,
  },
  impactMap,
};

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2));

let md = `# PROJECT KNOWLEDGE BASE\n\n`;
md += `Generated: ${json.generatedAt}\n\n`;
md += `Questa è la mappa centrale automatica del progetto GhostMe.\n\n`;
md += `Serve per capire **cosa esiste**, **chi chiama cosa**, **quali dati entrano/escono** e **dove controllare prima di modificare codice**.\n\n`;

md += `## 1. Documenti collegati\n\n`;
for (const [key, item] of Object.entries(loadedDocs)) {
  md += `- **${key}**: ${item.exists ? "OK" : "MANCANTE"} — \`${item.file}\` (${item.lineCount} righe)\n`;
}

md += `\n## 2. Regola operativa\n\n`;
md += `Prima di aggiungere funzioni nuove:\n\n`;
md += `1. controllare se il dato esiste già;\n`;
md += `2. controllare chi lo scrive;\n`;
md += `3. controllare chi lo legge;\n`;
md += `4. controllare se arriva alla UI o al prompt;\n`;
md += `5. solo dopo modificare codice.\n\n`;

md += `## 3. Flussi cognitivi principali\n\n`;

for (const flow of FLOWS) {
  md += `### ${flow.name}\n\n`;
  md += `**Obiettivo**\n\n${flow.goal}\n\n`;

  md += `**File coinvolti**\n\n`;
  for (const file of flow.files) {
    md += `- ${file}\n`;
  }

  md += `\n**Tabelle coinvolte**\n\n`;
  for (const table of flow.tables) {
    const t = tables[table];
    const readerCount = t?.readers?.length ?? 0;
    const writerCount = t?.writers?.length ?? 0;
    md += `- ${table} — reader: ${readerCount}, writer: ${writerCount}\n`;
  }

  md += `\n**Output**\n\n${flow.output}\n\n`;
}

md += `## 4. Tabelle core e stato utilizzo\n\n`;
md += `| Tabella | Reader | Writer | Colonne lette | Colonne scritte | Missing columns |\n`;
md += `|---|---:|---:|---:|---:|---|\n`;

for (const table of tableSummaries) {
  md += `| ${table.table} | ${table.readers.length} | ${table.writers.length} | ${table.selectedColumns.length} | ${table.writtenColumns.length} | ${(table.missingColumns ?? []).join(", ") || "-"} |\n`;
}

md += `\n## 5. Warning schema / query obsolete\n\n`;

if (missingColumnWarnings.length) {
  for (const warning of missingColumnWarnings) {
    md += `- **${warning.table}** richiede colonne non presenti nello schema noto: ${warning.columns.join(", ")}\n`;
  }
} else {
  md += `- Nessuna query obsoleta rilevata nelle tabelle con schema noto.\n`;
}

md += `\n## 6. Tabelle scritte ma mai lette\n\n`;
if (writeOnlyWarnings.length) {
  for (const table of writeOnlyWarnings) {
    md += `- ${table}\n`;
  }
} else {
  md += `- Nessuna\n`;
}

md += `\n## 7. Tabelle lette ma mai scritte\n\n`;
if (readOnlyWarnings.length) {
  for (const table of readOnlyWarnings) {
    md += `- ${table}\n`;
  }
} else {
  md += `- Nessuna\n`;
}

md += `\n## 8. Impact Map\n\n`;
md += `Se tocchi una tabella, controlla questi file.\n\n`;

for (const [table, impact] of Object.entries(impactMap)) {
  md += `### ${table}\n\n`;

  md += `**Producer / writer**\n\n`;
  if (impact.producers.length) {
    for (const file of impact.producers) md += `- ${file}\n`;
  } else {
    md += `- Nessuno rilevato\n`;
  }

  md += `\n**Consumer / reader**\n\n`;
  if (impact.consumers.length) {
    for (const file of impact.consumers) md += `- ${file}\n`;
  } else {
    md += `- Nessuno rilevato\n`;
  }

  if (impact.missingColumns.length) {
    md += `\n**Problemi schema noti**\n\n`;
    for (const col of impact.missingColumns) md += `- ${col}\n`;
  }

  md += `\n`;
}

md += `## 9. Percorsi da usare per debug rapido\n\n`;

md += `### Perché GhostMe non crea una card continuity?\n\n`;
md += `Controllare in ordine:\n\n`;
md += `1. observation_events\n`;
md += `2. user_location_state\n`;
md += `3. episodic_memories / conversation_summaries\n`;
md += `4. proactiveCandidateBuilder.ts\n`;
md += `5. proactiveUserFlow.ts\n`;
md += `6. proactiveMessageService.ts\n`;
md += `7. ghost_proactive_messages\n`;
md += `8. visibleProactiveMessages.ts\n\n`;

md += `### Perché Daily è inutile o vecchio?\n\n`;
md += `Controllare in ordine:\n\n`;
md += `1. dailyBriefingRepository.ts\n`;
md += `2. dailyBriefingBuilder.ts\n`;
md += `3. ghost_proactive_messages logical_key daily_briefing_YYYY-MM-DD\n`;
md += `4. visibleProactiveMessages.ts\n\n`;

md += `### Perché una regola comportamento non viene rispettata?\n\n`;
md += `Controllare in ordine:\n\n`;
md += `1. ghost_behavior_rules\n`;
md += `2. behaviorRulesEngine.ts\n`;
md += `3. chatContextBuilder.ts\n`;
md += `4. chatPromptBuilder.ts\n`;
md += `5. Identity / Profilo comportamentale runtime\n\n`;

md += `### Perché Home Assistant produce dati ma GhostMe non li usa?\n\n`;
md += `Controllare in ordine:\n\n`;
md += `1. house_events\n`;
md += `2. house_entities\n`;
md += `3. houseStateSnapshot.ts\n`;
md += `4. reasoningService.ts\n`;
md += `5. dailyBriefingRepository.ts\n`;
md += `6. proactiveCandidateBuilder.ts\n\n`;

md += `## 10. Nota finale\n\n`;
md += `Questa Knowledge Base non sostituisce gli audit specifici. Li collega.\n`;
md += `È il punto di partenza per ogni nuova modifica architetturale.\n`;

fs.writeFileSync(OUT_MD, md);

console.log("Generated docs/maps/PROJECT_KNOWLEDGE_BASE.md");
console.log("Generated docs/state/PROJECT_KNOWLEDGE_BASE.json");