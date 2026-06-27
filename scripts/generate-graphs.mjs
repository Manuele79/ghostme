import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const diagramsDirectory = path.join(projectRoot, "docs", "diagrams");
const mapsDirectory = path.join(projectRoot, "docs", "maps");
const stateDirectory = path.join(projectRoot, "docs", "state");
const dependencyCruiser = path.join(
  projectRoot,
  "node_modules",
  "dependency-cruiser",
  "bin",
  "dependency-cruise.mjs",
);

const diagrams = {
  brain: ["lib/ghostme/proactive"],
  calendar: ["lib/ghostme/calendar"],
  chat: ["lib/ghostme/chat"],
  context: ["lib/ghostme/context"],
  curiosity: ["lib/ghostme/curiosity"],
  ghostme: ["app", "components"],
  goals: ["lib/ghostme/goals"],
  hooks: ["hooks"],
  house: ["lib/ghostme/homeAssistant"],
  location: ["lib/ghostme/location"],
  memory: ["lib/ghostme/memory", "lib/ghostme/people"],
  people: ["lib/ghostme/people"],
  proactive: ["lib/ghostme/proactive"],
  services: ["lib/ghostme/services"],
};

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${label} failed${details ? `:\n${details}` : ""}`);
  }
}

function normalizeDependency(dependency) {
  return dependency.resolved || dependency.module || dependency.followable || "";
}

function buildDependencyTextMap(graph) {
  const modules = graph.modules || [];
  const inbound = new Map();

  for (const module of modules) {
    inbound.set(module.source, inbound.get(module.source) || []);
  }

  for (const module of modules) {
    for (const dependency of module.dependencies || []) {
      const target = normalizeDependency(dependency);
      if (!target) continue;
      inbound.set(target, [...(inbound.get(target) || []), module.source]);
    }
  }

  const isolated = modules
    .filter(
      (module) =>
        !(module.dependencies || []).length && !(inbound.get(module.source) || []).length,
    )
    .map((module) => module.source)
    .sort();
  const cycles = (graph.summary?.violations || [])
    .filter((violation) => violation.rule?.name === "no-circular")
    .map((violation) => `${violation.from} -> ${violation.to}`);
  const unused = (graph.summary?.violations || [])
    .filter((violation) => violation.rule?.name === "no-orphans")
    .map((violation) => violation.from)
    .filter(Boolean)
    .sort();

  const lines = [
    "# DEPENDENCY TEXT MAP",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Chi chiama chi",
    "",
  ];

  for (const module of modules.sort((a, b) => a.source.localeCompare(b.source))) {
    const dependencies = (module.dependencies || [])
      .map(normalizeDependency)
      .filter(Boolean)
      .sort();

    if (!dependencies.length) {
      lines.push(`${module.source} -> -`);
      continue;
    }

    for (const dependency of dependencies) {
      lines.push(`${module.source} -> ${dependency}`);
    }
  }

  lines.push(
    "",
    "## Moduli isolati",
    "",
    ...(isolated.length ? isolated.map((item) => `- ${item}`) : ["- nessuno"]),
    "",
    "## Cicli",
    "",
    ...(cycles.length ? cycles.map((item) => `- ${item}`) : ["- nessuno"]),
    "",
    "## Dipendenze inutili / moduli orfani",
    "",
    ...(unused.length ? unused.map((item) => `- ${item}`) : ["- nessuna"]),
  );

  return lines.join("\n");
}

await mkdir(diagramsDirectory, { recursive: true });
await mkdir(mapsDirectory, { recursive: true });
await mkdir(stateDirectory, { recursive: true });
const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "ghostme-graphs-"));

try {
  const dependencyGraphFile = path.join(stateDirectory, "dependency-graph.json");
  run(
    process.execPath,
    [
      dependencyCruiser,
      "--output-type",
      "json",
      "--output-to",
      dependencyGraphFile,
      "app",
      "components",
      "hooks",
      "lib",
      "scripts",
    ],
    "dependency-cruiser (json)",
  );
  const graph = JSON.parse(await readFile(dependencyGraphFile, "utf8"));
  await writeFile(
    path.join(mapsDirectory, "DEPENDENCY_TEXT_MAP.txt"),
    buildDependencyTextMap(graph),
  );
  console.log("generated docs/state/dependency-graph.json");
  console.log("generated docs/maps/DEPENDENCY_TEXT_MAP.txt");

  for (const [name, sources] of Object.entries(diagrams)) {
    const dotFile = path.join(temporaryDirectory, `${name}.dot`);
    const svgFile = path.join(temporaryDirectory, `${name}.svg`);

    run(
      process.execPath,
      [
        dependencyCruiser,
        "--output-type",
        "dot",
        "--output-to",
        dotFile,
        ...sources,
      ],
      `dependency-cruiser (${name})`,
    );
    run("dot", ["-Tsvg", dotFile, "-o", svgFile], `Graphviz (${name})`);
    await copyFile(svgFile, path.join(diagramsDirectory, `${name}.svg`));
    console.log(`generated docs/diagrams/${name}.svg`);
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
