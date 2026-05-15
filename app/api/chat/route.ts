import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  detectTopicsFromMessage,
  isPossibleEpisode,
  detectEmotionalTone,
  shouldSaveActiveMemory,
  detectMemoryCategory,
} from "@/lib/ghostme/topicDetector";
import { buildContextualMemory } from "@/lib/ghostme/retrieval";
import { generateDailyConversationSummary } from "@/lib/ghostme/conversationSummary";

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
let profileContext = "";
let lifeTopicsContext = "";
let episodicContext = "";

let loadedLifeTopics: any[] = [];

const detectedTopics = detectTopicsFromMessage(message);

if (body.userId) {
  console.log("BODY USER ID:", body.userId);

  const { data: userProfile, error: userProfileError } =
    await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", body.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  console.log("USER PROFILE RAW:", userProfile);
  console.log("USER PROFILE ERROR:", userProfileError);

  if (userProfile) {
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

  const contextualData =
    await buildContextualMemory({
      userId: body.userId,
      detectedTopics,
    });

  memoryContext = contextualData.memoryContext;
  episodicContext = contextualData.episodicContext;
  lifeTopicsContext =
    contextualData.lifeTopicsContext;

  const { data: existingTopics } = await supabase
    .from("life_topics")
    .select("*")
    .eq("user_id", body.userId);

  loadedLifeTopics = existingTopics || [];
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

      const possibleEpisode = isPossibleEpisode(message);
      const emotionalTone = detectEmotionalTone(message);

      const shouldSaveMemory = shouldSaveActiveMemory(message);
      const memoryCategory = detectMemoryCategory(message);


      console.log("DETECTED TOPICS:", detectedTopics);

      console.log("MEMORY USER ID:", body.userId);
      console.log("SHOULD SAVE MEMORY:", shouldSaveMemory);    
      


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
        const detectedTopicNames = detectedTopics.map(
          (t) => t.topic
        );

        const knownTopicNames = loadedLifeTopics
          .filter((t) =>
            lowerMessage.includes(
              String(t.topic).toLowerCase()
            )
          )
          .map((t) => t.topic);

        const relatedTopics = Array.from(
          new Set([...detectedTopicNames, ...knownTopicNames])
        );

        const { data: episodicData, error: episodicError } =
          await supabase
            .from("episodic_memories")
            .insert([
              {
                user_id: body.userId,
                summary: message,
                emotional_tone: emotionalTone,
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

        for (const topic of relatedTopics) {
          const updateData: any = {
            last_emotional_tone: emotionalTone,
            relationship_strength: 2,
            updated_at: new Date().toISOString(),
          };

          if (emotionalTone === "positive") {
            updateData.positive_count = 1;
          }

          if (emotionalTone === "negative") {
            updateData.negative_count = 1;
          }

          if (emotionalTone === "neutral") {
            updateData.neutral_count = 1;
          }

          const { data: existingTopic } = await supabase
            .from("life_topics")
            .select("*")
            .eq("user_id", body.userId)
            .eq("topic", topic)
            .maybeSingle();

          if (existingTopic) {
            await supabase
              .from("life_topics")
              .update({
                positive_count:
                  (existingTopic.positive_count || 0) +
                  (emotionalTone === "positive" ? 1 : 0),
                negative_count:
                  (existingTopic.negative_count || 0) +
                  (emotionalTone === "negative" ? 1 : 0),
                neutral_count:
                  (existingTopic.neutral_count || 0) +
                  (emotionalTone === "neutral" ? 1 : 0),
                relationship_strength: Math.min(
                  (existingTopic.relationship_strength || 1) + 1,
                  10
                ),
                last_emotional_tone: emotionalTone,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingTopic.id);
          }
        }

        if (relatedTopics.length >= 2) {
          for (let i = 0; i < relatedTopics.length; i++) {
            for (let j = i + 1; j < relatedTopics.length; j++) {
              const source = relatedTopics[i];
              const target = relatedTopics[j];

              const { data: existingLink } = await supabase
                .from("topic_links")
                .select("*")
                .eq("user_id", body.userId)
                .eq("source_topic", source)
                .eq("target_topic", target)
                .maybeSingle();

              if (existingLink) {
                await supabase
                  .from("topic_links")
                  .update({
                    weight: Math.min(
                      (existingLink.weight || 1) + 1,
                      10
                    ),
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingLink.id);
              } else {
                await supabase.from("topic_links").insert([
                  {
                    user_id: body.userId,
                    source_topic: source,
                    target_topic: target,
                    link_type: "mentioned_together",
                    weight: 1,
                  },
                ]);
              }
            }
          }
        }
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



      const directTopicToClassify =
        topicToClarify ||
        detectedTopics.find((item) => {
          const topicLower = item.topic.toLowerCase();

          return (
            lowerMessage.includes(topicLower) &&
            (
            lowerMessage.includes("amica") ||
            lowerMessage.includes("amico") ||
            lowerMessage.includes("collega") ||
            lowerMessage.includes("moglie") ||
            lowerMessage.includes("marito") ||
            lowerMessage.includes("figlio") ||
            lowerMessage.includes("figlia") ||
            lowerMessage.includes("cane") ||
            lowerMessage.includes("gatto") ||
            lowerMessage.includes("cliente") ||
            lowerMessage.includes("capo") ||
            lowerMessage.includes("fratello") ||
            lowerMessage.includes("sorella")
            )
          );
        });

    if (body.userId && directTopicToClassify) {
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

if (body.userId) {
  try {
    await generateDailyConversationSummary(body.userId);
  } catch (err) {
    console.log("DAILY SUMMARY ERROR:", err);
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