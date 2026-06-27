import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const OUT_MD = path.join(ROOT, "docs", "audits", "PROJECT_AUDIT_FULL.md");
const OUT_JSON = path.join(ROOT, "docs", "state", "PROJECT_AUDIT_FULL.json");
const LEGACY_OUT_MD = path.join(ROOT, "docs", "audits", "PROJECT_AUDIT.md");
const LEGACY_OUT_JSON = path.join(ROOT, "docs", "state", "PROJECT_AUDIT.json");
const ROOT_OUT_MD = path.join(ROOT, "PROJECT_AUDIT_FULL.md");
const ROOT_OUT_JSON = path.join(ROOT, "PROJECT_AUDIT_FULL.json");

const INCLUDE_EXT = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".vercel",
]);

const TABLE_METHODS = ["select", "insert", "update", "upsert", "delete"];

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(item.name)) continue;

    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      walk(full, files);
    } else if (INCLUDE_EXT.includes(path.extname(item.name))) {
      files.push(full);
    }
  }

  return files;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function resolveImport(fromFile, imp) {
  if (!imp.startsWith(".") && !imp.startsWith("@/")) return imp;

  let base;

  if (imp.startsWith("@/")) {
    base = path.join(ROOT, imp.slice(2));
  } else {
    base = path.resolve(path.dirname(fromFile), imp);
  }

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return rel(c);
  }

  return imp;
}

function getFolder(file) {
  const parts = file.split("/");
  parts.pop();
  return parts.join("/") || ".";
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function list(items) {
  if (!items?.length) return "- nessuno";
  return uniq(items).map((x) => `- ${x}`).join("\n");
}

function extractSupabaseOps(code) {
  const ops = {};

  const fromMatches = [...code.matchAll(/\.from\(["']([^"']+)["']\)/g)];

  for (const match of fromMatches) {
    const table = match[1];
    const start = match.index || 0;
    const chunk = code.slice(start, start + 900);

    if (!ops[table]) {
      ops[table] = {
        select: false,
        insert: false,
        update: false,
        upsert: false,
        delete: false,
      };
    }

    for (const method of TABLE_METHODS) {
      if (new RegExp(`\\.${method}\\s*\\(`).test(chunk)) {
        ops[table][method] = true;
      }
    }
  }

  return ops;
}

function extractApiCalls(code) {
  return uniq(
    [...code.matchAll(/fetch\(["'`]([^"'`]+)["'`]/g)].map((m) => m[1])
  );
}

function extractExports(code) {
  return uniq([
    ...[...code.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]),
    ...[...code.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]),
  ]);
}

function extractFunctionCalls(code) {
  return uniq(
    [...code.matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)]
      .map((m) => m[1])
      .filter(
        (name) =>
          ![
            "if",
            "for",
            "while",
            "switch",
            "catch",
            "function",
            "return",
            "map",
            "filter",
            "reduce",
            "forEach",
            "console",
            "String",
            "Number",
            "Date",
            "JSON",
          ].includes(name)
      )
  );
}

const filesAbs = walk(ROOT);
const files = filesAbs.map(rel);
const fileSet = new Set(files);

const analysis = {
  generatedAt: new Date().toISOString(),
  folders: {},
  files: {},
  importsGraph: {},
  importedBy: {},
  apiRoutes: [],
  apiCalls: {},
  tables: {},
  exportedFunctions: {},
  functionUsage: {},
  possibleDeadFiles: [],
  possibleDeadExports: [],
  suspiciousDebugRoutes: [],
  duplicateFileNames: {},
};

for (const abs of filesAbs) {
  const file = rel(abs);
  const code = read(abs);
  const folder = getFolder(file);

  if (!analysis.folders[folder]) analysis.folders[folder] = [];
  analysis.folders[folder].push(file);

  const imports = uniq([
    ...[...code.matchAll(/from\s+["']([^"']+)["']/g)].map((m) =>
      resolveImport(abs, m[1])
    ),
    ...[...code.matchAll(/import\(["']([^"']+)["']\)/g)].map((m) =>
      resolveImport(abs, m[1])
    ),
  ]);

  analysis.importsGraph[file] = imports;

  for (const imp of imports) {
    if (!analysis.importedBy[imp]) analysis.importedBy[imp] = [];
    analysis.importedBy[imp].push(file);
  }

  const tableOps = extractSupabaseOps(code);
  const apiCalls = extractApiCalls(code);
  const exports = extractExports(code);
  const calls = extractFunctionCalls(code);

  analysis.files[file] = {
    folder,
    imports,
    importedBy: [],
    apiCalls,
    tables: tableOps,
    exports,
    calls,
    lines: code.split("\n").length,
  };

  if (file.startsWith("app/api/") && file.endsWith("route.ts")) {
    analysis.apiRoutes.push(file);
  }

  if (
    file.startsWith("app/api/debug") ||
    file.startsWith("app/api/test") ||
    file.includes("/debug-") ||
    file.includes("/test-")
  ) {
    analysis.suspiciousDebugRoutes.push(file);
  }

  for (const [table, ops] of Object.entries(tableOps)) {
    if (!analysis.tables[table]) {
      analysis.tables[table] = {
        readBy: [],
        insertedBy: [],
        updatedBy: [],
        upsertedBy: [],
        deletedBy: [],
      };
    }

    if (ops.select) analysis.tables[table].readBy.push(file);
    if (ops.insert) analysis.tables[table].insertedBy.push(file);
    if (ops.update) analysis.tables[table].updatedBy.push(file);
    if (ops.upsert) analysis.tables[table].upsertedBy.push(file);
    if (ops.delete) analysis.tables[table].deletedBy.push(file);
  }

  if (exports.length) {
    analysis.exportedFunctions[file] = exports;
  }

  for (const fn of exports) {
    if (!analysis.functionUsage[fn]) {
      analysis.functionUsage[fn] = {
        exportedBy: [],
        calledBy: [],
      };
    }
    analysis.functionUsage[fn].exportedBy.push(file);
  }

for (const call of calls) {
  if (!analysis.functionUsage[call]) {
    analysis.functionUsage[call] = {
      exportedBy: [],
      calledBy: [],
    };
  }

  if (!analysis.functionUsage[call].calledBy) {
    analysis.functionUsage[call].calledBy = [];
  }

  analysis.functionUsage[call].calledBy.push(file);
}

  for (const call of apiCalls) {
    if (!analysis.apiCalls[call]) analysis.apiCalls[call] = [];
    analysis.apiCalls[call].push(file);
  }
}

for (const file of files) {
  analysis.files[file].importedBy = analysis.importedBy[file] || [];

  const isEntry =
    file.startsWith("app/") ||
    file.startsWith("pages/") ||
    file.includes("route.ts") ||
    file.includes("page.tsx") ||
    file.includes("layout.tsx") ||
    file.startsWith("scripts/") ||
    file === "next.config.ts" ||
    file === "next-env.d.ts";

  const imported = (analysis.importedBy[file] || []).length > 0;

  if (!isEntry && !imported) {
    analysis.possibleDeadFiles.push(file);
  }
}

for (const [fn, usage] of Object.entries(analysis.functionUsage)) {
  if (usage.exportedBy.length && !usage.calledBy.length) {
    analysis.possibleDeadExports.push({
      function: fn,
      exportedBy: usage.exportedBy,
    });
  }
}

const names = {};
for (const file of files) {
  const name = path.basename(file);
  if (!names[name]) names[name] = [];
  names[name].push(file);
}

for (const [name, paths] of Object.entries(names)) {
  if (paths.length > 1) {
    analysis.duplicateFileNames[name] = paths;
  }
}

let md = `# PROJECT AUDIT FULL

Generato: ${analysis.generatedAt}

# 1. RIASSUNTO

- File analizzati: ${files.length}
- Cartelle: ${Object.keys(analysis.folders).length}
- API routes: ${analysis.apiRoutes.length}
- Tabelle Supabase usate: ${Object.keys(analysis.tables).length}
- File potenzialmente scollegati: ${analysis.possibleDeadFiles.length}
- Export potenzialmente non usati: ${analysis.possibleDeadExports.length}
- Rotte debug/test: ${analysis.suspiciousDebugRoutes.length}

---

# 2. CARTELLE

`;

for (const [folder, folderFiles] of Object.entries(analysis.folders).sort()) {
  md += `## ${folder}\n\n${list(folderFiles)}\n\n`;
}

md += `---

# 3. API ROUTES

${list(analysis.apiRoutes)}

---

# 4. API CHIAMATE DAL FRONT / CODICE

`;

for (const [api, callers] of Object.entries(analysis.apiCalls).sort()) {
  md += `## ${api}\n\nChiamata da:\n${list(callers)}\n\n`;
}

md += `---

# 5. TABELLE SUPABASE

`;

for (const [table, data] of Object.entries(analysis.tables).sort()) {
  md += `## ${table}

### Read
${list(data.readBy)}

### Insert
${list(data.insertedBy)}

### Update
${list(data.updatedBy)}

### Upsert
${list(data.upsertedBy)}

### Delete
${list(data.deletedBy)}

`;
}

md += `---

# 6. FILE POTENZIALMENTE SCOLLEGATI

${list(analysis.possibleDeadFiles)}

---

# 7. EXPORT POTENZIALMENTE NON USATI

`;

if (!analysis.possibleDeadExports.length) {
  md += "- nessuno\n\n";
} else {
  for (const item of analysis.possibleDeadExports) {
    md += `- ${item.function} esportata da ${item.exportedBy.join(", ")}\n`;
  }
}

md += `

---

# 8. ROTTE DEBUG / TEST DA CONTROLLARE

${list(analysis.suspiciousDebugRoutes)}

---

# 9. NOMI FILE DUPLICATI

`;

for (const [name, paths] of Object.entries(analysis.duplicateFileNames).sort()) {
  md += `## ${name}\n${list(paths)}\n\n`;
}

md += `---

# 10. MAPPA FILE PRINCIPALI

`;

for (const [file, data] of Object.entries(analysis.files).sort()) {
  if (
    !file.startsWith("lib/ghostme") &&
    !file.startsWith("app/api") &&
    !file.startsWith("components/ghost") &&
    !file.startsWith("hooks")
  ) {
    continue;
  }

  md += `## ${file}

Righe: ${data.lines}

### Importa
${list(data.imports)}

### Importato da
${list(data.importedBy)}

### API chiamate
${list(data.apiCalls)}

### Export
${list(data.exports)}

### Tabelle
${Object.keys(data.tables).length ? Object.entries(data.tables)
    .map(([t, ops]) => {
      const active = Object.entries(ops)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ");
      return `- ${t}: ${active}`;
    })
    .join("\n") : "- nessuna"}

`;
}

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

const json = JSON.stringify(analysis, null, 2);
fs.writeFileSync(OUT_JSON, json);
fs.writeFileSync(OUT_MD, md);
fs.writeFileSync(LEGACY_OUT_JSON, json);
fs.writeFileSync(LEGACY_OUT_MD, md);
fs.writeFileSync(ROOT_OUT_JSON, json);
fs.writeFileSync(ROOT_OUT_MD, md);

console.log("Creati:");
console.log("- docs/audits/PROJECT_AUDIT_FULL.md");
console.log("- docs/state/PROJECT_AUDIT_FULL.json");
console.log("- docs/audits/PROJECT_AUDIT.md");
console.log("- docs/state/PROJECT_AUDIT.json");
