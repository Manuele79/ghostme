"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function loginWithMagicLink() {
    setMessage("Invio link di accesso...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/setup",
      },
    });

    if (error) {
      setMessage("Errore: " + error.message);
      return;
    }

    setMessage("Controlla la mail. Ti ho mandato il link di accesso.");
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          GhostMe Login
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Entra nel tuo profilo.
        </h1>

        <p className="mt-4 text-zinc-400">
          Inserisci la tua email. GhostMe ti manda un link magico per accedere.
          Niente password, niente rotture da ufficio postale.
        </p>

        <input
          className="mt-8 w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
          placeholder="La tua email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button
          onClick={loginWithMagicLink}
          className="mt-4 w-full rounded-2xl bg-white px-5 py-3 font-bold text-black"
        >
          Mandami il link
        </button>

        {message && (
          <p className="mt-5 text-sm text-green-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}