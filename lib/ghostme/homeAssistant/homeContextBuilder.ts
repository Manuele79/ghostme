import { getHAStates } from "./haClient";

export async function buildHomeContext() {
  const states = await getHAStates();

  if (!states.length) {
    return "";
  }

  return states
    .slice(0, 20)
    .map((s: any) => `${s.entity_id}: ${s.state}`)
    .join("\n");
}