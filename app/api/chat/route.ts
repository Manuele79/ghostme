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
            `${m.pinned ? "[PINNED]" : ""} [${m.category}] (${m.importance}) ${m.content}`
        )
          .join("\n");
      }
    }

   let profileContext = "";
   let lifeTopicsContext = "";
   let episodicContext = "";

      if (body.userId) {

   console.log("BODY USER ID:", body.userId);

        const { data: userProfile, error: userProfileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", body.userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

          console.log("USER PROFILE RAW:", userProfile);
          console.log("USER PROFILE ERROR:", userProfileError);

          if (userProfile) {

          console.log("USER PROFILE:", userProfile);

            profileContext = `
          Nome: ${userProfile.full_name || ""}
          Età: ${userProfile.age || ""}
          Genere: ${userProfile.gender || ""}
          Lavoro: ${userProfile.job || ""}
          Hobby: ${userProfile.hobbies || ""}
          Sport: ${userProfile.sports || ""}
          Relazione: ${userProfile.relationship_status || ""}
          Figli: ${userProfile.children_info || ""}
          Interessi: ${userProfile.interests || ""}
          Tipo di persona: ${userProfile.communication_style || ""}
          Bio: ${userProfile.short_bio || ""}
          `;
          }
      }

      if (body.userId) {
        const { data: lifeTopics } = await supabase
          .from("life_topics")
          .select(`
            topic,
            entity_type,
            category,
            description,
            weight,
            status
          `)
          .eq("user_id", body.userId)
          .order("weight", { ascending: false })
          .limit(20);

        if (lifeTopics?.length) {
          lifeTopicsContext = lifeTopics
            .map(
              (t) =>
                `${t.topic} | ${t.entity_type} | ${t.category} | ${t.description || "nessuna descrizione"}`
            )
            .join("\n");
        }
      }

      if (body.userId) {
        const { data: episodicMemories } = await supabase
          .from("episodic_memories")
          .select(`
            summary,
            emotional_tone,
            related_topics,
            importance,
            created_at
          `)
          .eq("user_id", body.userId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (episodicMemories?.length) {
          episodicContext = episodicMemories
            .map(
              (e) =>
                `${e.summary} | tono: ${e.emotional_tone} | topics: ${e.related_topics?.join(", ")}`
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

      Profilo utente:
      ${profileContext}

      Topic conosciuti:
      ${lifeTopicsContext}

      Episodi recenti:
      ${episodicContext}

      Memorie conosciute:
      ${memoryContext}

      Quando l'utente chiede informazioni personali, devi rispondere usando ESATTAMENTE i campi del Profilo utente se esistono.
      - usa SEMPRE prima il Profilo utente
      - NON riassumere se il dato esiste già
      - NON reinterpretare
      - NON trasformare i dati in descrizioni generiche
      - riporta i dati reali presenti nel profilo

      Esempio:
      se nel profilo c'è:
      "interests: domotica, musica, moto"

      devi rispondere usando quei dati reali.

      Se il profilo contiene una lista:
      - mostrala direttamente
      - non accorciarla
      - non scegliere solo alcune parti


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

    let reply =
      completion.choices[0]?.message?.content ||
      "Non so cosa dire.";

    let clarificationQuestion = "";

    const lowerMessage = message.toLowerCase();

    const possibleEpisode =
      lowerMessage.includes("ieri") ||
      lowerMessage.includes("oggi") ||
      lowerMessage.includes("domani") ||
      lowerMessage.includes("stamattina") ||
      lowerMessage.includes("stasera") ||
      lowerMessage.includes("sono andato") ||
      lowerMessage.includes("siamo andati") ||
      lowerMessage.includes("ho fatto") ||
      lowerMessage.includes("è successo");

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

    const detectedTopics: {
      topic: string;
      category: string;
      entity_type: string;
      needs_clarification?: boolean;
    }[] = [];

    if (
      lowerMessage.includes("home assistant") ||
      lowerMessage.includes("domotica")
    ) {
      detectedTopics.push({
        topic: "Home Assistant",
        category: "home",
        entity_type: "system",
      });
    }

    if (
      lowerMessage.includes("palestra") ||
      lowerMessage.includes("allenamento")
    ) {
      detectedTopics.push({
        topic: "Palestra",
        category: "health",
        entity_type: "habit",
      });
    }

    if (
      lowerMessage.includes("lavoro") ||
      lowerMessage.includes("azienda")
    ) {
      detectedTopics.push({
        topic: "Lavoro",
        category: "work",
        entity_type: "work",
      });
    }

    if (
      lowerMessage.includes("moto") ||
      lowerMessage.includes("vespa") ||
      lowerMessage.includes("piaggio")
    ) {
      detectedTopics.push({
        topic: "Moto / Piaggio",
        category: "passion",
        entity_type: "passion",
      });
    }

    if (
      lowerMessage.includes("ghostme") ||
      lowerMessage.includes("ghost")
    ) {
      detectedTopics.push({
        topic: "GhostMe",
        category: "project",
        entity_type: "project",
      });
    }

    const words = message
      .split(/\s+/)
      .map((word: string) =>
        word.replace(/[.,!?;:()"]/g, "").trim()
      )
      .filter(Boolean);

    const ignoredWords = [
      "ciao",
      "oggi",
      "domani",
      "ieri",
      "come",
      "cosa",
      "sono",
      "voglio",
      "vorrei",
      "perché",
      "quando",
      "dove",
      "ghostme",
      "era",
      "ero",
      "sto",
      "stavo",
      "appena",
      "lavorando",
      "memoria",
      "conversazioni",
      "test",
      "mare",
      "casa",
      "passeggiata",
      "stanca",
      "invece",
      "per",
    ];

    const possibleNames = words.filter((word: string) => {
      if (word.length < 3) return false;
      if (ignoredWords.includes(word.toLowerCase())) return false;

      return /^[A-ZÀ-Ù][a-zà-ù]+$/.test(word);
    });

    possibleNames.forEach((name: string) => {
      detectedTopics.push({
        topic: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        category: "unknown",
        entity_type: "unknown",
        needs_clarification: true,
      });
    });

    console.log("WORDS:", words);
console.log("POSSIBLE NAMES:", possibleNames);
console.log("DETECTED TOPICS:", detectedTopics);

    if (shouldSaveMemory && body.userId) {

      const { data: existingMemories } = await supabase
            .from("memories_active")
            .select("id, content")
            .eq("user_id", body.userId)
            .ilike("content", `%${message.slice(0, 40)}%`)
            .limit(1);

          if (existingMemories && existingMemories.length > 0) {
            const existing = existingMemories[0];

            await supabase
              .from("memories_active")
              .update({
                importance: 8,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);

            console.log(
              "MEMORY CONSOLIDATED:",
              existing.id
            );
          } else {
                      


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
   }

   console.log("LIFE TOPICS USER ID:", body.userId);
console.log("LIFE TOPICS TO SAVE:", detectedTopics);

    if (body.userId && detectedTopics.length > 0) {
      for (const item of detectedTopics) {

console.log("SAVING LIFE TOPIC:", item);

        const { data: existingTopic } = await supabase
          .from("life_topics")
          .select("*")
          .eq("user_id", body.userId)
          .eq("topic", item.topic)
          .maybeSingle();

        if (existingTopic) {
          const nextMentionCount =
            (existingTopic.mention_count || 0) + 1;

          const nextWeight = Math.min(
            (existingTopic.weight || 1) + 1,
            10
          );

        const shouldAskClarification =
          nextMentionCount >= 3 &&
          !existingTopic.description &&
          existingTopic.entity_type === "unknown";

            if (shouldAskClarification) {
              clarificationQuestion = `

            Ti sento nominare spesso ${item.topic}. Chi è o cos'è per te?`;
          }

          await supabase
            .from("life_topics")
            .update({
              weight: nextWeight,
              mention_count: nextMentionCount,
              status: shouldAskClarification
                ? "needs_clarification"
                : "active",
              needs_clarification: shouldAskClarification,
              clarification_asked: shouldAskClarification
                ? true
                : existingTopic.clarification_asked,
              entity_type:
                existingTopic.entity_type || item.entity_type,
              last_mentioned_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingTopic.id);
        } else {
          const { data: insertedTopic, error: insertTopicError } =
            await supabase
              .from("life_topics")
              .insert([
                {
                  user_id: body.userId,
                  topic: item.topic,
                  category: item.category,
                  entity_type: item.entity_type,
                  weight: 1,
                  status: item.needs_clarification
                    ? "unknown"
                    : "active",
                  mention_count: 1,
                  needs_clarification:
                    item.needs_clarification || false,
                  notes: message,
                },
              ])
              .select();

          console.log("INSERTED LIFE TOPIC:", insertedTopic);
          console.log("INSERT LIFE TOPIC ERROR:", insertTopicError);
        }
      }
    }

      if (clarificationQuestion) {
        reply = `${reply}${clarificationQuestion}`;
      }

    if (body.userId && possibleEpisode) {
  const relatedTopics = detectedTopics.map(
    (t) => t.topic
  );

const { data: episodicData, error: episodicError } =
  await supabase
    .from("episodic_memories")
    .insert([
      {
        user_id: body.userId,
        summary: message,
        emotional_tone: "neutral",
        importance: Math.min(
          relatedTopics.length + 1,
          10
        ),
        related_topics: relatedTopics,
      },
    ])
    .select();

console.log("EPISODIC DATA:", episodicData);
console.log("EPISODIC ERROR:", episodicError);
 }
const { data: topicToClarify } = body.userId
  ? await supabase
      .from("life_topics")
      .select("*")
      .eq("user_id", body.userId)
      .eq("needs_clarification", true)
      .eq("clarification_asked", true)
      .is("description", null)
      .order("mention_count", { ascending: false })
      .limit(1)
      .maybeSingle()
  : { data: null };

if (body.userId && topicToClarify) {
  const classification = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Devi classificare una risposta dell'utente che spiega chi o cosa è un topic.

Rispondi SOLO con JSON valido.

Campi:
{
  "understood": true/false,
  "entity_type": "person" | "animal" | "project" | "place" | "habit" | "object" | "unknown",
  "category": "family" | "work" | "friend" | "home" | "project" | "passion" | "health" | "general",
  "description": "frase breve e chiara"
}

Se la risposta non spiega davvero chi/cosa è il topic, understood deve essere false.
        `,
      },
      {
        role: "user",
        content: `
Topic: ${topicToClarify.topic}

Risposta utente:
${message}
        `,
      },
    ],
    temperature: 0,
    max_tokens: 200,
  });

  const rawClassification =
    classification.choices[0]?.message?.content || "{}";

  let parsedClassification: any = null;

  try {
    parsedClassification = JSON.parse(rawClassification);
  } catch (err) {
    console.log("CLASSIFICATION PARSE ERROR:", err);
    console.log("RAW CLASSIFICATION:", rawClassification);
  }

  if (parsedClassification?.understood) {
    await supabase
      .from("life_topics")
      .update({
        entity_type:
          parsedClassification.entity_type || "unknown",
        category:
          parsedClassification.category || "general",
        description:
          parsedClassification.description || message,
        needs_clarification: false,
        clarification_asked: true,
        status: "known",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", body.userId)
      .eq("topic", topicToClarify.topic);

    const memoryContent =
      parsedClassification.description || message;

    const { data: existingTopicMemory } = await supabase
      .from("memories_active")
      .select("id")
      .eq("user_id", body.userId)
      .eq("title", `Info su ${topicToClarify.topic}`)
      .limit(1);

    if (existingTopicMemory && existingTopicMemory.length > 0) {
      await supabase
        .from("memories_active")
        .update({
          content: memoryContent,
          category: parsedClassification.category || "general",
          importance: 9,
          pinned: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTopicMemory[0].id);
    } else {
      await supabase
        .from("memories_active")
        .insert([
          {
            user_id: body.userId,
            title: `Info su ${topicToClarify.topic}`,
            content: memoryContent,
            category: parsedClassification.category || "general",
            importance: 9,
            pinned: true,
          },
        ]);
    }
  }
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