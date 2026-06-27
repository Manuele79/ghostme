import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT_MD = path.join(ROOT, "docs/maps/SUPABASE_SCHEMA_MAP.md");
const OUT_JSON = path.join(ROOT, "docs/state/SUPABASE_SCHEMA_MAP.json");

const CODE_DIRS = ["app", "lib", "components", "hooks", "scripts"];

function walk(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const p = path.join(full, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      out.push(...walk(path.relative(ROOT, p)));
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

function unique(arr) {
  return [...new Set(arr)].sort();
}

const files = CODE_DIRS.flatMap(walk);
const tables = {};

function ensureTable(name) {
  if (!tables[name]) {
    tables[name] = {
      table: name,
      readers: [],
      writers: [],
      deleters: [],
      selectedColumns: [],
      writtenColumns: [],
      obsoleteColumnCandidates: [],
    };
  }
  return tables[name];
}

function parseColumns(selectText) {
  if (!selectText || selectText.includes("*")) return ["*"];
  return selectText
    .split(",")
    .map(s => s.trim())
    .map(s => s.split(":").pop()?.trim() || s.trim())
    .map(s => s.replace(/\(.*/, "").trim())
    .filter(Boolean);
}

for (const file of files) {
  const rel = path.relative(ROOT, file).replaceAll("\\", "/");
  const txt = fs.readFileSync(file, "utf8");

  const fromRegex = /\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  let match;

  while ((match = fromRegex.exec(txt))) {
    const tableName = match[1];
    const t = ensureTable(tableName);

    const slice = txt.slice(match.index, match.index + 1500);

    if (/\.select\(/.test(slice)) {
      t.readers.push(rel);

      const selectMatch = slice.match(/\.select\(\s*["'`]([\s\S]*?)["'`]\s*\)/);
      if (selectMatch) {
        t.selectedColumns.push(...parseColumns(selectMatch[1]));
      }
    }

    if (/\.insert\(|\.upsert\(|\.update\(/.test(slice)) {
      t.writers.push(rel);
    }

    if (/\.delete\(/.test(slice)) {
      t.deleters.push(rel);
    }
  }

  const rpcRegex = /\.rpc\(\s*["'`]([^"'`]+)["'`]\s*/g;
  while ((match = rpcRegex.exec(txt))) {
    const rpcName = `rpc:${match[1]}`;
    const t = ensureTable(rpcName);
    t.writers.push(rel);
  }
}

for (const t of Object.values(tables)) {
  t.readers = unique(t.readers);
  t.writers = unique(t.writers);
  t.deleters = unique(t.deleters);
  t.selectedColumns = unique(t.selectedColumns).filter(c => c !== "");
  t.writtenColumns = unique(t.writtenColumns);
}

const sorted = Object.values(tables).sort((a, b) => a.table.localeCompare(b.table));

const json = {
  generatedAt: new Date().toISOString(),
  note: "Generated from code usage. This map detects Supabase table/RPC usage and selected columns from source files.",
  tables: sorted,
  orphanLike: sorted.filter(t => t.readers.length === 0 || t.writers.length === 0),
};

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2));

let md = `# SUPABASE_SCHEMA_MAP\n\n`;
md += `Generated: ${json.generatedAt}\n\n`;
md += `> Nota: questa mappa è generata dal codice. Mostra chi legge/scrive tabelle Supabase e quali colonne vengono richieste nei select.\n\n`;

md += `## Riepilogo\n\n`;
md += `| Tabella/RPC | Reader | Writer | Delete | Colonne lette |\n`;
md += `|---|---:|---:|---:|---:|\n`;

for (const t of sorted) {
  md += `| ${t.table} | ${t.readers.length} | ${t.writers.length} | ${t.deleters.length} | ${t.selectedColumns.length} |\n`;
}

md += `\n## Tabelle / RPC con possibile problema\n\n`;
for (const t of sorted) {
  if (t.readers.length === 0 || t.writers.length === 0) {
    md += `- **${t.table}** — reader: ${t.readers.length}, writer: ${t.writers.length}\n`;
  }
}

md += `\n## Dettaglio\n\n`;

for (const t of sorted) {
  md += `### ${t.table}\n\n`;

  md += `**Reader**\n\n`;
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
    md += t.selectedColumns.map(c => `- ${c}`).join("\n") + "\n";
  } else {
    md += `- Nessuna colonna specifica rilevata\n`;
  }

  md += `\n`;
}

fs.writeFileSync(OUT_MD, md);

console.log("Generated docs/maps/SUPABASE_SCHEMA_MAP.md");
console.log("Generated docs/state/SUPABASE_SCHEMA_MAP.json");