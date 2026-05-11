"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildPersonalitySummary } from "@/lib/personality";

type SelectedAnswer = {
  questionId: string;
  text: string;
  intensity: number;
};

type Question = {
  id: string;
  title: string;
  text: string;
  answers: string[];
};

const questions: Question[] = [
  {
    id: "stress_01",
    title: "Domanda 1 — Stress",
    text: "Quando hai troppi problemi insieme, cosa succede più spesso?",
    answers: [
      "Mi innervosisco facilmente",
      "Mi chiudo e parlo meno",
      "Cerco di controllare tutto",
      "Faccio battute o ironia",
    ],
  },
  {
    id: "conflitto_01",
    title: "Domanda 2 — Conflitto",
    text: "Se qualcuno ti manca di rispetto davanti ad altri, cosa fai?",
    answers: [
      "Rispondo subito",
      "Sto zitto ma me la lego",
      "Faccio una battuta pungente",
      "Evito la scena e ne parlo dopo",
    ],
  },
  {
    id: "relazioni_01",
    title: "Domanda 3 — Relazioni",
    text: "Se una persona importante diventa fredda con te per giorni, cosa succede?",
    answers: [
      "Chiedo subito cosa c’è",
      "Aspetto ma ci sto male",
      "Fingo niente ma cambio atteggiamento",
      "Mi distacco anch’io",
    ],
  },
  {
    id: "decisioni_01",
    title: "Domanda 4 — Decisioni",
    text: "Quando devi prendere una decisione importante, come ti muovi?",
    answers: [
      "Ragiono molto prima di scegliere",
      "Vado abbastanza di pancia",
      "Chiedo consiglio",
      "Rimando finché posso",
    ],
  },
  {
    id: "comunicazione_01",
    title: "Domanda 5 — Comunicazione",
    text: "Quando devi dire una cosa scomoda, che stile usi?",
    answers: [
      "Sono diretto",
      "Cerco di addolcirla",
      "Uso ironia",
      "Evito finché posso",
    ],
  },
{
  id: "rabbia_01",
  title: "Domanda 6 — Rabbia",
  text: "Quando ti arrabbi davvero, cosa succede più spesso?",
  answers: [
    "Esplodo subito",
    "Mi chiudo e sparisco",
    "Divento freddo",
    "Tengo tutto dentro",
  ],
},

{
  id: "gelosia_01",
  title: "Domanda 7 — Gelosia",
  text: "Quando una persona importante dà attenzioni ad altri, come reagisci?",
  answers: [
    "Mi infastidisco subito",
    "Fingo indifferenza",
    "Mi confronto direttamente",
    "Tengo tutto dentro",
  ],
},

{
  id: "abbandono_01",
  title: "Domanda 8 — Distanza emotiva",
  text: "Se qualcuno si allontana senza spiegazioni, cosa fai?",
  answers: [
    "Cerco subito spiegazioni",
    "Aspetto ma sto male",
    "Mi distacco anch’io",
    "Faccio finta di niente",
  ],
},

{
  id: "sincerita_01",
  title: "Domanda 9 — Sincerità",
  text: "Quando una verità può ferire qualcuno, come ti comporti?",
  answers: [
    "La dico comunque",
    "La addolcisco",
    "Evito il discorso",
    "Uso ironia o battute",
  ],
},

{
  id: "orgoglio_01",
  title: "Domanda 10 — Orgoglio",
  text: "Quando qualcuno ti ferisce, qual è la tua reazione più comune?",
  answers: [
    "Non dimentico facilmente",
    "Faccio finta di nulla",
    "Mi allontano",
    "Affronto subito la situazione",
  ],
}
];

const traitMap: Record<string, Record<string, number>> = {
  "Mi innervosisco facilmente": {
    ansia: 3,
    impulsivita: 2,
  },
  "Mi chiudo e parlo meno": {
    sensibilita_critiche: 2,
    ansia: 2,
  },
  "Cerco di controllare tutto": {
    controllo: 3,
    ansia: 2,
  },
  "Faccio battute o ironia": {
    sarcasmo: 3,
  },

  "Rispondo subito": {
    orgoglio: 3,
    impulsivita: 2,
  },
  "Sto zitto ma me la lego": {
    orgoglio: 2,
    sensibilita_critiche: 3,
  },
  "Faccio una battuta pungente": {
    sarcasmo: 3,
    orgoglio: 2,
  },
  "Evito la scena e ne parlo dopo": {
    controllo: 2,
    impulsivita: -1,
  },

  "Chiedo subito cosa c’è": {
    empatia: 2,
    controllo: 1,
  },
  "Aspetto ma ci sto male": {
    ansia: 3,
    sensibilita_critiche: 2,
  },
  "Fingo niente ma cambio atteggiamento": {
    orgoglio: 2,
    sensibilita_critiche: 2,
  },
  "Mi distacco anch’io": {
    orgoglio: 3,
    empatia: -1,
  },

  "Ragiono molto prima di scegliere": {
    controllo: 2,
    ansia: 1,
  },
  "Vado abbastanza di pancia": {
    impulsivita: 3,
  },
  "Chiedo consiglio": {
    socialita: 2,
    empatia: 1,
  },
  "Rimando finché posso": {
    ansia: 2,
    controllo: -1,
  },

  "Sono diretto": {
    orgoglio: 1,
    controllo: 1,
  },
  "Cerco di addolcirla": {
    empatia: 3,
  },
  "Uso ironia": {
    sarcasmo: 3,
  },
  "Evito finché posso": {
    ansia: 2,
    sensibilita_critiche: 2,
  },
  "Esplodo subito": {
  impulsivita: 3,
  orgoglio: 1,
},

"Mi chiudo e sparisco": {
  sensibilita_critiche: 2,
  ansia: 2,
},

"Divento freddo": {
  controllo: 2,
  orgoglio: 2,
},

"Tengo tutto dentro": {
  ansia: 2,
  sensibilita_critiche: 2,
},

"Mi infastidisco subito": {
  gelosia: 3,
  orgoglio: 1,
},

"Fingo indifferenza": {
  orgoglio: 2,
  controllo: 1,
},

"Mi confronto direttamente": {
  sincerita: 2,
  controllo: 1,
},

"Cerco subito spiegazioni": {
  paura_abbandono: 3,
  ansia: 1,
},

"Aspetto ma sto male": {
  paura_abbandono: 2,
  ansia: 2,
},

"Faccio finta di niente": {
  controllo: 1,
  sensibilita_critiche: 1,
},

"La dico comunque": {
  sincerita: 3,
  orgoglio: 1,
},

"La addolcisco": {
  empatia: 2,
  sincerita: 1,
},

"Evito il discorso": {
  ansia: 2,
  sensibilita_critiche: 1,
},

"Uso ironia o battute": {
  sarcasmo: 3,
},

"Non dimentico facilmente": {
  orgoglio: 3,
  sensibilita_critiche: 2,
},

"Mi allontano": {
  orgoglio: 2,
  paura_abbandono: 1,
},

"Affronto subito la situazione": {
  sincerita: 2,
  impulsivita: 1,
},
};

function calculateTraits(selected: SelectedAnswer[]) {
  const calculatedTraits: Record<string, number> = {};

  selected.forEach((item) => {
    const mapping = traitMap[item.text];
    if (!mapping) return;

    Object.entries(mapping).forEach(([trait, value]) => {
      const total = value * item.intensity;
      calculatedTraits[trait] = (calculatedTraits[trait] || 0) + total;
    });
  });

  return calculatedTraits;
}

export default function SetupPage() {
  const [selected, setSelected] = useState<SelectedAnswer[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const calculatedTraits = useMemo(() => {
    return calculateTraits(selected);
  }, [selected]);

  const personalitySummary = useMemo(() => {
    return buildPersonalitySummary(calculatedTraits);
  }, [calculatedTraits]);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data: latestAnswers, error } = await supabase
        .from("answers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      console.log("LOADED ANSWERS:", latestAnswers);
      console.log("LOAD ERROR:", error);

      if (latestAnswers && latestAnswers.length > 0) {
        const restored = latestAnswers.map((answer) => ({
          questionId: answer.question_id,
          text: answer.selected_answers?.[0] || "",
          intensity: answer.intensita || 3,
        }));

        setSelected(restored.reverse());
      }

      setLoadingProfile(false);
    }

    loadProfile();
  }, []);

  function toggleAnswer(questionId: string, answer: string) {
    const exists = selected.find(
      (item) => item.questionId === questionId && item.text === answer
    );

    if (exists) {
      setSelected(
        selected.filter(
          (item) => !(item.questionId === questionId && item.text === answer)
        )
      );
      return;
    }

    setSelected([
      ...selected,
      {
        questionId,
        text: answer,
        intensity: 3,
      },
    ]);
  }

  function updateIntensity(questionId: string, answer: string, intensity: number) {
    setSelected(
      selected.map((item) =>
        item.questionId === questionId && item.text === answer
          ? { ...item, intensity }
          : item
      )
    );
  }

  async function saveProfile() {
    setSaveMessage("Salvataggio in corso...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user);

    if (!user) {
      setSaveMessage("Utente non autenticato.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert([
        {
          id: user.id,
          name: user.email,
          email: user.email,
        },
      ])
      .select()
      .single();

    console.log("USER:", userData);
    console.log("USER ERROR:", userError);

    if (!userData || userError) {
      setSaveMessage("Errore salvataggio utente.");
      return;
    }

    console.log("CALCULATED TRAITS:", calculatedTraits);
    console.log("PERSONALITY:", personalitySummary);

    const { data: traitsData, error: traitsError } = await supabase
      .from("traits")
      .insert([
        {
          user_id: userData.id,
          sarcasmo: calculatedTraits.sarcasmo || 0,
          empatia: calculatedTraits.empatia || 0,
          orgoglio: calculatedTraits.orgoglio || 0,
          gelosia: calculatedTraits.gelosia || 0,
          controllo: calculatedTraits.controllo || 0,
          ansia: calculatedTraits.ansia || 0,
          impulsivita: calculatedTraits.impulsivita || 0,
          socialita: calculatedTraits.socialita || 0,
          sensibilita_critiche: calculatedTraits.sensibilita_critiche || 0,
        },
      ]);

    console.log("TRAITS:", traitsData);
    console.log("TRAITS ERROR:", traitsError);

    const answersToInsert = selected.map((item) => ({
      user_id: userData.id,
      question_id: item.questionId,
      selected_answers: [item.text],
      intensita: item.intensity,
    }));

    const { data: answersData, error: answersError } = await supabase
      .from("answers")
      .insert(answersToInsert);

    console.log("ANSWERS:", answersData);
    console.log("ANSWERS ERROR:", answersError);

    if (traitsError || answersError) {
      setSaveMessage("Profilo creato, ma c'è stato un errore su traits/risposte.");
      return;
    }

    setSaveMessage("Profilo salvato correttamente.");
  }

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">GhostMe sta caricando il profilo...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          GhostMe Setup
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Costruiamo il tuo primo profilo.
        </h1>

        <p className="mt-4 text-zinc-400">
          Puoi scegliere più risposte per ogni domanda. Poi dai intensità da 1 a
          5. Qui GhostMe inizia a farsi i fatti tuoi con metodo 😄
        </p>

        <div className="mt-10 space-y-8">
          {questions.map((question) => (
            <div
              key={question.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <p className="text-lg font-bold">{question.title}</p>

              <p className="mt-3 text-zinc-300">{question.text}</p>

              <div className="mt-6 space-y-4">
                {question.answers.map((answer) => {
                  const activeItem = selected.find(
                    (item) =>
                      item.questionId === question.id && item.text === answer
                  );

                  const isActive = !!activeItem;

                  return (
                    <div
                      key={answer}
                      className={`rounded-2xl border p-4 transition ${
                        isActive
                          ? "border-white bg-white text-black"
                          : "border-zinc-700 bg-zinc-900 text-white"
                      }`}
                    >
                      <button
                        onClick={() => toggleAnswer(question.id, answer)}
                        className="w-full text-left"
                      >
                        {answer}
                      </button>

                      {isActive && (
                        <div className="mt-4">
                          <p className="text-sm opacity-70">
                            Quanto ti rappresenta?
                          </p>

                          <div className="mt-3 flex gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                onClick={() =>
                                  updateIntensity(question.id, answer, level)
                                }
                                className={`h-10 w-10 rounded-full border text-sm font-bold transition ${
                                  activeItem.intensity === level
                                    ? "bg-black text-white border-black"
                                    : "border-zinc-400"
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-4">
          <p className="text-sm text-zinc-400">Stato mentale attuale:</p>

          <button
            onClick={saveProfile}
            className="mt-4 rounded-2xl bg-green-500 px-5 py-3 text-black font-bold"
          >
            Salva Profilo
          </button>

          {saveMessage && (
            <p className="mt-4 text-sm text-green-300">{saveMessage}</p>
          )}

          <div className="mt-5 space-y-2 text-sm text-zinc-200">
            {selected.length === 0 && <p>Nessuna risposta selezionata</p>}

            {selected.map((item) => (
              <div key={`${item.questionId}-${item.text}`}>
                • {item.text} — Intensità {item.intensity}/5
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-6">
          <p className="text-lg font-bold text-cyan-300">GhostMe pensa:</p>

          <div className="mt-4 space-y-2 text-sm text-cyan-100">
            {personalitySummary.map((line, index) => (
              <p key={index}>• {line}</p>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}