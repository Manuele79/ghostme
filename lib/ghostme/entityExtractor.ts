import { OpenAI } from "openai";
import { DetectedTopic } from "@/lib/ghostme/topicDetector";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ExtractedEntity = DetectedTopic & {
  description?: string;
};

export async function extractEntitiesWithAI({
  message,
  profileContext,
}: {
  message: string;
  profileContext?: string;
}): Promise<ExtractedEntity[]> {
  if (!message?.trim()) return [];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `
Sei un estrattore interno di entità per GhostMe.

Devi leggere il messaggio dell'utente e trovare SOLO entità davvero utili per la memoria personale.

Categorie entity_type:
- person
- animal
- project
- place
- habit
- passion
- object
- system
- work
- unknown

Categorie category:
- family
- work
- friend
- home
- project
- passion
- health
- place
- general

Regole:
- NON salvare parole comuni.
- NON salvare concetti generici se non sono importanti.
- Città, regioni, paesi, montagne, zone, località turistiche = place.
- Persone nominate per nome = person.
- Se il messaggio dice "mia moglie X", X è person/family.
- Se dice "mio amico X", X è person/friend.
- Progetti/app/sistemi software = project o system.
- Hobby/passioni/sport = passion.
- Se non sei sicuro, usa unknown ma solo se sembra davvero ricorrente/importante.
- massimo 6 entità.
- confidence da 0 a 100.
- needs_clarification true solo per persone/entità ambigue tipo "Ale", non per città famose tipo Tokyo.
- GhostMe è sempre project/project.
- AskDJ è sempre project/project.
- Home Assistant è system/home.

Profilo utente disponibile:
${profileContext || "nessun profilo"}

Rispondi SOLO con JSON valido:
{
  "entities": [
    {
      "topic": "Nome topic",
      "category": "family | work | friend | home | project | passion | health | place | general",
      "entity_type": "person | animal | project | place | habit | passion | object | system | work | unknown",
      "needs_clarification": true,
      "confidence": 90,
      "reason": "motivo breve",
      "description": "descrizione breve se deducibile"
    }
  ]
}
          `,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";

    let parsed: any = null;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.log("ENTITY EXTRACTOR PARSE ERROR:", err);
      console.log("ENTITY EXTRACTOR RAW:", raw);
      return [];
    }

    if (!Array.isArray(parsed?.entities)) return [];

    return parsed.entities
      .filter((item: any) => item?.topic && item?.confidence >= 60)
      .slice(0, 6)
      .map((item: any) => ({
        topic: String(item.topic).trim(),
        category: item.category || "general",
        entity_type: item.entity_type || "unknown",
        needs_clarification: !!item.needs_clarification,
        confidence: Number(item.confidence || 70),
        reason: item.reason || "ai_extractor",
        description: item.description || undefined,
      }));
  } catch (err) {
    console.log("ENTITY EXTRACTOR ERROR:", err);
    return [];
  }
}