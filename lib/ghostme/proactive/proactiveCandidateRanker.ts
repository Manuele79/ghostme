import { normalizeProactiveText } from "@/lib/ghostme/proactive/proactiveMessageDedupe";

export function pickBestProactiveCandidate(candidates: any[]) {
  return candidates.sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  )[0];
}

export function buildProactiveCandidateLogicalKey(candidate: any) {
  if (candidate?.logicalKey) return candidate.logicalKey;

  const identity = normalizeProactiveText(
    `${candidate?.source || "legacy"} ${candidate?.category || "observation"} ${candidate?.title || "card"}`
  )
    .replace(/\s+/g, "_")
    .slice(0, 140);
  return `proactive_candidate_${identity || "untitled"}`;
}
