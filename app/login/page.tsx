"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setChecking(false);
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!profile) {
        router.push("/setup/profile");
        return;
      }

      const { data: traits } = await supabase
        .from("traits")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!traits) {
        router.push("/setup");
        return;
      }

      router.push("/chat");
    }

    checkSession();
  }, [router]);

  async function loginWithMagicLink() {
    if (!email.trim()) {
      setMessage("Scrivi prima la mail, genio del male 😂");
      return;
    }

    setMessage("Invio link di accesso...");

    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/chat`
        : "http://localhost:3000/chat";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setMessage("Errore: " + error.message);
      return;
    }

    setMessage("Controlla la mail. Ti ho mandato il link di accesso.");
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-cyan-300">GhostMe controlla la sessione...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-5">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_38%)]" />

      <div className="relative w-full max-w-md rounded-[2rem] border border-cyan-400/25 bg-zinc-950/90 p-7 shadow-[0_0_60px_rgba(34,211,238,0.12)]">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
          GhostMe Access
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight">
          Entra nella tua mente.
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
          Inserisci la mail. Se hai già un profilo, GhostMe ti porta direttamente
          alla chat. Se manca qualcosa, ti guida nel setup.
        </p>

        <input
          className="mt-8 w-full rounded-2xl border border-cyan-500/25 bg-black px-4 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300"
          placeholder="La tua email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button
          onClick={loginWithMagicLink}
          className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-4 font-black text-black shadow-[0_0_25px_rgba(34,211,238,0.25)]"
        >
          Mandami il link
        </button>

        {message && <p className="mt-5 text-sm text-cyan-200">{message}</p>}
      </div>
    </main>
  );
}