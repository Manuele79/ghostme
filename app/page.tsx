export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      
      <h1 className="text-6xl font-black tracking-tight">
        Ghost<span className="text-zinc-500">Me</span>
      </h1>

      <p className="mt-6 text-zinc-400 text-center max-w-xl text-lg">
        An AI that learns how you think.
      </p>

      <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-5 max-w-xl text-center">
        <p className="text-sm text-zinc-300">
          GhostMe is starting to build your behavioral profile.
        </p>

        <p className="mt-3 text-xs text-zinc-500">
          V1 — Personality Simulation Core
        </p>
      </div>

    </main>
  );
}