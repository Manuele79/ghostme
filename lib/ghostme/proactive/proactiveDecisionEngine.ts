import { OpenAI } from "openai";
import { GhostCurrentContext } from "@/lib/ghostme/context/contextBuilder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ProactiveDecision = {
  shouldSpeak: boolean;
  category: "observation" | "curiosity" | "agenda" | "none";
  title?: string;
  message?: string;
  priority?: number;
  reason?: string;
};

export async function decideProactiveMessage({
  userName,
  currentContext,
}: {
  userName?: string | null;
  currentContext: GhostCurrentContext;
}): Promise<ProactiveDecision> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 450,
    messages: [
      {
        role: "system",
        content: `
Sei il Proactive Decision Engine di GhostMe.

Devi decidere se GhostMe deve dire qualcosa all'utente ORA.

Non devi parlare sempre.
Devi evitare messaggi inutili.

Puoi parlare solo se c'è una vera utilità:
- evento vicino
- azione aperta importante
- luogo attuale rilevante
- contraddizione o dubbio utile
- memoria o collegamento utile
- domanda necessaria per capire meglio l'utente
- rischio di dimenticare qualcosa

Categorie:
- observation = osservazione utile
- curiosity = domanda per capire meglio
- agenda = appuntamenti/promemoria
- none = niente da dire

Regole:
- Se non c'è nulla di utile, shouldSpeak false.
- Massimo 90 parole.
- Tono diretto, umano, pratico.
- Niente motivazione finta.
- Niente "come AI".
- Non inventare.
- Se usi il luogo attuale, parla naturale: "sei a casa", non "nel contesto risulti".
- Controlla i messaggi proattivi recenti.
- NON ripetere un tema già detto da Daily, Agenda, Observation, Curiosity o Butler.
- Se il tema utile è già stato trattato di recente, rispondi shouldSpeak false.

Rispondi SOLO con JSON valido:

{
  "shouldSpeak": true,
  "category": "observation",
  "title": "Osservazione GhostMe",
  "message": "...",
  "priority": 2,
  "reason": "..."
}

Oppure:

{
  "shouldSpeak": false,
  "category": "none",
  "reason": "niente di utile ora"
}
        `,
      },
      {
        role: "user",
        content: `
UTENTE:
${userName || "Utente"}

CONTESTO ATTUALE:
${currentContext.contextSummary}

SINTESI RAGIONATA:
${currentContext.reasoningSummary || ""}
        `,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(raw);

    if (!parsed?.shouldSpeak) {
      return {
        shouldSpeak: false,
        category: "none",
        reason: parsed?.reason || "nessun messaggio utile",
      };
    }

    return {
      shouldSpeak: true,
      category: parsed.category || "observation",
      title: parsed.title || "Osservazione GhostMe",
      message: parsed.message || "",
      priority: parsed.priority || 2,
      reason: parsed.reason || "",
    };
  } catch (err) {
    console.log("PROACTIVE DECISION PARSE ERROR:", err);
    console.log("PROACTIVE DECISION RAW:", raw);

    return {
      shouldSpeak: false,
      category: "none",
      reason: "parse error",
    };
  }
}