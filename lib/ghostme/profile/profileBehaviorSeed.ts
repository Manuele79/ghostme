import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Traits = Record<string, any>;

function traitValue(traits: Traits, key: string) {
  return Number(traits?.[key] || 0);
}

async function upsertInitialBehaviorRule({
  userId,
  ruleText,
  ruleType = "profile_seed",
  targetArea = "general",
  priority = 6,
}: {
  userId: string;
  ruleText: string;
  ruleType?: string;
  targetArea?: string;
  priority?: number;
}) {
  const { data: existing } = await supabaseAdmin
    .from("ghost_behavior_rules")
    .select("id")
    .eq("user_id", userId)
    .eq("rule_type", ruleType)
    .ilike("rule_text", `%${ruleText.slice(0, 60)}%`)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return;

  await supabaseAdmin.from("ghost_behavior_rules").insert({
    user_id: userId,
    rule_text: ruleText,
    rule_type: ruleType,
    target_area: targetArea,
    status: "active",
    confidence: 7,
    priority,
    source_message: "Regola generata dal profilo iniziale",
  });
}

async function upsertDynamicProfileSeed({
  userId,
  trait,
  description,
  confidence = 65,
}: {
  userId: string;
  trait: string;
  description: string;
  confidence?: number;
}) {
  const { data: existing } = await supabaseAdmin
    .from("dynamic_self_profile")
    .select("id, confidence")
    .eq("user_id", userId)
    .ilike("trait", trait)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabaseAdmin
      .from("dynamic_self_profile")
      .update({
        description,
        confidence: Math.max(existing.confidence || 50, confidence),
        source: "initial_profile",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return;
  }

  await supabaseAdmin.from("dynamic_self_profile").insert({
    user_id: userId,
    trait,
    description,
    confidence,
    source: "initial_profile",
    last_evidence: "Profilo iniziale / questionario setup",
  });
}

export async function seedBehaviorFromProfile(userId: string) {
  if (!userId) return;

  const [{ data: profile }, { data: traits }] = await Promise.all([
    supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseAdmin
      .from("traits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!traits) return;

  const rules: {
    ruleText: string;
    targetArea: string;
    priority?: number;
  }[] = [];

  const profileSeeds: {
    trait: string;
    description: string;
    confidence?: number;
  }[] = [];

  if (traitValue(traits, "controllo") >= 7) {
    rules.push({
      ruleText:
        "Quando dai istruzioni tecniche o operative, procedi per blocchi chiari e controllabili.",
      targetArea: "code",
      priority: 8,
    });

    profileSeeds.push({
      trait: "bisogno di controllo operativo",
      description:
        "L'utente preferisce capire cosa sta succedendo e procedere con passaggi chiari, soprattutto su codice, setup e sistemi.",
      confidence: 75,
    });
  }

  if (traitValue(traits, "sincerita") >= 7) {
    rules.push({
      ruleText:
        "Usa un tono diretto e concreto. Evita rassicurazioni finte o frasi addolcite inutilmente.",
      targetArea: "chat",
      priority: 8,
    });
  }

  if (traitValue(traits, "ansia") >= 7 || traitValue(traits, "stress") >= 7) {
    rules.push({
      ruleText:
        "Quando il tema è complesso, evita troppe opzioni insieme e proponi un prossimo passo chiaro.",
      targetArea: "general",
      priority: 7,
    });

    profileSeeds.push({
      trait: "preferenza per ordine e riduzione del caos",
      description:
        "Quando ci sono molti pezzi aperti, l'utente beneficia di priorità chiare e passaggi ordinati.",
      confidence: 70,
    });
  }

  if (traitValue(traits, "sarcasmo") >= 6) {
    rules.push({
      ruleText:
        "Puoi usare ironia leggera, ma senza perdere praticità o chiarezza.",
      targetArea: "chat",
      priority: 5,
    });
  }

  if (traitValue(traits, "sensibilita_critiche") >= 7) {
    rules.push({
      ruleText:
        "Quando segnali errori, sii diretto ma spiega subito cosa correggere concretamente.",
      targetArea: "chat",
      priority: 7,
    });
  }

  if (traitValue(traits, "impulsivita") >= 7) {
    rules.push({
      ruleText:
        "Evita di proporre troppe modifiche contemporaneamente; privilegia una sequenza ordinata.",
      targetArea: "workflow",
      priority: 7,
    });
  }

  if (profile?.communication_style) {
    profileSeeds.push({
      trait: "stile comunicativo dichiarato",
      description: profile.communication_style,
      confidence: 75,
    });
  }

  if (profile?.short_bio) {
    profileSeeds.push({
      trait: "profilo personale iniziale",
      description: profile.short_bio,
      confidence: 65,
    });
  }

  for (const rule of rules) {
    await upsertInitialBehaviorRule({
      userId,
      ruleText: rule.ruleText,
      targetArea: rule.targetArea,
      priority: rule.priority || 6,
    });
  }

  for (const seed of profileSeeds) {
    await upsertDynamicProfileSeed({
      userId,
      trait: seed.trait,
      description: seed.description,
      confidence: seed.confidence || 65,
    });
  }
}