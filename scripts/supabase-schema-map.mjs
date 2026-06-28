import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const OUT_MD = path.join(ROOT, "docs/maps/SUPABASE_SCHEMA_MAP.md");
const OUT_JSON = path.join(ROOT, "docs/state/SUPABASE_SCHEMA_MAP.json");

const CODE_DIRS = ["app", "lib", "components", "hooks", "scripts"];
const SOURCE_EXT = /\.(ts|tsx|js|jsx|mjs)$/;

const KNOWN_SCHEMA = {
  observation_events: [
    "id",
    "user_id",
    "event_type",
    "source",
    "place_label",
    "place_id",
    "value",
    "context",
    "occurred_at",
    "created_at",
  ],
  user_location_state: [
    "user_id",
    "current_place_id",
    "current_place_label",
    "latitude",
    "longitude",
    "source",
    "updated_at",
    "place_category",
    "address",
    "accuracy",
    "last_changed_at",
    "confidence",
  ],
  house_patterns: [
    "id",
    "user_id",
    "pattern_type",
    "title",
    "description",
    "confidence",
    "status",
    "occurrences",
    "first_seen_at",
    "last_seen_at",
    "updated_at",
  ],
  house_suggestions: [
    "id",
    "user_id",
    "title",
    "message",
    "suggestion_type",
    "room_key",
    "confidence",
    "status",
    "created_at",
  ],
  autobiographical_timeline: [
    "id",
    "user_id",
    "title",
    "summary",
    "description",
    "event_type",
    "event_date",
    "period_label",
    "topic",
    "entity_type",
    "emotional_tone",
    "importance",
    "weight",
    "mention_count",
    "last_mentioned_at",
    "related_topics",
  ],
  ghost_proactive_messages: [
    "id",
    "user_id",
    "category",
    "source",
    "logical_key",
    "priority",
    "status",
    "title",
    "message",
    "scheduled_for",
    "created_at",
    "updated_at",
  ],
};

function walk(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];

  const out = [];

  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const p = path.join(full, entry.name);

    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "dist", "build"].includes(entry.name)) continue;
      out.push(...walk(path.relative(ROOT, p)));
    } else if (SOURCE_EXT.test(entry.name)) {
      out.push(p);
    }
  }

  return out;
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))].sort();
}

function cleanColumn(raw) {
  if (!raw) return null;

  let c = String(raw).trim();
  c = c.replace(/\s+/g, "");
  c = c.replace(/^["'`]+|["'`]+$/g, "");

  if (!c || c === "*") return c || null;

  if (["true", "false", "null", "undefined", "exact"].includes(c)) return null;

  if (/[{};]/.test(c)) return null;
  if (c.includes("=>")) return null;
  if (c.includes("await")) return null;
  if (c.includes("const")) return null;
  if (c.includes("return")) return null;
  if (c.length > 80) return null;

  if (c.includes(":")) {
    const parts = c.split(":");
    c = parts[parts.length - 1];
  }

  c = c.replace(/\(.*/, "");

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c)) return null;

  return c;
}

function parseSelectColumns(selectText) {
  if (!selectText) return [];
  if (selectText.includes("*")) return ["*"];

  return unique(
    selectText
      .split(",")
      .map(cleanColumn)
      .filter(Boolean)
  );
}

function extractObjectKeys(text) {
  if (!text) return [];
  const keys = [];
  const regex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
  let match;

  while ((match = regex.exec(text))) {
    keys.push(match[1]);
  }

  return unique(keys);
}

function ensureTable(map, tableName) {
  if (!map[tableName]) {
    map[tableName] = {
      table: tableName,
      realColumns: KNOWN_SCHEMA[tableName] ?? [],
      readers: [],
      writers: [],
      deleters: [],
      selectedColumns: [],
      writtenColumns: [],
      missingColumns: [],
      unusedRealColumns: [],
      neverWrittenRealColumns: [],
      operations: [],
    };
  }

  return map[tableName];
}

function chainFrom(text, index) {
  return text.slice(index, index + 3000);
}

function detectSelect(chain) {
  const match = chain.match(/\.select\(\s*["'`]([\s\S]*?)["'`]\s*\)/);
  return match?.[1] ?? null;
}

function detectWriteColumns(chain) {
  const match = chain.match(/\.(insert|upsert|update)\(\s*([\s\S]*?)\)\s*(?:\.|;|\n)/);
  if (!match) return [];
  return extractObjectKeys(match[2]);
}

const files = CODE_DIRS.flatMap(walk);
const tables = {};

for (const file of files) {
  const rel = path.relative(ROOT, file).replaceAll("\\", "/");
  const text = fs.readFileSync(file, "utf8");

  const fromRegex = /\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  let match;

  while ((match = fromRegex.exec(text))) {
    const tableName = match[1];
    const table = ensureTable(tables, tableName);
    const chain = chainFrom(text, match.index);

    const selectText = detectSelect(chain);
    if (selectText !== null) {
      const cols = parseSelectColumns(selectText);
      table.readers.push(rel);
      table.selectedColumns.push(...cols);
      table.operations.push({ file: rel, operation: "select", columns: cols });
    }

    if (/\.insert\(/.test(chain) || /\.upsert\(/.test(chain) || /\.update\(/.test(chain)) {
      const cols = detectWriteColumns(chain);
      table.writers.push(rel);
      table.writtenColumns.push(...cols);
      table.operations.push({ file: rel, operation: "write", columns: cols });
    }

    if (/\.delete\(/.test(chain)) {
      table.deleters.push(rel);
      table.operations.push({ file: rel, operation: "delete", columns: [] });
    }
  }

  const rpcRegex = /\.rpc\(\s*["'`]([^"'`]+)["'`]\s*/g;
  while ((match = rpcRegex.exec(text))) {
    const rpcName = `rpc:${match[1]}`;
    const table = ensureTable(tables, rpcName);
    table.writers.push(rel);
    table.operations.push({ file: rel, operation: "rpc", columns: [] });
  }
}

for (const table of Object.values(tables)) {
  table.readers = unique(table.readers);
  table.writers = unique(table.writers);
  table.deleters = unique(table.deleters);
  table.selectedColumns = unique(table.selectedColumns);
  table.writtenColumns = unique(table.writtenColumns);

  const real = table.realColumns;

  if (real.length) {
    table.missingColumns = table.selectedColumns.filter(
      (col) => col !== "*" && !real.includes(col)
    );

    table.unusedRealColumns = real.filter(
      (col) => !table.selectedColumns.includes(col) && !table.selectedColumns.includes("*")
    );

    table.neverWrittenRealColumns = real.filter(
      (col) => !table.writtenColumns.includes(col)
    );
  }

  table.readOnly = table.readers.length > 0 && table.writers.length === 0;
  table.writeOnly = table.writers.length > 0 && table.readers.length === 0;
}

const sorted = Object.values(tables).sort((a, b) => a.table.localeCompare(b.table));

const json = {
  generatedAt: new Date().toISOString(),
  version: "3",
  note:
    "Generated from source code and partial known real schema. Maps Supabase table/RPC usage, selected/written columns, missing columns, and data flow hints.",
  knownSchemaTables: Object.keys(KNOWN_SCHEMA).sort(),
  tables: sorted,
  warnings: {
    missingColumns: sorted
      .filter((t) => t.missingColumns.length)
      .map((t) => ({ table: t.table, columns: t.missingColumns })),
    readOnly: sorted.filter((t) => t.readOnly).map((t) => t.table),
    writeOnly: sorted.filter((t) => t.writeOnly).map((t) => t.table),
  },
};

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2));

let md = `# SUPABASE_SCHEMA_MAP V3\n\n`;
md += `Generated: ${json.generatedAt}\n\n`;
md += `> Mappa generata dal codice + schema reale noto parziale. Serve per capire chi legge/scrive ogni tabella e trovare query verso colonne inesistenti.\n\n`;

md += `## Riepilogo\n\n`;
md += `| Tabella/RPC | Reader | Writer | Delete | Colonne reali note | Colonne lette | Colonne scritte | Warning |\n`;
md += `|---|---:|---:|---:|---:|---:|---:|---|\n`;

for (const t of sorted) {
  const warnings = [];
  if (t.readOnly) warnings.push("read-only");
  if (t.writeOnly) warnings.push("write-only");
  if (t.missingColumns.length) warnings.push(`missing: ${t.missingColumns.join(", ")}`);

  md += `| ${t.table} | ${t.readers.length} | ${t.writers.length} | ${t.deleters.length} | ${t.realColumns.length} | ${t.selectedColumns.length} | ${t.writtenColumns.length} | ${warnings.join("; ") || "-"} |\n`;
}

md += `\n## Warning principali\n\n`;

md += `### Query verso colonne probabilmente inesistenti\n\n`;
const missing = sorted.filter((t) => t.missingColumns.length);
if (missing.length) {
  for (const t of missing) {
    md += `- **${t.table}**: ${t.missingColumns.join(", ")}\n`;
  }
} else {
  md += `- Nessuna rilevata nelle tabelle con schema noto\n`;
}

md += `\n### Tabelle lette ma mai scritte\n\n`;
const readOnly = sorted.filter((t) => t.readOnly);
if (readOnly.length) {
  for (const t of readOnly) md += `- ${t.table}\n`;
} else {
  md += `- Nessuna\n`;
}

md += `\n### Tabelle scritte ma mai lette\n\n`;
const writeOnly = sorted.filter((t) => t.writeOnly);
if (writeOnly.length) {
  for (const t of writeOnly) md += `- ${t.table}\n`;
} else {
  md += `- Nessuna\n`;
}

md += `\n## Dettaglio Tabelle/RPC\n\n`;

for (const t of sorted) {
  md += `### ${t.table}\n\n`;

  md += `**Colonne reali note**\n\n`;
  if (t.realColumns.length) {
    for (const c of t.realColumns) md += `- ${c}\n`;
  } else {
    md += `- Schema reale non ancora registrato nello script\n`;
  }

  md += `\n**Reader**\n\n`;
  if (t.readers.length) {
    for (const f of t.readers) md += `- ${f}\n`;
  } else {
    md += `- Nessuno rilevato\n`;
  }

  md += `\n**Writer**\n\n`;
  if (t.writers.length) {
    for (const f of t.writers) md += `- ${f}\n`;
  } else {
    md += `- Nessuno rilevato\n`;
  }

  md += `\n**Delete**\n\n`;
  if (t.deleters.length) {
    for (const f of t.deleters) md += `- ${f}\n`;
  } else {
    md += `- Nessuno rilevato\n`;
  }

  md += `\n**Colonne lette nei select**\n\n`;
  if (t.selectedColumns.length) {
    for (const c of t.selectedColumns) md += `- ${c}\n`;
  } else {
    md += `- Nessuna colonna specifica rilevata\n`;
  }

  md += `\n**Colonne scritte rilevate**\n\n`;
  if (t.writtenColumns.length) {
    for (const c of t.writtenColumns) md += `- ${c}\n`;
  } else {
    md += `- Nessuna colonna scritta rilevata automaticamente\n`;
  }

  if (t.missingColumns.length) {
    md += `\n**ERRORE: colonne richieste ma non presenti nello schema noto**\n\n`;
    for (const c of t.missingColumns) md += `- ${c}\n`;
  }

  if (t.unusedRealColumns.length) {
    md += `\n**Colonne reali note non lette direttamente**\n\n`;
    for (const c of t.unusedRealColumns) md += `- ${c}\n`;
  }

  if (t.neverWrittenRealColumns.length) {
    md += `\n**Colonne reali note non scritte direttamente**\n\n`;
    for (const c of t.neverWrittenRealColumns) md += `- ${c}\n`;
  }

  md += `\n**Operazioni rilevate**\n\n`;
  if (t.operations.length) {
    for (const op of t.operations) {
      md += `- ${op.operation} — ${op.file}`;
      if (op.columns?.length) md += ` — colonne: ${op.columns.join(", ")}`;
      md += `\n`;
    }
  } else {
    md += `- Nessuna operazione rilevata\n`;
  }

  md += `\n`;
}

md += `## Note V3\n\n`;
md += `Questa V3 usa uno schema reale noto parziale scritto nello script. Per renderla definitiva, aggiungere tutte le colonne reali Supabase in KNOWN_SCHEMA oppure creare una query di esportazione schema dal DB.\n`;

fs.writeFileSync(OUT_MD, md);

console.log("Generated docs/maps/SUPABASE_SCHEMA_MAP.md");
console.log("Generated docs/state/SUPABASE_SCHEMA_MAP.json");