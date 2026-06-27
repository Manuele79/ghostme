import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SEARCH_DIRS = ["app", "components", "hooks", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const TABLES = [
  "action_intents",
  "answers",
  "autobiographical_timeline",
  "behavior_patterns",
  "calendar_events",
  "chat_messages",
  "contradictions",
  "conversation_summaries",
  "dynamic_self_profile",
  "episodic_memories",
  "ghost_behavior_rules",
  "ghost_proactive_messages",
  "goals_desires",
  "house_automation_controls",
  "house_entities",
  "house_events",
  "house_learned_rules",
  "house_paths",
  "house_patterns",
  "house_rooms",
  "house_suggestions",
  "life_topics",
  "memories",
  "memories_active",
  "mental_states",
  "observation_events",
  "people_graph",
  "people_graph_links",
  "questions",
  "significant_places",
  "topic_links",
  "traits",
  "triggers",
  "user_location_state",
  "user_profiles",
];

function walk(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];

  const out = [];

  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;

    const p = path.join(full, entry.name);

    if (entry.isDirectory()) {
      out.push(...walk(path.relative(ROOT, p)));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      out.push(p);
    }
  }

  return out;
}

function toRel(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function moduleKeyFromFile(file) {
  return toRel(file).replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, "");
}

function resolveImport(fromFile, importPath) {
  if (!importPath.startsWith(".") && !importPath.startsWith("@/")) return null;

  const base = importPath.startsWith("@/")
    ? path.join(ROOT, importPath.slice(2))
    : path.resolve(path.dirname(fromFile), importPath);

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.cjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return toRel(candidate);
    }
  }

  return null;
}

function collectImports(content) {
  const imports = [];

  const importRegex =
    /import\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g;

  const requireRegex = /require\(["']([^"']+)["']\)/g;

  for (const match of content.matchAll(importRegex)) {
    imports.push(match[1]);
  }

  for (const match of content.matchAll(requireRegex)) {
    imports.push(match[1]);
  }

  return imports;
}

function collectExports(content) {
  return [
    ...content.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g),
    ...content.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g),
    ...content.matchAll(/export\s+type\s+([A-Za-z0-9_]+)/g),
    ...content.matchAll(/export\s+class\s+([A-Za-z0-9_]+)/g),
  ].map((match) => match[1]);
}

function tableUsage(content, table) {
  const q = String.raw`["'\`]${table}["'\`]`;
  const from = new RegExp(String.raw`\.from\(\s*${q}\s*\)`);
  if (!from.test(content)) return null;

  const usage = {
    read: false,
    write: false,
    update: false,
    del: false,
  };

  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    if (!from.test(lines[i])) continue;

    const block = lines.slice(i, i + 20).join("\n");

    if (/\.select\s*\(/.test(block)) usage.read = true;
    if (/\.insert\s*\(|\.upsert\s*\(/.test(block)) usage.write = true;
    if (/\.update\s*\(/.test(block)) usage.update = true;
    if (/\.delete\s*\(/.test(block)) usage.del = true;
  }

  return usage;
}

const files = SEARCH_DIRS.flatMap(walk);
const fileSet = new Set(files.map(toRel));

const map = {};

for (const file of files) {
  const rel = toRel(file);
  const content = fs.readFileSync(file, "utf8");

  map[rel] = {
    file: rel,
    imports: [],
    exports: [],
    importedBy: [],
    tablesRead: [],
    tablesWritten: [],
    tablesUpdated: [],
    tablesDeleted: [],
    lines: content.split(/\r?\n/).length,
    status: "unknown",
  };

  map[rel].exports = collectExports(content);

  for (const rawImport of collectImports(content)) {
    const resolved = resolveImport(file, rawImport);
    if (resolved && fileSet.has(resolved)) {
      map[rel].imports.push(resolved);
    }
  }

  for (const table of TABLES) {
    const usage = tableUsage(content, table);
    if (!usage) continue;

    if (usage.read) map[rel].tablesRead.push(table);
    if (usage.write) map[rel].tablesWritten.push(table);
    if (usage.update) map[rel].tablesUpdated.push(table);
    if (usage.del) map[rel].tablesDeleted.push(table);
  }
}

for (const entry of Object.values(map)) {
  for (const imported of entry.imports) {
    if (map[imported]) {
      map[imported].importedBy.push(entry.file);
    }
  }
}

function isEntrypoint(file) {
  return (
    file.startsWith("app/") ||
    file.startsWith("components/") ||
    file.startsWith("hooks/")
  );
}

for (const entry of Object.values(map)) {
  const hasInbound = entry.importedBy.length > 0;
  const hasDb =
    entry.tablesRead.length ||
    entry.tablesWritten.length ||
    entry.tablesUpdated.length ||
    entry.tablesDeleted.length;

  if (isEntrypoint(entry.file)) {
    entry.status = "entrypoint";
  } else if (!hasInbound && hasDb) {
    entry.status = "orphan_db_user";
  } else if (!hasInbound) {
    entry.status = "orphan_candidate";
  } else if (entry.lines > 500) {
    entry.status = "god_file_candidate";
  } else {
    entry.status = "active";
  }

  entry.imports = [...new Set(entry.imports)].sort();
  entry.exports = [...new Set(entry.exports)].sort();
  entry.importedBy = [...new Set(entry.importedBy)].sort();
  entry.tablesRead = [...new Set(entry.tablesRead)].sort();
  entry.tablesWritten = [...new Set(entry.tablesWritten)].sort();
  entry.tablesUpdated = [...new Set(entry.tablesUpdated)].sort();
  entry.tablesDeleted = [...new Set(entry.tablesDeleted)].sort();
  entry.callerCount = entry.importedBy.length;
  entry.dependencyCount = entry.imports.length;
  entry.exportCount = entry.exports.length;
}

const docsDir = path.join(ROOT, "docs", "maps");
fs.mkdirSync(docsDir, { recursive: true });

fs.writeFileSync(
  path.join(docsDir, "FILE_USAGE_MAP.json"),
  JSON.stringify(map, null, 2)
);

const rows = Object.values(map).sort((a, b) => a.file.localeCompare(b.file));

const md = [
  "# FILE USAGE MAP",
  "",
  "Mappa statica generata dal codice locale.",
  "",
  "| File | Stato | Chiamanti | Dipendenze | Export | DB read | DB write/update/delete | Righe |",
  "|---|---:|---:|---:|---:|---:|---:|---:|",
  ...rows.map((e) => {
    const writes =
      e.tablesWritten.length + e.tablesUpdated.length + e.tablesDeleted.length;
    return `| ${e.file} | ${e.status} | ${e.callerCount} | ${e.dependencyCount} | ${e.exportCount} | ${e.tablesRead.length} | ${writes} | ${e.lines} |`;
  }),
  "",
  "## Riepilogo",
  "",
  `- File: ${rows.length}`,
  `- File orfani: ${rows.filter((e) => e.status.includes("orphan")).length}`,
  `- God file candidati: ${rows.filter((e) => e.status === "god_file_candidate").length}`,
  "",
  "## Orfani candidati",
  "",
  ...rows
    .filter((e) => e.status.includes("orphan"))
    .map(
      (e) =>
        `- **${e.file}** — ${e.status}; DB read: ${e.tablesRead.join(", ") || "-"}; DB write/update/delete: ${
          [
            ...e.tablesWritten,
            ...e.tablesUpdated,
            ...e.tablesDeleted,
          ].join(", ") || "-"
        }`
    ),
  "",
  "## God file candidati",
  "",
  ...rows
    .filter((e) => e.status === "god_file_candidate")
    .map((e) => `- **${e.file}** — ${e.lines} righe`),
  "",
  "## Dettaglio",
  "",
  ...rows.flatMap((e) => [
    `### ${e.file}`,
    "",
    `Stato: **${e.status}**`,
    "",
    `Chiamato da: ${e.importedBy.length ? e.importedBy.join(", ") : "-"}`,
    "",
    `Importa: ${e.imports.length ? e.imports.join(", ") : "-"}`,
    "",
    `Export: ${e.exports.length ? e.exports.join(", ") : "-"}`,
    "",
    `Numero chiamanti: ${e.callerCount}`,
    "",
    `Numero dipendenze: ${e.dependencyCount}`,
    "",
    `DB read: ${e.tablesRead.length ? e.tablesRead.join(", ") : "-"}`,
    "",
    `DB write: ${e.tablesWritten.length ? e.tablesWritten.join(", ") : "-"}`,
    "",
    `DB update: ${e.tablesUpdated.length ? e.tablesUpdated.join(", ") : "-"}`,
    "",
    `DB delete: ${e.tablesDeleted.length ? e.tablesDeleted.join(", ") : "-"}`,
    "",
  ]),
].join("\n");

fs.writeFileSync(path.join(docsDir, "FILE_USAGE_MAP.md"), md);

console.log("Generated docs/maps/FILE_USAGE_MAP.json");
console.log("Generated docs/maps/FILE_USAGE_MAP.md");
