type Traits = Record<string, number>;

export function buildPersonalitySummary(traits: Traits) {
  const summary: string[] = [];

  if ((traits.sarcasmo || 0) >= 8) {
    summary.push("Usa spesso ironia o battute come difesa emotiva.");
  }

  if ((traits.controllo || 0) >= 8) {
    summary.push("Ha un forte bisogno di controllo quando è sotto pressione.");
  }

  if ((traits.impulsivita || 0) >= 8) {
    summary.push("Quando è stressato può reagire in modo impulsivo.");
  }

  if ((traits.ansia || 0) >= 8) {
    summary.push("Tende ad andare in ansia quando sente di perdere il controllo.");
  }

  if ((traits.sarcasmo || 0) < 8 && (traits.controllo || 0) < 8) {
    summary.push("Profilo ancora poco definito: servono altre risposte.");
  }

  return summary;
}