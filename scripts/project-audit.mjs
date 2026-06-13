import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT_MD = path.join(ROOT, "PROJECT_AUDIT.md");
const OUT_JSON = path.join(ROOT, "PROJECT_AUDIT.json");

const INCLUDE_EXT = [".ts", ".tsx", ".js", ".jsx"];
const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".vercel",
]);

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
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return rel(c);
  }

  return imp;
}

const files = walk(ROOT);
const fileSet = new Set(files.map(rel));

const analysis = {
  files: {},
  tables: {},
  apiRoutes: [],
  possibleDeadFiles: [],
  exportedFunctions: {},
  importsGraph: {},
  importedBy: {},
};

for (const file of files) {
  const r = rel(file);
  const code = read(file);

  const imports = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map((m) =>
    resolveImport(file, m[1])
  );

  const dynamicImports = [...code.matchAll(/import\(["']([^"']+)["']\)/g)].map(
    (m) => resolveImport(file, m[1])
  );

  const allImports = [...new Set([...imports, ...dynamicImports])];

  const tablesRead = [
    ...code.matchAll(/\.from\(["']([^"']+)["']\)/g),
  ].map((m) => m[1]);

  const inserts = [...code.matchAll(/\.from\(["']([^"']+)["']\)[\s\S]{0,250}\.insert/g)].map(
    (m) => m[1]
  );

  const updates = [...code.matchAll(/\.from\(["']([^"']+)["']\)[\s\S]{0,250}\.update/g)].map(
    (m) => m[1]
  );

  const deletes = [...code.matchAll(/\.from\(["']([^"']+)["']\)[\s\S]{0,250}\.delete/g)].map(
    (m) => m[1]
  );

  const exported = [
    ...code.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g),
  ].map((m) => m[1]);

  analysis.files[r] = {
    imports: allImports,
    tablesUsed: [...new Set(tablesRead)],
    tablesInserted: [...new Set(inserts)],
    tablesUpdated: [...new Set(updates)],
    tablesDeleted: [...new Set(deletes)],
    exportedFunctions: exported,
  };

  analysis.importsGraph[r] = allImports;

  for (const imp of allImports) {
    if (!analysis.importedBy[imp]) analysis.importedBy[imp] = [];
    analysis.importedBy[imp].push(r);
  }

  for (const table of tablesRead) {
    if (!analysis.tables[table]) {
      analysis.tables[table] = {
        readBy: [],
        insertedBy: [],
        updatedBy: [],
        deletedBy: [],
      };
    }

    analysis.tables[table].readBy.push(r);
  }

  for (const table of inserts) {
    if (!analysis.tables[table]) {
      analysis.tables[table] = {
        readBy: [],
        insertedBy: [],
        updatedBy: [],
        deletedBy: [],
      };
    }

    analysis.tables[table].insertedBy.push(r);
  }

  for (const table of updates) {
    if (!analysis.tables[table]) {
      analysis.tables[table] = {
        readBy: [],
        insertedBy: [],
        updatedBy: [],
        deletedBy: [],
      };
    }

    analysis.tables[table].updatedBy.push(r);
  }

  for (const table of deletes) {
    if (!analysis.tables[table]) {
      analysis.tables[table] = {
        readBy: [],
        insertedBy: [],
        updatedBy: [],
        deletedBy: [],
      };
    }

    analysis.tables[table].deletedBy.push(r);
  }

  if (r.startsWith("app/api/") && r.endsWith("route.ts")) {
    analysis.apiRoutes.push(r);
  }

  if (exported.length) {
    analysis.exportedFunctions[r] = exported;
  }
}

for (const r of fileSet) {
  const isEntry =
    r.startsWith("app/") ||
    r.startsWith("pages/") ||
    r.includes("route.ts") ||
    r.includes("page.tsx") ||
    r.includes("layout.tsx");

  const imported = analysis.importedBy[r]?.length > 0;

  if (!isEntry && !imported) {
    analysis.possibleDeadFiles.push(r);
  }
}

function list(items) {
  if (!items?.length) return "- nessuno";
  return items.map((x) => `- ${x}`).join("\n");
}

let md = `# PROJECT AUDIT

Generato automaticamente.

## API routes

${list(analysis.apiRoutes)}

## Tabelle Supabase usate

`;

for (const [table, data] of Object.entries(analysis.tables).sort()) {
  md += `### ${table}

**Lettura**
${list([...new Set(data.readBy)])}

**Insert**
${list([...new Set(data.insertedBy)])}

**Update**
${list([...new Set(data.updatedBy)])}

**Delete**
${list([...new Set(data.deletedBy)])}

`;
}

md += `## File potenzialmente scollegati

${list(analysis.possibleDeadFiles)}

## Mappa import principali

`;

for (const [file, imports] of Object.entries(analysis.importsGraph).sort()) {
  if (!file.startsWith("lib/ghostme") && !file.startsWith("app/api")) continue;

  md += `### ${file}

Importa:
${list(imports)}

Importato da:
${list(analysis.importedBy[file] || [])}

`;
}

fs.writeFileSync(OUT_JSON, JSON.stringify(analysis, null, 2));
fs.writeFileSync(OUT_MD, md);

console.log("Creati:");
console.log("- PROJECT_AUDIT.md");
console.log("- PROJECT_AUDIT.json");