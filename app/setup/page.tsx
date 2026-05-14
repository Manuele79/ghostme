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
  },
  {
    id: "affetto_01",
    title: "Domanda 11 — Affetto",
    text: "Quando tieni davvero a qualcuno, come lo dimostri?",
    answers: [
      "Cerco presenza continua",
      "Aiuto nelle cose pratiche",
      "Mi apro molto emotivamente",
      "Lo dimostro poco ma lo sento forte",
    ],
  },
  {
    id: "vulnerabilita_01",
    title: "Domanda 12 — Vulnerabilità",
    text: "Quanto ti riesce facile mostrare fragilità?",
    answers: [
      "Molto facilmente",
      "Solo con poche persone",
      "Quasi mai",
      "Uso ironia per nasconderle",
    ],
  },
  {
    id: "ego_01",
    title: "Domanda 13 — Ego",
    text: "Se qualcuno ti sottovaluta, cosa senti più spesso?",
    answers: [
      "Rabbia",
      "Bisogno di dimostrare",
      "Indifferenza",
      "Mi ferisce molto",
    ],
  },
  {
    id: "bisogno_01",
    title: "Domanda 14 — Bisogno emotivo",
    text: "Quanto soffri quando perdi attenzioni da una persona importante?",
    answers: [
      "Moltissimo",
      "Abbastanza",
      "Poco",
      "Fingo che non mi importi",
    ],
  },
  {
    id: "fiducia_01",
    title: "Domanda 15 — Fiducia",
    text: "Quando qualcuno ti delude, come cambia il rapporto?",
    answers: [
      "Faccio fatica a fidarmi di nuovo",
      "Perdono ma non dimentico",
      "Ne parlo subito",
      "Taglio completamente",
    ],
  },
  {
    id: "socialita_01",
    title: "Domanda 16 — Socialità",
    text: "In mezzo agli altri, di solito come ti comporti?",
    answers: [
      "Parlo facilmente",
      "Osservo prima di espormi",
      "Mi stanco presto",
      "Cerco di far ridere",
    ],
  },
  {
    id: "ansia_01",
    title: "Domanda 17 — Ansia",
    text: "Quando non sai cosa succederà, cosa ti viene naturale fare?",
    answers: [
      "Penso a mille scenari",
      "Cerco informazioni",
      "Mi agito ma non lo mostro",
      "Faccio finta che vada tutto bene",
    ],
  },
  {
    id: "controllo_01",
    title: "Domanda 18 — Controllo",
    text: "Quando qualcosa non va come vuoi, cosa fai?",
    answers: [
      "Provo a sistemarla subito",
      "Mi irrito",
      "Delego se mi fido",
      "Mi blocco un attimo",
    ],
  },
  {
    id: "empatia_01",
    title: "Domanda 19 — Empatia",
    text: "Quando qualcuno sta male, come reagisci?",
    answers: [
      "Cerco di aiutarlo subito",
      "Ascolto senza giudicare",
      "Mi pesa emotivamente",
      "Non so sempre cosa dire",
    ],
  },
  {
    id: "evitamento_01",
    title: "Domanda 20 — Evitamento",
    text: "Quando una situazione ti pesa, cosa fai più spesso?",
    answers: [
      "La rimando",
      "Mi distraggo con altro",
      "La affronto a forza",
      "Sparisco per un po’",
    ],
  },
];

const traitMap: Record<string, Record<string, number>> = {
  "Mi innervosisco facilmente": { ansia: 3, impulsivita: 2 },
  "Mi chiudo e parlo meno": { sensibilita_critiche: 2, ansia: 2 },
  "Cerco di controllare tutto": { controllo: 3, ansia: 2 },
  "Faccio battute o ironia": { sarcasmo: 3 },

  "Rispondo subito": { orgoglio: 3, impulsivita: 2 },
  "Sto zitto ma me la lego": { orgoglio: 2, sensibilita_critiche: 3 },
  "Faccio una battuta pungente": { sarcasmo: 3, orgoglio: 2 },
  "Evito la scena e ne parlo dopo": { controllo: 2, impulsivita: -1 },

  "Chiedo subito cosa c’è": { empatia: 2, controllo: 1 },
  "Aspetto ma ci sto male": { ansia: 3, sensibilita_critiche: 2 },
  "Fingo niente ma cambio atteggiamento": { orgoglio: 2, sensibilita_critiche: 2 },
  "Mi distacco anch’io": { orgoglio: 3, empatia: -1, paura_abbandono: 1 },

  "Ragiono molto prima di scegliere": { controllo: 2, ansia: 1 },
  "Vado abbastanza di pancia": { impulsivita: 3 },
  "Chiedo consiglio": { socialita: 2, empatia: 1 },
  "Rimando finché posso": { ansia: 2, controllo: -1, evitamento: 2 },

  "Sono diretto": { sincerita: 2, controllo: 1 },
  "Cerco di addolcirla": { empatia: 3, sincerita: 1 },
  "Uso ironia": { sarcasmo: 3 },
  "Evito finché posso": { ansia: 2, evitamento: 3 },

  "Esplodo subito": { rabbia: 3, impulsivita: 3 },
  "Mi chiudo e sparisco": { evitamento: 3, ansia: 2 },
  "Divento freddo": { controllo: 2, orgoglio: 2 },
  "Tengo tutto dentro": { ansia: 2, sensibilita_critiche: 2 },

  "Mi infastidisco subito": { gelosia: 3, orgoglio: 1 },
  "Fingo indifferenza": { orgoglio: 2, controllo: 1 },
  "Mi confronto direttamente": { sincerita: 2, controllo: 1 },

  "Cerco subito spiegazioni": { paura_abbandono: 3, ansia: 1 },
  "Faccio finta di niente": { controllo: 1, evitamento: 2 },

  "La dico comunque": { sincerita: 3, orgoglio: 1 },
  "La addolcisco": { empatia: 2, sincerita: 1 },
  "Evito il discorso": { ansia: 2, evitamento: 3 },
  "Uso ironia o battute": { sarcasmo: 3 },

  "Non dimentico facilmente": { orgoglio: 3, sensibilita_critiche: 2 },
  "Faccio finta di nulla": { controllo: 1, evitamento: 2 },
  "Mi allontano": { orgoglio: 2, evitamento: 2 },
  "Affronto subito la situazione": { sincerita: 2, impulsivita: 1 },

  "Cerco presenza continua": { paura_abbandono: 2, bisogno_affetto: 3 },
  "Aiuto nelle cose pratiche": { empatia: 2, controllo: 1 },
  "Mi apro molto emotivamente": { empatia: 3, vulnerabilita: 3 },
  "Lo dimostro poco ma lo sento forte": { bisogno_affetto: 2, vulnerabilita: -1 },

  "Molto facilmente": { vulnerabilita: 3, empatia: 1 },
  "Solo con poche persone": { controllo: 1, vulnerabilita: 1 },
  "Quasi mai": { orgoglio: 2, controllo: 2, vulnerabilita: -2 },
  "Uso ironia per nasconderle": { sarcasmo: 3, vulnerabilita: -1 },

  "Rabbia": { rabbia: 3, impulsivita: 2 },
  "Bisogno di dimostrare": { orgoglio: 3, controllo: 1 },
  "Indifferenza": { controllo: 1 },
  "Mi ferisce molto": { sensibilita_critiche: 3, ansia: 1 },

  "Moltissimo": { paura_abbandono: 3, bisogno_affetto: 3 },
  "Abbastanza": { paura_abbandono: 2, bisogno_affetto: 1 },
  "Poco": { controllo: 1 },
  "Fingo che non mi importi": { orgoglio: 2, evitamento: 1 },

  "Faccio fatica a fidarmi di nuovo": { fiducia: -3, sensibilita_critiche: 2 },
  "Perdono ma non dimentico": { fiducia: -1, orgoglio: 2 },
  "Ne parlo subito": { sincerita: 2, empatia: 1 },
  "Taglio completamente": { fiducia: -3, orgoglio: 3 },

  "Parlo facilmente": { socialita: 3 },
  "Osservo prima di espormi": { controllo: 2, socialita: -1 },
  "Mi stanco presto": { socialita: -2, ansia: 1 },
  "Cerco di far ridere": { sarcasmo: 2, socialita: 2 },

  "Penso a mille scenari": { ansia: 3 },
  "Cerco informazioni": { controllo: 2 },
  "Mi agito ma non lo mostro": { ansia: 2, controllo: 1 },
  "Faccio finta che vada tutto bene": { evitamento: 2 },

  "Provo a sistemarla subito": { controllo: 3 },
  "Mi irrito": { rabbia: 2, impulsivita: 1 },
  "Delego se mi fido": { fiducia: 2, controllo: -1 },
  "Mi blocco un attimo": { ansia: 2 },

  "Cerco di aiutarlo subito": { empatia: 3 },
  "Ascolto senza giudicare": { empatia: 3, controllo: -1 },
  "Mi pesa emotivamente": { empatia: 2, ansia: 1 },
  "Non so sempre cosa dire": { ansia: 1, empatia: 1 },

  "La rimando": { evitamento: 3, ansia: 1 },
  "Mi distraggo con altro": { evitamento: 3 },
  "La affronto a forza": { controllo: 2, sincerita: 1 },
  "Sparisco per un po’": { evitamento: 3, ansia: 2 },
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

  const calculatedTraits = useMemo(() => calculateTraits(selected), [selected]);
  const personalitySummary = useMemo(
    () => buildPersonalitySummary(calculatedTraits),
    [calculatedTraits]
  );

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
        .limit(80);

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

    setSelected([...selected, { questionId, text: answer, intensity: 3 }]);
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

  if (!user) {
    setSaveMessage("Utente non autenticato.");
    return;
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .upsert(
      [{ id: user.id, name: user.email, email: user.email }],
      { onConflict: "id" }
    )
    .select()
    .single();

  if (!userData || userError) {
    console.log("USER ERROR:", userError);
    setSaveMessage("Errore salvataggio utente.");
    return;
  }

  // Pulisce vecchio test dello stesso utente
  await supabase.from("answers").delete().eq("user_id", userData.id);
  await supabase.from("traits").delete().eq("user_id", userData.id);

  const { error: traitsError } = await supabase.from("traits").insert([
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
      paura_abbandono: calculatedTraits.paura_abbandono || 0,
      sincerita: calculatedTraits.sincerita || 0,
      fiducia: calculatedTraits.fiducia || 0,
      rabbia: calculatedTraits.rabbia || 0,
      vulnerabilita: calculatedTraits.vulnerabilita || 0,
      bisogno_affetto: calculatedTraits.bisogno_affetto || 0,
      evitamento: calculatedTraits.evitamento || 0,
    },
  ]);

  const answersToInsert = selected.map((item) => ({
    user_id: userData.id,
    question_id: item.questionId,
    selected_answers: [item.text],
    intensita: item.intensity,
  }));

  const { error: answersError } = await supabase
    .from("answers")
    .insert(answersToInsert);

  if (traitsError || answersError) {
    console.log("TRAITS ERROR:", traitsError);
    console.log("ANSWERS ERROR:", answersError);
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
          Puoi scegliere più risposte per ogni domanda. Poi dai intensità da 1 a 5.
        </p>

        <div className="mt-10 space-y-8">
          {questions.map((question) => (
            <div key={question.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-lg font-bold">{question.title}</p>
              <p className="mt-3 text-zinc-300">{question.text}</p>

              <div className="mt-6 space-y-4">
                {question.answers.map((answer) => {
                  const activeItem = selected.find(
                    (item) => item.questionId === question.id && item.text === answer
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
                          <p className="text-sm opacity-70">Quanto ti rappresenta?</p>

                          <div className="mt-3 flex gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <button
                                key={level}
                                onClick={() => updateIntensity(question.id, answer, level)}
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

          {saveMessage && <p className="mt-4 text-sm text-green-300">{saveMessage}</p>}

          <div className="mt-5 space-y-2 text-sm text-zinc-200">
            {selected.length === 0 && <p>Nessuna risposta selezionata</p>}

            {selected.map((item, index) => (
              <div key={`${item.questionId}-${item.text}-${index}`}>
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