export default function SetupPage() {
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
          Rispondi a poche domande. GhostMe inizierà a capire come reagisci,
          parli e prendi decisioni.
        </p>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-lg font-bold">
            Domanda 1
          </p>

          <p className="mt-3 text-zinc-300">
            Quando hai troppi problemi insieme, cosa succede più spesso?
          </p>

          <div className="mt-6 space-y-3">
            <button className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left hover:border-zinc-400">
              Mi innervosisco facilmente
            </button>

            <button className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left hover:border-zinc-400">
              Mi chiudo e parlo meno
            </button>

            <button className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left hover:border-zinc-400">
              Cerco di controllare tutto
            </button>

            <button className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-left hover:border-zinc-400">
              Faccio battute o ironia
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}