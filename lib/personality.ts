type Traits = Record<string, number>;

function high(traits: Traits, key: string) {
  return (traits[key] || 0) >= 8;
}

function medium(traits: Traits, key: string) {
  return (traits[key] || 0) >= 4 && (traits[key] || 0) < 8;
}

export function buildPersonalitySummary(traits: Traits) {
  const summary: string[] = [];

  if (high(traits, "sarcasmo")) {
    summary.push("Usa spesso ironia o battute come difesa emotiva.");
  } else if (medium(traits, "sarcasmo")) {
    summary.push("Ha una tendenza moderata a usare ironia nelle risposte.");
  }

  if (high(traits, "controllo")) {
    summary.push("Ha un forte bisogno di controllo quando è sotto pressione.");
  } else if (medium(traits, "controllo")) {
    summary.push("Preferisce mantenere un certo controllo sulle situazioni.");
  }

  if (high(traits, "impulsivita")) {
    summary.push("Quando è stressato può reagire in modo impulsivo.");
  } else if (medium(traits, "impulsivita")) {
    summary.push("Può avere reazioni rapide, ma non sempre impulsive.");
  }

  if (high(traits, "ansia")) {
    summary.push("Tende ad andare in ansia quando sente di perdere il controllo.");
  } else if (medium(traits, "ansia")) {
    summary.push("Può andare in tensione quando la situazione è incerta.");
  }

  if (high(traits, "empatia")) {
    summary.push("Tiene molto conto delle emozioni degli altri.");
  } else if (medium(traits, "empatia")) {
    summary.push("Ha empatia, ma tende a dosarla in base alla situazione.");
  }

  if (high(traits, "orgoglio")) {
    summary.push("L’orgoglio pesa molto nelle sue reazioni.");
  } else if (medium(traits, "orgoglio")) {
    summary.push("Può essere orgoglioso quando si sente toccato sul personale.");
  }

  if (high(traits, "sensibilita_critiche")) {
    summary.push("Le critiche o i segnali freddi possono colpirlo molto.");
  } else if (medium(traits, "sensibilita_critiche")) {
    summary.push("È abbastanza sensibile ai giudizi e ai cambi di tono.");
  }

  if (high(traits, "socialita")) {
    summary.push("Tende a cercare confronto e presenza degli altri.");
  } else if (medium(traits, "socialita")) {
    summary.push("A volte cerca confronto, ma non sempre si espone subito.");
  }

  if (high(traits, "gelosia")) {
    summary.push("Può vivere gelosia o territorialità in modo intenso.");
  } else if (medium(traits, "gelosia")) {
    summary.push("Può provare gelosia, ma tende a contenerla.");
  }

  if (high(traits, "paura_abbandono")) {
    summary.push("La distanza emotiva o il silenzio possono attivare paura di essere lasciato fuori.");
  } else if (medium(traits, "paura_abbandono")) {
    summary.push("Può soffrire la distanza emotiva, anche se cerca di controllarsi.");
  }

  if (high(traits, "sincerita")) {
    summary.push("Dà molto peso alla sincerità, anche quando è scomoda.");
  } else if (medium(traits, "sincerita")) {
    summary.push("Preferisce la sincerità, ma può dosarla per evitare danni.");
  }

  if (summary.length === 0) {
    summary.push("Profilo ancora poco definito: servono altre risposte.");
  }

  return summary;
}

export function buildGhostMeMessage(traits: Traits) {
  const messages: string[] = [];

  if ((traits.controllo || 0) >= 10) {
    messages.push(
      "Quando qualcosa ti sfugge di mano tendi a voler riprendere controllo molto rapidamente."
    );
  }

  if ((traits.sarcasmo || 0) >= 10) {
    messages.push(
      "Usi spesso ironia o battute per alleggerire situazioni emotivamente pesanti."
    );
  }

  if ((traits.ansia || 0) >= 10) {
    messages.push(
      "Dentro elabori molto più stress di quanto fai vedere fuori."
    );
  }

  if ((traits.empatia || 0) >= 10) {
    messages.push(
      "Le emozioni degli altri hanno un peso reale nel tuo modo di reagire."
    );
  }

  if ((traits.orgoglio || 0) >= 10) {
    messages.push(
      "Quando ti senti ferito o sottovalutato l’orgoglio entra subito in gioco."
    );
  }

  if ((traits.paura_abbandono || 0) >= 10) {
    messages.push(
      "La distanza emotiva o i cambiamenti improvvisi nei rapporti possono colpirti molto."
    );
  }

  if ((traits.vulnerabilita || 0) >= 10) {
    messages.push(
      "Quando ti senti al sicuro riesci ad aprirti emotivamente molto più della media."
    );
  }

  if ((traits.evitamento || 0) >= 10) {
    messages.push(
      "Quando una situazione pesa troppo, a volte tendi ad allontanarti o sparire per rifiatare."
    );
  }

  if (messages.length === 0) {
    messages.push(
      "Sto ancora imparando come reagisci emotivamente alle situazioni."
    );
  }

  return messages.join(" ");
}