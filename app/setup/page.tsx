"use client";

import { useState } from "react";

const answers = [
  "Mi innervosisco facilmente",
  "Mi chiudo e parlo meno",
  "Cerco di controllare tutto",
  "Faccio battute o ironia",
];

export default function SetupPage() {
  const [selected, setSelected] = useState<
    { text: string; intensity: number }[]
  >([]);

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