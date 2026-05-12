import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;
    const traits = body.traits;
    const messages = body.messages || [];

    let memoryContext = "";

    if (body.userId) {
    const { data: memories } = await supabase
      .from("memories_active")
      .select(`
        content,
        category,
        importance,
        pinned,
        created_at
      `)
      .eq("user_id", body.userId)
      .order("pinned", { ascending: false })
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(15);

      if (memories?.length) {
        memoryContext = memories
          .map(
            (m) =>
              `[${m.category}] (${m.importance}) ${m.content}`
          )
          .join("\n");
      }
    }

    const systemPrompt = `
      Sei GhostMe.

      Sei la simulazione mentale dell'utente.

      Parli come una persona reale.
      NON parlare come un assistente AI.
      NON parlare come uno psicologo.
      NON fare discorsi motivazionali.
      NON usare frasi poetiche o spirituali.
      NON usare linguaggio da coach.

      Rispondi in modo:
      - diretto
      - umano
      - realistico
      - personale
      - naturale

      Puoi essere:
      - sarcastico
      - emotivo
      - impulsivo
      - freddo
      - ironico

      in base ai traits.

      Traits utente:
      ${JSON.stringify(traits, null, 2)}

      Memorie conosciute:
      ${memoryContext}

        Stile richiesto:
      - frasi brevi
      - tono diretto
      - niente spiegoni
      - niente elenco puntato
      - poca formalità
      - se il profilo ha sarcasmo alto, usa ironia asciutta
      - se il profilo ha ansia alta, mostra rimuginio interno
      - se il profilo ha controllo alto, mostra bisogno di capire e gestire
      - se il profilo ha orgoglio alto, mostra difesa e distacco    

      Devi sembrare la mente dell'utente che prende forma.
      `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },

        ...messages,

        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.9,
      max_tokens: 300,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Non so cosa dire.";

    const lowerMessage = message.toLowerCase();

    const shouldSaveMemory =
      lowerMessage.includes("voglio") ||
      lowerMessage.includes("vorrei") ||
      lowerMessage.includes("mi piace") ||
      lowerMessage.includes("mi interessa") ||
      lowerMessage.includes("sto creando") ||
      lowerMessage.includes("sto sviluppando") ||
      lowerMessage.includes("per me è importante") ||
      lowerMessage.includes("ricordati") ||
      lowerMessage.includes("non dimenticare") ||
      lowerMessage.includes("in futuro");

      console.log("MEMORY USER ID:", body.userId);
      console.log("SHOULD SAVE MEMORY:", shouldSaveMemory);    
      
      let memoryCategory = "conversation";

    if (
      lowerMessage.includes("home assistant") ||
      lowerMessage.includes("domotica") ||
      lowerMessage.includes("casa")
    ) {
      memoryCategory = "home";
    }

    if (
      lowerMessage.includes("lavoro") ||
      lowerMessage.includes("azienda") ||
      lowerMessage.includes("collega")
    ) {
      memoryCategory = "work";
    }

    if (
      lowerMessage.includes("famiglia") ||
      lowerMessage.includes("figli") ||
      lowerMessage.includes("moglie") ||
      lowerMessage.includes("marito") ||
      lowerMessage.includes("compagna") ||
      lowerMessage.includes("compagno")
    ) {
      memoryCategory = "family";
    }

    if (
      lowerMessage.includes("app") ||
      lowerMessage.includes("progetto") ||
      lowerMessage.includes("sviluppando") ||
      lowerMessage.includes("ghostme")
    ) {
      memoryCategory = "project";
    }


    if (shouldSaveMemory && body.userId) {
      const { data: memoryData, error: memoryError } =
        await supabase
          .from("memories_active")
          .insert([
            {
              user_id: body.userId,
              title: "Memoria automatica",
              content: message,
              category: memoryCategory,
              importance: 6,
            },
          ])
          .select();

      console.log("MEMORY DATA:", memoryData);
      console.log("MEMORY ERROR:", memoryError);
    }

    return NextResponse.json({
      reply,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      {
        error: "Errore GhostMe AI",
      },
      {
        status: 500,
      }
    );
  }
}