import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "knowledge");

const SOURCES = [
  ["00_PROJECT.md", "docs/maps/PROJECT_KNOWLEDGE_BASE.md"],
  ["01_ARCHITECTURE.md", "docs/maps/GHOSTME_SYSTEM_MAP_V6.md"],
  ["02_COGNITIVE_ROUTING.md", "docs/maps/COGNITIVE_ROUTING_MAP.md"],
  ["03_DATABASE_USAGE.md", "docs/maps/DATABASE_USAGE_MAP.md"],
  ["04_SUPABASE_SCHEMA.md", "docs/maps/SUPABASE_SCHEMA_MAP.md"],
  ["05_FILE_USAGE.md", "docs/maps/FILE_USAGE_MAP.md"],
  ["06_DEPENDENCIES.md", "docs/maps/DEPENDENCY_TEXT_MAP.txt"],
  ["07_PRIORITY_FIX.md", "docs/maps/GHOSTME_PRIORITY_FIX_LIST.md"],
];

const EXTERNALS = [
  ["supabase_tables_columns.csv", "external/supabase-schema/tables_columns.csv"],
  ["supabase_policies.csv", "external/supabase-schema/policies.csv"],
  ["supabase_indexes.csv", "external/supabase-schema/indexes.csv"],
  ["supabase_functions.csv", "external/supabase-schema/functions.csv"],
  ["home_assistant_readme.md", "external/home-assistant/README.md"],
  ["external_readme.md", "external/README.md"],
  ["codex_context.md", "CODEX_CONTEXT.md"],
];

function read(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function write(rel, content) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, "external"), { recursive: true });
fs.mkdirSync(path.join(OUT, "json"), { recursive: true });

const generatedAt = new Date().toISOString();

let index = `# GHOSTME DEVELOPER KNOWLEDGE BASE\n\n`;
index += `Generated: ${generatedAt}\n\n`;
index += `Questa cartella è il punto unico da leggere prima di modificare GhostMe.\n\n`;

index += `## Ordine di lettura per Codex\n\n`;
index += `1. 00_PROJECT.md\n`;
index += `2. 01_ARCHITECTURE.md\n`;
index += `3. 02_COGNITIVE_ROUTING.md\n`;
index += `4. 04_SUPABASE_SCHEMA.md\n`;
index += `5. 05_FILE_USAGE.md\n`;
index += `6. 06_DEPENDENCIES.md\n`;
index += `7. 07_PRIORITY_FIX.md\n`;
index += `8. external/\n\n`;

index += `## Regola\n\n`;
index += `Prima di modificare codice: capire chi produce il dato, chi lo legge, dove si ferma e se arriva a UI, prompt o proactive.\n\n`;

index += `## File generati\n\n`;

for (const [outName, source] of SOURCES) {
  const content = read(source);
  write(outName, content || `# ${outName}\n\nSorgente mancante: ${source}\n`);
  index += `- ${outName} ← ${source} ${exists(source) ? "OK" : "MANCANTE"}\n`;
}

for (const [outName, source] of EXTERNALS) {
  const content = read(source);
  write(path.join("external", outName), content || `Sorgente mancante: ${source}\n`);
  index += `- external/${outName} ← ${source} ${exists(source) ? "OK" : "MANCANTE"}\n`;
}

const runtime = {
  generatedAt,
  sources: Object.fromEntries(
    [...SOURCES, ...EXTERNALS].map(([outName, source]) => [
      outName,
      { source, exists: exists(source) },
    ])
  ),
};

write("json/knowledge-index.json", JSON.stringify(runtime, null, 2));
write("README.md", index);

console.log("Generated knowledge/ README and source copies");