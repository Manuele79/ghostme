import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const OUT_MD = path.join(ROOT, "docs/maps/PROJECT_KNOWLEDGE_BASE.md");
const OUT_JSON = path.join(ROOT, "docs/state/PROJECT_KNOWLEDGE_BASE.json");

const inputs = {
  systemMap: "docs/maps/GHOSTME_SYSTEM_MAP_V6.md",
  cognitiveRouting: "docs/maps/COGNITIVE_ROUTING_MAP.md",
  databaseUsage: "docs/maps/DATABASE_USAGE_MAP.md",
  fileUsage: "docs/maps/FILE_USAGE_MAP.md",
  supabaseSchema: "docs/maps/SUPABASE_SCHEMA_MAP.md",
  priorityFix: "docs/maps/GHOSTME_PRIORITY_FIX_LIST.md",
  dependencyText: "docs/maps/DEPENDENCY_TEXT_MAP.txt",
};

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function read(file) {
  const p = path.join(ROOT, file);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function lines(text) {
  return text.split(/\r?\n/).filter(Boolean);
}

const loaded = Object.fromEntries(
  Object.entries(inputs).map(([key, file]) => [key, { file, exists: exists(file), lineCount: lines(read(file)).length }])
);

const json = {
  generatedAt: new Date().toISOString(),
  inputs: loaded,
};

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2));

let md = `# PROJECT KNOWLEDGE BASE\n\n`;
md += `Generated: ${json.generatedAt}\n\n`;
md += `Questa è la mappa centrale automatica del progetto GhostMe.\n\n`;

md += `## Documenti collegati\n\n`;
for (const [key, item] of Object.entries(loaded)) {
  md += `- **${key}**: ${item.exists ? "OK" : "MANCANTE"} — \`${item.file}\` (${item.lineCount} righe)\n`;
}

md += `\n## Come usarla\n\n`;
md += `Quando devi capire GhostMe, parti da qui:\n\n`;
md += `1. **COGNITIVE_ROUTING_MAP** — come passa un messaggio nel cervello.\n`;
md += `2. **GHOSTME_SYSTEM_MAP_V6** — quali moduli esistono e cosa fanno.\n`;
md += `3. **SUPABASE_SCHEMA_MAP** — quali tabelle vengono lette/scritte.\n`;
md += `4. **DATABASE_USAGE_MAP** — uso DB per tabella.\n`;
md += `5. **FILE_USAGE_MAP** — file orfani, import/export.\n`;
md += `6. **DEPENDENCY_TEXT_MAP** — chi chiama chi.\n`;
md += `7. **GHOSTME_PRIORITY_FIX_LIST** — cosa sistemare prima.\n\n`;

md += `## Flussi principali da controllare\n\n`;
md += `### Chat → Memoria → People → Proactive\n\n`;
md += `Messaggio utente → CognitiveDecision → Context → Prompt → Post-processing → Memorie/Topic/People → Proactive Cards.\n\n`;

md += `### Luoghi → Observation → Pattern → Moment Awareness\n\n`;
md += `user_location_state → observation_events → behavior_patterns → currentSituation → proactiveCandidateBuilder → ghost_proactive_messages.\n\n`;

md += `### Home Assistant → House Snapshot → Daily/Proactive\n\n`;
md += `house_events → house_entities → house_patterns/house_suggestions → currentSituation → Daily/Observation.\n\n`;

md += `## Regola operativa\n\n`;
md += `Da ora in poi, prima di aggiungere funzioni nuove, controllare se il dato esiste già, chi lo scrive e chi lo legge.\n`;

fs.writeFileSync(OUT_MD, md);

console.log("Generated docs/maps/PROJECT_KNOWLEDGE_BASE.md");
console.log("Generated docs/state/PROJECT_KNOWLEDGE_BASE.json");