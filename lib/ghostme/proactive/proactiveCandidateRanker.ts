export function pickBestProactiveCandidate(candidates: any[]) {
  return candidates.sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  )[0];
}
