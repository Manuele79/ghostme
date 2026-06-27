import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type MentalStatePatch = {
  stress?: number;
  entusiasmo?: number;
  stanchezza?: number;
  controllo?: number;
  nostalgia?: number;
  frustrazione?: number;
  focus?: number;
  socialita?: number;
  notes?: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function clean(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectOperationalMode(message: string) {
  const text = clean(message);

  if (
    [
      "codice",
      "typescript",
      "build",
      "bug",
      "debug",
      "repo",
      "commit",
      "patch",
      "test",
      "api",
      "backend",
      "frontend",
      "cognitive core",
      "prompt",
    ].some((token) => text.includes(token))
  ) {
    return "sviluppo_intenso";
  }

  if (["piano", "roadmap", "architettura", "strategia"].some((token) => text.includes(token))) {
    return "pianificazione";
  }

  if (["relax", "pausa", "tranquillo", "casa", "serata"].some((token) => text.includes(token))) {
    return "relax";
  }

  return "conversazione";
}

function hasExplicitPressure(message: string) {
  const text = clean(message);
  return [
    "stress",
    "ansia",
    "panico",
    "pressione",
    "non ce la faccio",
    "sono a pezzi",
    "sto male",
    "deadline",
    "scadenza",
  ].some((token) => text.includes(token));
}

function normalizePatchForOperationalContext(
  patch: MentalStatePatch,
  message: string
) {
  const mode = detectOperationalMode(message);
  const explicitPressure = hasExplicitPressure(message);
  const next = { ...patch };

  if (mode === "sviluppo_intenso" && !explicitPressure) {
    next.stress = Math.min(next.stress ?? 0, 4);
    next.focus = Math.max(next.focus ?? 0, 7);
    next.controllo = Math.max(next.controllo ?? 0, 6);
    if (typeof next.frustrazione === "number") {
      next.frustrazione = Math.min(next.frustrazione, 6);
    }
    next.notes = [
      `modalita=${mode}`,
      next.notes ||
        "sessione tecnica intensa: focus/problem solving, non stress emotivo",
    ].join("; ");
  } else {
    next.notes = [`modalita=${mode}`, next.notes || ""].filter(Boolean).join("; ");
  }

  return next;
}

function blendMetric({
  baseValue,
  patchValue,
  maxStep = 2,
  weight = 0.45,
}: {
  baseValue: number;
  patchValue?: number;
  maxStep?: number;
  weight?: number;
}) {
  if (typeof patchValue !== "number") return clamp(baseValue || 0);

  const base = clamp(baseValue || 0);
  const target = clamp(patchValue);
  if (maxStep >= 10 && base === 0) return target;

  const blended = base + (target - base) * weight;
  const delta = Math.max(-maxStep, Math.min(maxStep, blended - base));

  return clamp(base + delta);
}

export async function updateMentalState({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) {
  if (!userId || !message?.trim()) return null;

  const { data: currentState } = await supabaseAdmin
    .from("mental_states")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 350,
    messages: [
      {
        role: "system",
        content: `
Sei il motore interno di stato mentale di GhostMe.

Leggi il messaggio dell'utente e valuta se modifica lo stato mentale recente.

Campi da aggiornare da 0 a 10:
- stress
- entusiasmo
- stanchezza
- controllo
- nostalgia
- frustrazione
- focus
- socialita

Regole:
- Non cambiare tutto.
- Cambia solo ciò che emerge dal messaggio.
- Valori bassi = poco presente.
- Valori alti = molto presente.
- Se il messaggio è neutro, restituisci solo {}.
- Non fare diagnosi.
- Non usare parole mediche.
- Devi leggere il tono pratico, non psicologizzare.
- Interpreta "stress" come carico operativo/cognitivo interno, non come diagnosi emotiva.
- Una sessione lunga di sviluppo, debug o pianificazione tecnica indica prima focus, controllo e problem solving.
- Non alzare stress solo per parole come codice, bug, build, test, prompt, repo o patch.
- Alza stress solo se l'utente esprime pressione esplicita, impossibilita a reggere, ansia, panico, scadenze o sovraccarico dichiarato.
- La frustrazione tecnica temporanea e diversa dallo stress: se emerge un problema tecnico, preferisci frustrazione moderata e focus alto.

Esempi:
"sono stanco morto" -> stanchezza alta
"sono gasato per il progetto" -> entusiasmo e focus alti
"devo sistemare tutto, non mi torna niente" -> controllo alto, focus alto, frustrazione moderata
"la build non passa, analizza il repo e sistema il bug" -> modalita tecnica: focus alto, controllo alto, stress basso
"mi manca quel periodo" -> nostalgia alta
"mi sono rotto le palle" -> frustrazione alta
"oggi ho visto amici" -> socialita media

Rispondi SOLO con JSON valido:
{
  "stress": 0,
  "entusiasmo": 0,
  "stanchezza": 0,
  "controllo": 0,
  "nostalgia": 0,
  "frustrazione": 0,
  "focus": 0,
  "socialita": 0,
  "notes": "breve nota"
}

Se non c'è nulla da aggiornare:
{}
        `,
      },
      {
        role: "user",
        content: `
STATO ATTUALE:
${JSON.stringify(currentState || {}, null, 2)}

MESSAGGIO:
${message}
        `,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  let patch: MentalStatePatch = {};

  try {
    patch = JSON.parse(raw);
  } catch (err) {
    console.log("MENTAL STATE PARSE ERROR:", err);
    console.log("MENTAL STATE RAW:", raw);
    return null;
  }

  const hasValues = Object.keys(patch).some(
    (key) => key !== "notes" && typeof (patch as any)[key] === "number"
  );

  if (!hasValues) {
    console.log("MENTAL STATE: no update");
    return null;
  }

  patch = normalizePatchForOperationalContext(patch, message);

  const base = currentState || {
    stress: 0,
    entusiasmo: 0,
    stanchezza: 0,
    controllo: 0,
    nostalgia: 0,
    frustrazione: 0,
    focus: 0,
    socialita: 0,
  };
  const maxStep = currentState?.id ? 2 : 10;

  const nextState = {
    stress: blendMetric({
      baseValue: base.stress || 0,
      patchValue: patch.stress,
      maxStep,
    }),
    entusiasmo: blendMetric({
      baseValue: base.entusiasmo || 0,
      patchValue: patch.entusiasmo,
      maxStep,
    }),
    stanchezza: blendMetric({
      baseValue: base.stanchezza || 0,
      patchValue: patch.stanchezza,
      maxStep,
    }),
    controllo: blendMetric({
      baseValue: base.controllo || 0,
      patchValue: patch.controllo,
      maxStep,
    }),
    nostalgia: blendMetric({
      baseValue: base.nostalgia || 0,
      patchValue: patch.nostalgia,
      maxStep,
    }),
    frustrazione: blendMetric({
      baseValue: base.frustrazione || 0,
      patchValue: patch.frustrazione,
      maxStep,
    }),
    focus: blendMetric({
      baseValue: base.focus || 0,
      patchValue: patch.focus,
      maxStep,
    }),
    socialita: blendMetric({
      baseValue: base.socialita || 0,
      patchValue: patch.socialita,
      maxStep,
    }),
    last_trigger: message,
    notes: patch.notes || base.notes || "",
    updated_at: new Date().toISOString(),
  };

  if (currentState?.id) {
    const { data, error } = await supabaseAdmin
      .from("mental_states")
      .update(nextState)
      .eq("id", currentState.id)
      .select();

    console.log("MENTAL STATE UPDATE:", data);
    console.log("MENTAL STATE UPDATE ERROR:", error);

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("mental_states")
    .insert([
      {
        user_id: userId,
        ...nextState,
      },
    ])
    .select();

  console.log("MENTAL STATE INSERT:", data);
  console.log("MENTAL STATE INSERT ERROR:", error);

  return data;
}
