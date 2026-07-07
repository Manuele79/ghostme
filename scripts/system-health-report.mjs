import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const SEARCH_DIRS = ["app", "components", "hooks", "lib"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const OUTPUT_MD = path.join(ROOT, "docs", "health", "SYSTEM_HEALTH_REPORT.md");
const OUTPUT_JSON = path.join(ROOT, "docs", "state", "SYSTEM_HEALTH_REPORT.json");
const SCHEMA_CSV = path.join(ROOT, "external", "supabase-schema", "tables_columns.csv");
const FUNCTIONS_CSV = path.join(ROOT, "external", "supabase-schema", "functions.csv");
const DB_USAGE_JSON = path.join(ROOT, "docs", "maps", "DATABASE_USAGE_MAP.json");
const FILE_USAGE_JSON = path.join(ROOT, "docs", "maps", "FILE_USAGE_MAP.json");

const HEALTH_LABELS = [
  { min: 85, label: "\uD83D\uDFE2 Ottimo" },
  { min: 70, label: "\uD83D\uDFE1 Buono" },
  { min: 50, label: "\uD83D\uDFE0 Da migliorare" },
  { min: 0, label: "\uD83D\uDD34 Critico" },
];

const CORE_FLOWS = {
  homeAssistant: [
    "house_events",
    "house_entities",
    "house_patterns",
    "house_suggestions",
    "house_learned_rules",
    "house_automation_controls",
  ],
  location: [
    "user_location_state",
    "significant_places",
    "observation_events",
  ],
  people: [
    "people_graph",
    "people_graph_links",
    "topic_links",
    "episodic_memories",
    "conversation_summaries",
  ],
  memory: [
    "memories_active",
    "episodic_memories",
    "life_topics",
    "autobiographical_timeline",
    "dynamic_self_profile",
    "conversation_summaries",
    "goals_desires",
    "action_intents",
  ],
  proactive: ["ghost_proactive_messages"],
};

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function csvRows(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const headers = splitCsvLine(lines.shift() || "");
  return lines
    .map((line) => splitCsvLine(line))
    .filter((cols) => cols.length === headers.length)
    .map((cols) => Object.fromEntries(headers.map((header, index) => [header, cols[index]])));
}

function splitCsvLine(line) {
  const out = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i++;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      out.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  out.push(current);
  return out;
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function walk(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];

  const out = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const fullPath = path.join(full, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(path.relative(ROOT, fullPath)));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(fullPath);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function loadSchema() {
  const rows = csvRows(SCHEMA_CSV);
  const tables = {};
  for (const row of rows) {
    const table = row.table_name;
    if (!tables[table]) {
      tables[table] = { table, columns: {}, columnNames: [] };
    }
    tables[table].columns[row.column_name] = {
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === "YES",
      default: row.column_default,
      ordinal: Number(row.ordinal_position || 0),
    };
    tables[table].columnNames.push(row.column_name);
  }
  for (const table of Object.values(tables)) {
    table.columnNames.sort((a, b) => table.columns[a].ordinal - table.columns[b].ordinal);
  }
  return tables;
}

function loadRpcs() {
  return csvRows(FUNCTIONS_CSV).map((row) => row.routine_name).filter(Boolean);
}

function collectImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:type\s+)?(?:([^'"]+?)\s+from\s+)?["']([^"']+)["']/g;
  const requireRegex = /require\(["']([^"']+)["']\)/g;

  for (const match of content.matchAll(importRegex)) {
    imports.push({ raw: match[0], spec: match[2], clause: match[1] || "", typeOnly: /import\s+type/.test(match[0]) });
  }
  for (const match of content.matchAll(requireRegex)) {
    imports.push({ raw: match[0], spec: match[1], clause: "", typeOnly: false });
  }
  return imports;
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
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return rel(candidate);
  }
  return null;
}

function buildFileGraph(files) {
  const graph = {};
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const fileRel = rel(file);
    const imports = collectImports(content);
    const resolved = imports.map((entry) => resolveImport(file, entry.spec)).filter(Boolean);
    graph[fileRel] = {
      file: fileRel,
      imports: [...new Set(resolved)].sort(),
      importedBy: [],
      status: fileRel.startsWith("app/") ? "entrypoint" : "module",
      content,
    };
  }
  for (const [file, entry] of Object.entries(graph)) {
    for (const target of entry.imports) {
      if (graph[target]) graph[target].importedBy.push(file);
    }
  }
  for (const entry of Object.values(graph)) {
    entry.importedBy = [...new Set(entry.importedBy)].sort();
  }
  return graph;
}

function detectCycles(graph) {
  const cycles = [];
  const stack = [];
  const inStack = new Set();
  const visited = new Set();

  function visit(node) {
    if (inStack.has(node)) {
      const start = stack.indexOf(node);
      const cycle = stack.slice(start).concat(node);
      const key = cycle.join(">");
      if (!cycles.some((item) => item.key === key)) cycles.push({ key, cycle });
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    inStack.add(node);
    stack.push(node);
    for (const target of graph[node]?.imports || []) {
      if (graph[target]) visit(target);
    }
    stack.pop();
    inStack.delete(node);
  }

  for (const node of Object.keys(graph)) visit(node);
  return cycles.slice(0, 50).map((item) => item.cycle);
}

function importedIdentifiers(importEntry) {
  const clause = importEntry.clause || "";
  const names = [];
  const named = clause.match(/\{([\s\S]*?)\}/);
  if (named) {
    for (const part of named[1].split(",")) {
      const alias = part.split(/\s+as\s+/).pop()?.trim();
      if (alias) names.push(alias);
    }
  }
  const withoutNamed = clause.replace(/\{[\s\S]*?\}/, "").replace(/\*\s+as\s+([A-Za-z0-9_]+)/, "$1");
  for (const part of withoutNamed.split(",")) {
    const name = part.trim();
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) names.push(name);
  }
  return [...new Set(names)];
}

function detectUnusedImports(files) {
  const results = [];
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const codeWithoutImports = content.replace(/^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "");
    for (const entry of collectImports(content)) {
      if (entry.typeOnly) continue;
      const unused = importedIdentifiers(entry).filter((name) => {
        const regex = new RegExp(String.raw`\b${name}\b`, "g");
        return (codeWithoutImports.match(regex) || []).length === 0;
      });
      if (unused.length) {
        results.push({ file: rel(file), import: entry.spec, identifiers: unused });
      }
    }
  }
  return results.slice(0, 100);
}

function extractSelectColumns(selectBody) {
  return selectBody
    .split(",")
    .map((part) => part.trim())
    .map((part) => part.replace(/["'`]/g, ""))
    .map((part) => part.split(":").pop().trim())
    .map((part) => part.split(/\s+/)[0])
    .map((part) => part.replace(/[!()]/g, ""))
    .filter((part) => part && part !== "*" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(part));
}

function readFirstStringArg(text, startIndex) {
  const paren = text.indexOf("(", startIndex);
  if (paren < 0) return null;
  let index = paren + 1;
  while (index < text.length && /\s/.test(text[index])) index++;
  const quote = text[index];
  if (!["'", '"', "`"].includes(quote)) return null;
  index++;
  let out = "";
  let escape = false;
  for (; index < text.length; index++) {
    const char = text[index];
    if (escape) {
      out += char;
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === quote) return out;
    out += char;
  }
  return null;
}

function topLevelKeysFromFirstObject(text, startIndex) {
  const paren = text.indexOf("(", startIndex);
  if (paren < 0) return [];
  let objectStart = paren + 1;
  while (objectStart < text.length && /\s/.test(text[objectStart])) objectStart++;
  if (text[objectStart] === "[") {
    objectStart++;
    while (objectStart < text.length && /\s/.test(text[objectStart])) objectStart++;
  }
  if (text[objectStart] !== "{") return [];
  if (objectStart < 0) return [];

  const keys = new Set();
  let depth = 0;
  let quote = null;
  let escape = false;
  let token = "";
  let expectKey = true;

  for (let index = objectStart; index < text.length; index++) {
    const char = text[index];

    if (quote) {
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === quote) {
        quote = null;
      }
      if (depth === 1 && expectKey) token += char;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      if (depth === 1 && expectKey) token += char;
      continue;
    }

    if (char === "{") {
      depth++;
      if (depth > 1) expectKey = false;
      continue;
    }

    if (char === "}") {
      if (depth === 1) {
        const key = token.trim().match(/^["'`]?([A-Za-z_][A-Za-z0-9_]*)["'`]?\s*:/)?.[1];
        if (key) keys.add(key);
        return [...keys];
      }
      depth--;
      continue;
    }

    if (depth !== 1) continue;

    if (char === ",") {
      const key = token.trim().match(/^["'`]?([A-Za-z_][A-Za-z0-9_]*)["'`]?\s*:/)?.[1];
      if (key) keys.add(key);
      token = "";
      expectKey = true;
      continue;
    }

    if (char === ":") {
      token += char;
      const key = token.trim().match(/^["'`]?([A-Za-z_][A-Za-z0-9_]*)["'`]?\s*:/)?.[1];
      if (key) keys.add(key);
      expectKey = false;
      continue;
    }

    if (expectKey) token += char;
  }

  return [...keys];
}

function collectDbColumnUsage(files, schema) {
  const usage = {};
  for (const table of Object.keys(schema)) {
    usage[table] = {
      readColumns: new Set(),
      writeColumns: new Set(),
      filterColumns: new Set(),
      invalidColumns: [],
    };
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const fromMatch = lines[i].match(/\.from\(\s*["'`]([A-Za-z0-9_]+)["'`]\s*\)/);
      if (!fromMatch) continue;
      const table = fromMatch[1];
      if (!usage[table]) continue;
      const blockLines = [];
      for (let j = i; j < Math.min(i + 35, lines.length); j++) {
        if (j > i && !lines[j].trim()) break;
        blockLines.push(lines[j]);
        if (/;\s*$/.test(lines[j])) break;
      }
      const block = blockLines.join("\n");
      const valid = schema[table].columns;

      for (const match of block.matchAll(/\.select\(/g)) {
        const selectBody = readFirstStringArg(block, match.index || 0);
        if (!selectBody) continue;
        for (const col of extractSelectColumns(selectBody)) {
          usage[table].readColumns.add(col);
          if (!valid[col]) usage[table].invalidColumns.push({ file: rel(file), column: col, operation: "select" });
        }
      }
      for (const match of block.matchAll(/\.(?:eq|neq|gte|lte|gt|lt|order|in|contains|is)\(\s*["'`]([A-Za-z0-9_]+)["'`]/g)) {
        const col = match[1];
        usage[table].filterColumns.add(col);
        if (!valid[col]) usage[table].invalidColumns.push({ file: rel(file), column: col, operation: "filter" });
      }
      for (const match of block.matchAll(/\.(?:insert|upsert|update)\(/g)) {
        for (const col of topLevelKeysFromFirstObject(block, match.index || 0)) {
          usage[table].writeColumns.add(col);
          if (!valid[col]) usage[table].invalidColumns.push({ file: rel(file), column: col, operation: "write" });
        }
      }
    }
  }

  return Object.fromEntries(
    Object.entries(usage).map(([table, entry]) => [
      table,
      {
        readColumns: [...entry.readColumns].sort(),
        writeColumns: [...entry.writeColumns].sort(),
        filterColumns: [...entry.filterColumns].sort(),
        invalidColumns: entry.invalidColumns,
        unusedColumns: schema[table].columnNames
          .filter((col) => !["id", "user_id", "created_at", "updated_at"].includes(col))
          .filter((col) => !entry.readColumns.has(col) && !entry.writeColumns.has(col) && !entry.filterColumns.has(col)),
      },
    ])
  );
}

function countPattern(files, regex) {
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    count += (content.match(regex) || []).length;
  }
  return count;
}

function filesMatching(files, regex) {
  return files.map((file) => rel(file)).filter((fileRel, index) => regex.test(fs.readFileSync(files[index], "utf8")));
}

function gitChangedFiles() {
  try {
    return execFileSync("git", ["status", "--short"], { cwd: ROOT, encoding: "utf8" })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^..?\s+/, ""));
  } catch {
    return [];
  }
}

function status(ok, warning) {
  if (!ok) return "ERROR";
  if (warning) return "WARNING";
  return "OK";
}

function scoreFromIssues(base, issues) {
  const penalty = issues.reduce((sum, issue) => sum + (issue.severity === "ERROR" ? 8 : 4), 0);
  return Math.max(0, Math.min(100, base - penalty));
}

function healthLabel(score) {
  return HEALTH_LABELS.find((item) => score >= item.min)?.label || HEALTH_LABELS.at(-1).label;
}

function addIssue(issues, area, severity, title, impact, evidence = []) {
  issues.push({ area, severity, title, impact, evidence });
}

function buildReport() {
  const generatedAt = new Date().toISOString();
  const schema = loadSchema();
  const rpcs = loadRpcs();
  const dbUsage = readJson(DB_USAGE_JSON, {});
  const fileUsage = readJson(FILE_USAGE_JSON, {});
  const files = SEARCH_DIRS.flatMap(walk);
  const graph = buildFileGraph(files);
  const cycles = detectCycles(graph);
  const unusedImports = detectUnusedImports(files);
  const columnUsage = collectDbColumnUsage(files, schema);
  const changedFiles = gitChangedFiles();
  const issues = [];

  const allFileEntries = Object.values(fileUsage).length ? Object.values(fileUsage) : Object.values(graph);
  const modulesWithoutConsumers = allFileEntries
    .filter((entry) => !entry.file.startsWith("app/"))
    .filter((entry) => (entry.importedBy || []).length === 0)
    .map((entry) => entry.file)
    .sort();
  const modulesWithoutProducers = allFileEntries
    .filter((entry) => !entry.file.startsWith("app/"))
    .filter((entry) => (entry.imports || []).length === 0)
    .map((entry) => entry.file)
    .sort();
  const snapshotFiles = allFileEntries
    .map((entry) => entry.file)
    .filter((file) => /snapshot|currentContext|currentSituation|situationPolicy|reasoningService/i.test(file));

  if (cycles.length) addIssue(issues, "Architecture", "WARNING", "Dipendenze circolari rilevate", "Le dipendenze circolari rendono fragili refactor e build incrementali.", cycles.slice(0, 5));
  if (unusedImports.length) addIssue(issues, "Architecture", "WARNING", "Import potenzialmente inutilizzati", "Import inutilizzati indicano moduli morti o refactor incompleti.", unusedImports.slice(0, 10));
  if (modulesWithoutConsumers.length) addIssue(issues, "Architecture", "WARNING", "Moduli senza consumer", "Codice non raggiunto o solo invocato dinamicamente richiede verifica.", modulesWithoutConsumers.slice(0, 15));

  const database = {};
  for (const table of Object.keys(schema).sort()) {
    const usage = dbUsage[table] || { readers: [], writers: [], updaters: [], deleters: [], rawUsers: [], status: "unused" };
    const reads = (usage.readers || []).length;
    const writes = (usage.writers || []).length + (usage.updaters || []).length + (usage.deleters || []).length;
    const invalidColumns = columnUsage[table]?.invalidColumns || [];
    const tableStatus = invalidColumns.length
      ? "ERROR"
      : reads && writes
        ? "OK"
        : reads || writes
          ? "WARNING"
          : "ERROR";
    database[table] = {
      status: tableStatus,
      read: reads > 0,
      written: writes > 0,
      readers: usage.readers || [],
      writers: [...(usage.writers || []), ...(usage.updaters || []), ...(usage.deleters || [])].sort(),
      readButNeverWritten: reads > 0 && writes === 0,
      writtenButNeverRead: writes > 0 && reads === 0,
      unusedColumns: columnUsage[table]?.unusedColumns || [],
      invalidColumns,
      dead: reads === 0 && writes === 0,
    };
    if (invalidColumns.length) addIssue(issues, "Database", "ERROR", `Query verso colonne inesistenti in ${table}`, "Le query possono fallire a runtime.", invalidColumns.slice(0, 10));
    else if (reads > 0 && writes === 0) addIssue(issues, "Database", "WARNING", `${table} letta ma mai scritta`, "Il dato potrebbe dipendere da processi esterni o essere archivio passivo.", database[table].readers.slice(0, 5));
    else if (writes > 0 && reads === 0) addIssue(issues, "Database", "WARNING", `${table} scritta ma mai letta`, "GhostMe raccoglie dato che potrebbe non restituire valore.", database[table].writers.slice(0, 5));
    else if (reads === 0 && writes === 0) addIssue(issues, "Database", "ERROR", `${table} non usata`, "Tabella presente nello schema ma non agganciata al codice.", []);
  }

  const rpcUsage = rpcs.map((rpc) => {
    const users = filesMatching(files, new RegExp(String.raw`\b${rpc}\b`, "g"));
    if (!users.length) addIssue(issues, "Database", "WARNING", `RPC ${rpc} non utilizzata`, "Funzione database presente ma non richiamata dal workspace.", []);
    return { rpc, users, used: users.length > 0 };
  });

  const homeFlowFiles = {
    ingest: filesMatching(files, /house_events|house_entities/),
    snapshot: filesMatching(files, /buildHouseStateSnapshot|formatHouseStateContext/),
    currentSituation: filesMatching(files, /currentSituation|recentHomeEvents/),
    situationPolicy: filesMatching(files, /situationPolicy|buildUnifiedSituationModel/),
    decision: filesMatching(files, /buildDecisionSnapshot/),
    proactive: filesMatching(files, /trueProactive|generateHouseSuggestions|home_safety/),
    ui: filesMatching(files, /proactiveMessages|visibleProactive|loadVisibleProactiveMessages/),
  };
  const homeAssistant = Object.fromEntries(
    CORE_FLOWS.homeAssistant.map((table) => [
      table,
      {
        received: database[table]?.written || false,
        used: database[table]?.read || false,
        ignored: !(database[table]?.read || false),
        status: database[table]?.status || "ERROR",
      },
    ])
  );
  if (Object.values(homeFlowFiles).some((list) => !list.length)) {
    addIssue(issues, "Home Assistant", "WARNING", "Flusso Home Assistant incompleto", "Una parte della catena HA -> policy -> proactive/UI non risulta agganciata staticamente.", homeFlowFiles);
  }

  const locationFlowFiles = {
    gps: filesMatching(files, /updateCurrentLocationFlow|latitude|longitude/),
    state: filesMatching(files, /user_location_state/),
    places: filesMatching(files, /significant_places|resolvePlaceFromCoordinates/),
    observations: filesMatching(files, /observation_events|place_unknown_detected/),
    policy: filesMatching(files, /situationPolicy|recentLocationEvents/),
    continuity: filesMatching(files, /buildContinuityCandidate|unknownBeforeHome/),
    cards: filesMatching(files, /writeLocationCandidateCard|poi_resolution|Conferma luogo/),
    chat: filesMatching(files, /currentPlaceContext|placesContext/),
  };
  const location = {
    flow: locationFlowFiles,
    coordinateWithoutPoiSignals: filesMatching(files, /place_unknown_detected|coordinate_bucket/),
    poiSavePath: filesMatching(files, /saveSignificantPlace|external_name|external_category/),
    duplicateRisk: database.significant_places?.invalidColumns?.length ? "unknown" : "dedupe_by_local_radius_and_bucket",
    unusedPlacesRisk: database.significant_places?.readButNeverWritten ? "read_only" : "monitored",
  };
  if (!locationFlowFiles.policy.length || !locationFlowFiles.continuity.length) {
    addIssue(issues, "Location", "ERROR", "Location non arriva alla policy/continuity", "Il GPS rischia di restare cronologia invece di modificare comportamento.", locationFlowFiles);
  }

  const people = {
    peopleGraph: database.people_graph,
    topicLinks: database.topic_links,
    episodicMemories: database.episodic_memories,
    conversationSummaries: database.conversation_summaries,
    continuityConsumers: filesMatching(files, /relationshipMemory|relationship_open_loop|peopleContext/),
    curiosityConsumers: filesMatching(files, /socialSuggestions|relationshipAttention|people/),
    chatConsumers: filesMatching(files, /buildPeopleContext|relationshipContext/),
    reused: filesMatching(files, /peopleSnapshot|relationshipMemory|peopleContext|relationship_open_loop/).length > 0,
  };
  if (!people.reused) addIssue(issues, "People", "ERROR", "People graph non riutilizzato", "Le informazioni sulle persone non influenzano chat o proactive.", []);

  const memory = Object.fromEntries(
    CORE_FLOWS.memory.map((table) => [
      table,
      {
        collected: database[table]?.written || false,
        reused: database[table]?.read || false,
        unused: !(database[table]?.read || false),
        status: database[table]?.status || "ERROR",
      },
    ])
  );
  for (const [table, entry] of Object.entries(memory)) {
    if (entry.collected && !entry.reused) addIssue(issues, "Memory", "WARNING", `${table} raccolta ma non riutilizzata`, "Memoria raccolta senza valore operativo visibile.", []);
  }

  const proactiveCategories = {
    daily: /daily_briefing|Daily Briefing/,
    observation: /observation|Observation/,
    curiosity: /curiosity|Curiosity/,
    agenda: /agenda|Agenda/,
    reminder: /reminder|Reminder/,
    continuity: /continuity|buildContinuityCandidate/,
    situationPolicy: /situationPolicy|buildUnifiedSituationModel/,
  };
  const proactive = {};
  for (const [category, regex] of Object.entries(proactiveCategories)) {
    proactive[category] = {
      generated: filesMatching(files, regex).filter((file) => /writer|builder|flow|engine|snapshot/i.test(file)).length > 0,
      shown: filesMatching(files, /visibleProactive|loadVisibleProactiveMessages|proactiveMessages/).length > 0,
      read: database.ghost_proactive_messages?.read || false,
      completed: filesMatching(files, /answered|dismissed|read_at|status/).length > 0,
      ignored: false,
    };
    proactive[category].ignored = !proactive[category].generated || !proactive[category].shown;
    if (proactive[category].ignored) addIssue(issues, "Proactive", "WARNING", `${category} non completamente agganciata`, "Categoria proactive non risulta generata e mostrata insieme.", proactive[category]);
  }

  const queryCount = countPattern(files, /\.from\(\s*["'`][A-Za-z0-9_]+["'`]\s*\)/g);
  const llmCount = countPattern(files, /openai\.[A-Za-z0-9_.]+|chat\.completions\.create|responses\.create/g);
  const brainFiles = filesMatching(files, /buildGhostBrainSnapshot|buildReasoningSnapshot/);
  const chatSnapshotFiles = filesMatching(files, /buildChatContext|buildGhostBrainSnapshot/);
  const performance = {
    brainSnapshot: {
      queryReferences: brainFiles.reduce((sum, file) => sum + (fs.readFileSync(path.join(ROOT, file), "utf8").match(/\.from\(/g) || []).length, 0),
      llmReferences: brainFiles.reduce((sum, file) => sum + (fs.readFileSync(path.join(ROOT, file), "utf8").match(/openai\.|chat\.completions\.create/g) || []).length, 0),
      estimatedTime: brainFiles.length ? "medium/high, multiple composed snapshots" : "unknown",
      duplications: snapshotFiles,
    },
    chat: {
      snapshotDuplications: chatSnapshotFiles,
      queryReferences: queryCount,
      llmReferences: llmCount,
      unnecessaryLlmRisk: llmCount > 1 ? "WARNING" : "OK",
    },
    appOpen: {
      blockers: filesMatching(files, /runAppOpen|buildGhostBrainSnapshot|loadVisibleProactiveMessages/),
      scheduler: filesMatching(files, /worker\/proactive|runProactiveFlowForUser|cron|scheduler/),
    },
  };

  const ux = {
    dataWithoutValue: Object.entries(database)
      .filter(([, entry]) => entry.writtenButNeverRead)
      .map(([table]) => table),
    genericQuestions: filesMatching(files, /domanda generica|curiosity|question/i),
    weakCards: filesMatching(files, /Conferma luogo|curiosity|observation/i),
    nonContextualReminders: filesMatching(files, /reminder|promemoria/i),
    proactiveBehaviorChange: filesMatching(files, /suppressGenericCuriosity|situationPolicy|recommendedAction/).length > 0,
  };
  if (ux.dataWithoutValue.length) addIssue(issues, "UX", "WARNING", "Dati raccolti senza consumer", "Raccolta dati non trasformata in valore utente.", ux.dataWithoutValue);

  const scores = {
    Architecture: scoreFromIssues(82, issues.filter((issue) => issue.area === "Architecture")),
    Database: scoreFromIssues(80, issues.filter((issue) => issue.area === "Database")),
    Memory: scoreFromIssues(76, issues.filter((issue) => issue.area === "Memory")),
    People: scoreFromIssues(78, issues.filter((issue) => issue.area === "People")),
    Location: scoreFromIssues(78, issues.filter((issue) => issue.area === "Location")),
    "Home Assistant": scoreFromIssues(78, issues.filter((issue) => issue.area === "Home Assistant")),
    Calendar: database.calendar_events?.status === "OK" ? 82 : 66,
    Performance: scoreFromIssues(74, issues.filter((issue) => issue.area === "Performance")),
    Proactive: scoreFromIssues(76, issues.filter((issue) => issue.area === "Proactive")),
    UX: scoreFromIssues(72, issues.filter((issue) => issue.area === "UX")),
  };
  scores.Overall = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length);

  const changeImpact = changedFiles.map((file) => {
    const flows = [];
    if (/home|house|assistant/i.test(file)) flows.push("Home Assistant");
    if (/location|place/i.test(file)) flows.push("Location");
    if (/people|relationship/i.test(file)) flows.push("People");
    if (/memory|timeline|topic|summary/i.test(file)) flows.push("Memory");
    if (/proactive|curiosity|reminder|agenda/i.test(file)) flows.push("Proactive");
    if (/chat/i.test(file)) flows.push("Chat");
    if (/context|reasoning|situation|brain/i.test(file)) flows.push("Brain/Situation");
    return {
      file,
      improvedFlows: flows,
      possibleBreakage: flows.length ? flows : ["unknown"],
      mapsToRegenerate: ["DATABASE_USAGE_MAP", "FILE_USAGE_MAP", "PROJECT_KNOWLEDGE_BASE", "SUPABASE_SCHEMA_MAP"].filter((map) =>
        /schema|supabase|db|database/i.test(file) ? true : map !== "SUPABASE_SCHEMA_MAP"
      ),
    };
  });

  const topPriority = issues
    .map((issue) => ({
      ...issue,
      impactScore: (issue.severity === "ERROR" ? 100 : 70) + (issue.evidence?.length ? 5 : 0),
    }))
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 20);

  return {
    generatedAt,
    status: {
      healthScore: scores.Overall,
      healthLabel: healthLabel(scores.Overall),
      scores,
    },
    architecture: {
      status: status(!cycles.length, unusedImports.length || modulesWithoutConsumers.length),
      activeModules: allFileEntries.length,
      modulesNeverCalled: modulesWithoutConsumers,
      modulesWithoutConsumers,
      modulesWithoutProducers,
      circularDependencies: cycles,
      unusedImports,
      duplicatedSnapshots: snapshotFiles,
    },
    database,
    rpcUsage,
    homeAssistant: {
      status: status(Object.values(homeAssistant).every((entry) => entry.used), Object.values(homeAssistant).some((entry) => entry.ignored)),
      tables: homeAssistant,
      flow: homeFlowFiles,
    },
    location,
    people,
    memory,
    proactive,
    performance,
    ux,
    topPriority,
    changeImpact,
  };
}

function tableRows(rows) {
  return rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function renderMarkdown(report) {
  const scoreRows = Object.entries(report.status.scores).map(([area, score]) => [area, String(score), healthLabel(score)]);
  const topRows = report.topPriority.map((issue, index) => [
    String(index + 1),
    issue.area,
    issue.severity,
    issue.title,
    issue.impact,
  ]);
  const dbRows = Object.entries(report.database).map(([table, entry]) => [
    table,
    entry.status,
    entry.read ? "yes" : "no",
    entry.written ? "yes" : "no",
    entry.invalidColumns.length ? String(entry.invalidColumns.length) : "0",
    entry.unusedColumns.slice(0, 8).join(", ") || "-",
  ]);
  const haRows = Object.entries(report.homeAssistant.tables).map(([table, entry]) => [
    table,
    entry.received ? "yes" : "no",
    entry.used ? "yes" : "no",
    entry.ignored ? "yes" : "no",
    entry.status,
  ]);
  const memoryRows = Object.entries(report.memory).map(([table, entry]) => [
    table,
    entry.collected ? "yes" : "no",
    entry.reused ? "yes" : "no",
    entry.unused ? "yes" : "no",
    entry.status,
  ]);
  const proactiveRows = Object.entries(report.proactive).map(([category, entry]) => [
    category,
    entry.generated ? "yes" : "no",
    entry.shown ? "yes" : "no",
    entry.read ? "yes" : "no",
    entry.completed ? "yes" : "no",
    entry.ignored ? "yes" : "no",
  ]);
  const changeRows = report.changeImpact.slice(0, 30).map((entry) => [
    entry.file,
    entry.improvedFlows.join(", ") || "-",
    entry.possibleBreakage.join(", ") || "-",
    entry.mapsToRegenerate.join(", "),
  ]);

  return `# SYSTEM HEALTH REPORT

Generated: ${report.generatedAt}

Health Score: **${report.status.healthScore}/100** - ${report.status.healthLabel}

## Stato Generale

| Area | Score | Health |
| --- | ---: | --- |
${tableRows(scoreRows)}

## 1. Architettura

Status: **${report.architecture.status}**

- Moduli attivi: ${report.architecture.activeModules}
- Moduli senza consumer: ${report.architecture.modulesWithoutConsumers.length}
- Moduli senza producer: ${report.architecture.modulesWithoutProducers.length}
- Dipendenze circolari: ${report.architecture.circularDependencies.length}
- Import potenzialmente inutilizzati: ${report.architecture.unusedImports.length}
- Snapshot/context duplicati o concorrenti: ${report.architecture.duplicatedSnapshots.length}

## 2. Database

| Tabella | Stato | Letta | Scritta | Colonne inesistenti | Colonne non viste |
| --- | --- | --- | --- | ---: | --- |
${tableRows(dbRows)}

RPC inutilizzate: ${report.rpcUsage.filter((rpc) => !rpc.used).map((rpc) => rpc.rpc).join(", ") || "nessuna"}

## 3. Home Assistant

Status: **${report.homeAssistant.status}**

| Tabella | Dati ricevuti | Dati utilizzati | Dati ignorati | Stato |
| --- | --- | --- | --- | --- |
${tableRows(haRows)}

Catena HA -> Snapshot -> Current Situation -> Situation Policy -> Decision -> Proactive -> UI:
${Object.entries(report.homeAssistant.flow).map(([step, files]) => `- ${step}: ${files.length ? "OK" : "WARNING"} (${files.length} file)`).join("\n")}

## 4. Location

Catena GPS -> user_location_state -> significant_places -> observation_events -> Situation Policy -> Continuity -> Ghost Cards -> Chat:
${Object.entries(report.location.flow).map(([step, files]) => `- ${step}: ${files.length ? "OK" : "WARNING"} (${files.length} file)`).join("\n")}

- Coordinate senza POI: ${report.location.coordinateWithoutPoiSignals.length ? "monitorate" : "non rilevate"}
- POI con salvataggio: ${report.location.poiSavePath.length ? "presente" : "assente"}
- Rischio duplicati: ${report.location.duplicateRisk}
- Luoghi mai piu utilizzati: ${report.location.unusedPlacesRisk}

## 5. People

- People graph riutilizzato: ${report.people.reused ? "yes" : "no"}
- Consumer continuity/chat/curiosity: ${[
    report.people.continuityConsumers.length,
    report.people.chatConsumers.length,
    report.people.curiosityConsumers.length,
  ].join(" / ")}

## 6. Memory

| Fonte | Raccolto | Riutilizzato | Inutilizzato | Stato |
| --- | --- | --- | --- | --- |
${tableRows(memoryRows)}

## 7. Proactive

| Categoria | Generata | Mostrata | Letta | Completata | Ignorata |
| --- | --- | --- | --- | --- | --- |
${tableRows(proactiveRows)}

## 8. Performance

- Brain Snapshot query references: ${report.performance.brainSnapshot.queryReferences}
- Brain Snapshot LLM references: ${report.performance.brainSnapshot.llmReferences}
- Chat query references workspace: ${report.performance.chat.queryReferences}
- Chat LLM references workspace: ${report.performance.chat.llmReferences}
- App open blockers/static signals: ${report.performance.appOpen.blockers.length}
- Snapshot/context duplicati: ${report.performance.brainSnapshot.duplications.length}

## 9. UX

- Dati raccolti ma senza consumer: ${report.ux.dataWithoutValue.join(", ") || "nessuno"}
- Domande/card deboli da controllare: ${report.ux.weakCards.length}
- Reminder da controllare: ${report.ux.nonContextualReminders.length}
- Proactive cambia comportamento via policy: ${report.ux.proactiveBehaviorChange ? "yes" : "no"}

## 10. Top Priority

| # | Area | Stato | Problema | Impatto |
| ---: | --- | --- | --- | --- |
${tableRows(topRows)}

## 11. Change Impact

| File modificato | Flussi migliorati | Possibili rotture | Mappe da rigenerare |
| --- | --- | --- | --- |
${tableRows(changeRows)}
`;
}

const report = buildReport();
ensureDir(OUTPUT_MD);
ensureDir(OUTPUT_JSON);
fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(OUTPUT_MD, renderMarkdown(report));
console.log(`System health report written: ${path.relative(ROOT, OUTPUT_MD)}`);
console.log(`System health state written: ${path.relative(ROOT, OUTPUT_JSON)}`);
