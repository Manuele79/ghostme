import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SEARCH_DIRS = ["app", "lib", "components", "hooks"];

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
  "user_profiles"
];

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

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

function classifyUsage(content, table) {
  const quoted = String.raw`["'\`]${table}["'\`]`;
  const fromRegex = new RegExp(String.raw`\.from\(\s*${quoted}\s*\)`, "g");

  if (!fromRegex.test(content)) {
    return null;
  }

  const result = {
    reads: false,
    writes: false,
    updates: false,
    deletes: false,
    raw: false
  };

  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    if (!new RegExp(String.raw`\.from\(\s*${quoted}\s*\)`).test(lines[i])) {
      continue;
    }

    const block = lines.slice(i, Math.min(i + 18, lines.length)).join("\n");

    if (/\.select\s*\(/.test(block)) result.reads = true;
    if (/\.insert\s*\(|\.upsert\s*\(/.test(block)) result.writes = true;
    if (/\.update\s*\(/.test(block)) result.updates = true;
    if (/\.delete\s*\(/.test(block)) result.deletes = true;

    if (
      !result.reads &&
      !result.writes &&
      !result.updates &&
      !result.deletes
    ) {
      result.raw = true;
    }
  }

  return result;
}

function statusFor(entry) {
  const hasRead = entry.readers.length > 0;
  const hasWrite =
    entry.writers.length > 0 ||
    entry.updaters.length > 0 ||
    entry.deleters.length > 0;

  if (hasRead && hasWrite) return "alive";
  if (hasRead && !hasWrite) return "read_only";
  if (!hasRead && hasWrite) return "write_only";
  return "unused";
}

const files = SEARCH_DIRS.flatMap(walk);
const map = {};

for (const table of TABLES) {
  map[table] = {
    table,
    readers: [],
    writers: [],
    updaters: [],
    deleters: [],
    rawUsers: [],
    status: "unused"
  };
}

for (const file of files) {
  const rel = path.relative(ROOT, file).replaceAll("\\", "/");
  const content = fs.readFileSync(file, "utf8");

  for (const table of TABLES) {
    const usage = classifyUsage(content, table);
    if (!usage) continue;

    if (usage.reads) map[table].readers.push(rel);
    if (usage.writes) map[table].writers.push(rel);
    if (usage.updates) map[table].updaters.push(rel);
    if (usage.deletes) map[table].deleters.push(rel);
    if (usage.raw) map[table].rawUsers.push(rel);
  }
}

for (const table of TABLES) {
  map[table].readers = [...new Set(map[table].readers)].sort();
  map[table].writers = [...new Set(map[table].writers)].sort();
  map[table].updaters = [...new Set(map[table].updaters)].sort();
  map[table].deleters = [...new Set(map[table].deleters)].sort();
  map[table].rawUsers = [...new Set(map[table].rawUsers)].sort();
  map[table].status = statusFor(map[table]);
}

const docsDir = path.join(ROOT, "docs", "maps");
fs.mkdirSync(docsDir, { recursive: true });

fs.writeFileSync(
  path.join(docsDir, "DATABASE_USAGE_MAP.json"),
  JSON.stringify(map, null, 2)
);

const md = [
  "# DATABASE USAGE MAP",
  "",
  "Mappa statica generata dal codice locale.",
  "",
  "| Tabella | Stato | Lettori | Scrittori | Update | Delete | Raw |",
  "|---|---:|---:|---:|---:|---:|---:|",
  ...Object.values(map).map((entry) => {
    return `| ${entry.table} | ${entry.status} | ${entry.readers.length} | ${entry.writers.length} | ${entry.updaters.length} | ${entry.deleters.length} | ${entry.rawUsers.length} |`;
  }),
  "",
  "## Dettaglio",
  "",
  ...Object.values(map).flatMap((entry) => [
    `### ${entry.table}`,
    "",
    `Stato: **${entry.status}**`,
    "",
    `Readers: ${entry.readers.length ? entry.readers.join(", ") : "-"}`,
    "",
    `Writers: ${entry.writers.length ? entry.writers.join(", ") : "-"}`,
    "",
    `Updaters: ${entry.updaters.length ? entry.updaters.join(", ") : "-"}`,
    "",
    `Deleters: ${entry.deleters.length ? entry.deleters.join(", ") : "-"}`,
    "",
    `Raw users: ${entry.rawUsers.length ? entry.rawUsers.join(", ") : "-"}`,
    ""
  ])
].join("\n");

fs.writeFileSync(path.join(docsDir, "DATABASE_USAGE_MAP.md"), md);

console.log("Generated docs/maps/DATABASE_USAGE_MAP.json");
console.log("Generated docs/maps/DATABASE_USAGE_MAP.md");