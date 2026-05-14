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
  const entries = Object.entries(traits)
    .filter(([key]) => !["id", "user_id", "created_at"].includes(key))
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));

  const topTraits = entries.slice(0, 3).map(([key]) => key);
  const highestValue = entries[0]?.[1] || 0;

  if (highestValue === 0) {
    return "Sto ancora imparando come reagisci davvero. Il profilo è troppo vuoto per descriverti bene.";
  }

  const parts: string[] = [];

  if (topTraits.includes("controllo")) {
    parts.push(
      "Quando qualcosa diventa incerto, la tua prima reazione è cercare di rimettere ordine."
    );
  }

  if (topTraits.includes("ansia")) {
    parts.push(
      "Tendi a elaborare molto nella testa prima ancora di far vedere fuori cosa ti sta pesando."
    );
  }

  if (topTraits.includes("sarcasmo")) {
    parts.push(
      "L’ironia per te non è solo una battuta: spesso è un modo per tenere distanza da ciò che pesa."
    );
  }

  if (topTraits.includes("empatia")) {
    parts.push(
      "Le emozioni degli altri ti arrivano addosso più di quanto sembri, anche quando provi a restare pratico."
    );
  }

  if (topTraits.includes("orgoglio")) {
    parts.push(
      "Quando ti senti toccato sul personale, l’orgoglio entra in gioco prima ancora delle parole."
    );
  }

  if (topTraits.includes("gelosia")) {
    parts.push(
      "Quando qualcosa o qualcuno per te conta davvero, puoi diventare molto attento ai segnali di distanza."
    );
  }

  if (topTraits.includes("paura_abbandono")) {
    parts.push(
      "Il silenzio o la distanza emotiva possono pesarti più di quanto ammetteresti subito."
    );
  }

  if (topTraits.includes("sensibilita_critiche")) {
    parts.push(
      "Le critiche, soprattutto se arrivano fredde o improvvise, possono restarti addosso."
    );
  }

  if (topTraits.includes("sincerita")) {
    parts.push(
      "Per te la sincerità conta molto: preferisci una verità scomoda a una frase comoda ma finta."
    );
  }

  if (topTraits.includes("socialita")) {
    parts.push(
      "Hai bisogno di confronto, ma non sempre significa esporti subito del tutto."
    );
  }

  if (topTraits.includes("vulnerabilita")) {
    parts.push(
      "Quando ti senti al sicuro, riesci ad aprirti molto più di quanto sembri all’inizio."
    );
  }

  if (topTraits.includes("evitamento")) {
    parts.push(
      "Quando una situazione pesa troppo, puoi prendere distanza per respirare e rimettere insieme i pezzi."
    );
  }

  if (topTraits.includes("impulsivita")) {
    parts.push(
      "Quando la pressione sale, puoi reagire prima di aver davvero finito di elaborare."
    );
  }

  if (parts.length === 0) {
    return "Il tuo profilo sta prendendo forma, ma servono più dati per descrivere davvero il tuo modo di reagire.";
  }

  return parts.join(" ");
}