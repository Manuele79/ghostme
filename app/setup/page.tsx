"use client";

import { useState } from "react";

const answers = [
  "Mi innervosisco facilmente",
  "Mi chiudo e parlo meno",
  "Cerco di controllare tutto",
  "Faccio battute o ironia",
];

export default function SetupPage() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggleAnswer(answer: string) {
    if (selected.includes(answer)) {
      setSelected(selected.filter((item) => item !== answer));
      return;
    }

    setSelected([...selected, answer]);
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
          Puoi scegliere più risposte. Le persone vere non reagiscono mai in un
          modo solo, purtroppo siamo bug viventi 😄
        </p>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-lg font-bold">Domanda 1</p>

          <p className="mt-3 text-zinc-300">
            Quando hai troppi problemi insieme, cosa succede più spesso?
          </p>

          <div className="mt-6 space-y-3">
            {answers.map((answer) => {
              const isActive = selected.includes(answer);

              return (
                <button
                  key={answer}
                  onClick={() => toggleAnswer(answer)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-white bg-white text-black"
                      : "border-zinc-700 bg-zinc-900 text-white hover:border-zinc-400"
                  }`}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4">
            <p className="text-sm text-zinc-400">Risposte selezionate:</p>

            <p className="mt-2 text-sm text-zinc-200">
              {selected.length > 0 ? selected.join(", ") : "Nessuna per ora"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}