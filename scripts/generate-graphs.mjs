import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const diagramsDirectory = path.join(projectRoot, "docs", "diagrams");
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
  ghostme: ["app", "components", "hooks", "lib"],
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

await mkdir(diagramsDirectory, { recursive: true });
const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "ghostme-graphs-"));

try {
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
