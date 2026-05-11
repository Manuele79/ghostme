"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const answers = [
  "Mi innervosisco facilmente",
  "Mi chiudo e parlo meno",
  "Cerco di controllare tutto",
  "Faccio battute o ironia",
];

const traitMap: Record<
  string,
  Record<string, number>
> = {
  "Mi innervosisco facilmente": {
    stress_interno: 3,
    impulsivita: 2,
  },

  "Mi chiudo e parlo meno": {
    chiusura_sociale: 3,
    stress_interno: 2,
  },

  "Cerco di controllare tutto": {
    controllo: 3,
    ansia_controllo: 2,
  },

  "Faccio battute o ironia": {
    sarcasmo: 3,
    evasione_emotiva: 2,
  },
};

export default function SetupPage() {
  const [selected, setSelected] = useState<
    { text: string; intensity: number }[]
  >([]);

  async function testSupabase() {
  const { data, error } = await supabase
    .from("questions")
    .select("*");

  console.log("SUPABASE DATA:", data);
  console.log("SUPABASE ERROR:", error);
}

async function saveProfile() {
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert([
      {
        name: "Test User",
      },
    ])
    .select()
    .single();

  console.log("USER:", userData);
  console.log("USER ERROR:", userError);

  if (!userData) return;

  const calculatedTraits: Record<string, number> = {};

    selected.forEach((item) => {
      const mapping = traitMap[item.text];

      if (!mapping) return;

      Object.entries(mapping).forEach(([trait, value]) => {
        const total = value * item.intensity;

        calculatedTraits[trait] =
          (calculatedTraits[trait] || 0) + total;
      });
    });

    console.log("CALCULATED TRAITS:", calculatedTraits);

    const { data: traitsData, error: traitsError } =
      await supabase
        .from("traits")
        .insert([
          {
            user_id: userData.id,

            sarcasmo:
              calculatedTraits.sarcasmo || 0,

            controllo:
              calculatedTraits.controllo || 0,

            impulsivita:
              calculatedTraits.impulsivita || 0,

            ansia:
              calculatedTraits.ansia_controllo || 0,
          },
        ]);

    console.log("TRAITS:", traitsData);
    console.log("TRAITS ERROR:", traitsError);

  const answersToInsert = selected.map((item) => ({
    user_id: userData.id,
    question_id: "stress_01",
    selected_answers: [item.text],
    intensita: item.intensity,
  }));

  const { data: answersData, error: answersError } = await supabase
    .from("answers")
    .insert(answersToInsert);

  console.log("ANSWERS:", answersData);
  console.log("ANSWERS ERROR:", answersError);
}

  function toggleAnswer(answer: string) {
    const exists = selected.find((item) => item.text === answer);

    if (exists) {
      setSelected(selected.filter((item) => item.text !== answer));
      return;
    }

    setSelected([
      ...selected,
      {
        text: answer,
        intensity: 3,
      },
    ]);
  }

  function updateIntensity(answer: string, intensity: number) {
    setSelected(
      selected.map((item) =>
        item.text === answer
          ? { ...item, intensity }
          : item
      )
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
          Le persone vere sono incoerenti, complicate e piene di bug 😄
        </p>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-lg font-bold">Domanda 1</p>

          <p className="mt-3 text-zinc-300">
            Quando hai troppi problemi insieme, cosa succede più spesso?
          </p>

          <div className="mt-6 space-y-4">
            {answers.map((answer) => {
              const activeItem = selected.find(
                (item) => item.text === answer
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
                    onClick={() => toggleAnswer(answer)}
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
                              updateIntensity(answer, level)
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

          <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-4">
            <p className="text-sm text-zinc-400">
              Stato mentale attuale:
            </p>

            <button
              onClick={testSupabase}
              className="mt-6 rounded-2xl bg-white px-5 py-3 text-black font-bold"
            >
              Test Supabase
            </button>

            <button
              onClick={saveProfile}
              className="mt-3 ml-3 rounded-2xl bg-green-500 px-5 py-3 text-black font-bold"
            >
              Salva Profilo
            </button>

            <div className="mt-3 space-y-2 text-sm text-zinc-200">
              {selected.length === 0 && (
                <p>Nessuna risposta selezionata</p>
              )}

              {selected.map((item) => (
                <div key={item.text}>
                  • {item.text} — Intensità {item.intensity}/5
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}