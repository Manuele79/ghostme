import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ROOMS = [
  "salotto",
  "scale",
  "cucina",
  "camera",
  "armadio",
  "bagno",
  "fuori_casa",
];

const ROOM_LABELS: Record<string, string> = {
  salotto: "salotto",
  scale: "scale",
  cucina: "cucina",
  camera: "camera",
  armadio: "armadio",
  bagno: "bagno",
  fuori_casa: "fuori casa",
};

function getRomeHour(value: string) {
  return Number(
    new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      hour12: false,
    }).format(new Date(value))
  );
}

function getTimeWindow(value: string) {
  const hour = getRomeHour(value);

  if (hour >= 5 && hour < 11) return "mattina";
  if (hour >= 11 && hour < 14) return "pranzo";
  if (hour >= 14 && hour < 18) return "pomeriggio";
  if (hour >= 18 && hour < 23) return "sera";
  return "notte";
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function numberValue(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

export async function analyzeHousePatterns(userId: string) {
  if (!userId) return [];

  const since = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: events, error } = await supabaseAdmin
    .from("house_events")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: true });

  if (error) {
    console.log("ANALYZE HOUSE PATTERNS ERROR:", error);
    return [];
  }

  if (!events?.length) return [];

  const patterns: string[] = [];

  // 1. Uso stanze: motion/presence per tutte le stanze
  for (const room of ROOMS.filter((r) => r !== "fuori_casa")) {
    const roomEvents = events.filter(
      (e) =>
        e.room_key === room &&
        ["presence_on", "motion_on"].includes(e.event_type)
    );

    if (roomEvents.length >= 5) {
      addUnique(
        patterns,
        `${ROOM_LABELS[room]} usato spesso (${roomEvents.length} rilevamenti negli ultimi 30 giorni)`
      );
    }

    const byWindow = new Map<string, number>();

    for (const event of roomEvents) {
      const window = getTimeWindow(event.occurred_at);
      byWindow.set(window, (byWindow.get(window) || 0) + 1);
    }

    for (const [window, count] of byWindow.entries()) {
      if (count >= 3) {
        addUnique(
          patterns,
          `${ROOM_LABELS[room]} ricorre spesso di ${window} (${count} rilevamenti)`
        );
      }
    }
  }

  // 2. TV / media per cucina e camera
  const tvEvents = events.filter((e) => e.event_type === "tv_on");

  for (const room of ["cucina", "camera"]) {
    const roomTv = tvEvents.filter((e) => e.room_key === room);

    if (roomTv.length >= 3) {
      addUnique(
        patterns,
        `TV ${ROOM_LABELS[room]} usata spesso (${roomTv.length} accensioni)`
      );
    }

    const eveningTv = roomTv.filter((e) =>
      ["sera", "notte"].includes(getTimeWindow(e.occurred_at))
    );

    if (eveningTv.length >= 3) {
      addUnique(
        patterns,
        `TV ${ROOM_LABELS[room]} usata spesso tra sera e notte`
      );
    }
  }

  // 3. Luci per stanza
  for (const room of ROOMS.filter((r) => r !== "fuori_casa")) {
    const lightOns = events.filter(
      (e) => e.room_key === room && e.event_type === "light_on"
    );

    if (lightOns.length >= 5) {
      addUnique(
        patterns,
        `Luci ${ROOM_LABELS[room]} accese spesso (${lightOns.length} accensioni)`
      );
    }

    const nightLights = lightOns.filter((e) =>
      ["sera", "notte"].includes(getTimeWindow(e.occurred_at))
    );

    if (nightLights.length >= 3) {
      addUnique(
        patterns,
        `Luci ${ROOM_LABELS[room]} usate spesso tra sera e notte`
      );
    }
  }

  // 4. Lux / luminosità per salotto, cucina, bagno
  for (const room of ["salotto", "cucina", "bagno"]) {
    const luxEvents = events.filter(
      (e) => e.room_key === room && e.event_type === "lux_changed"
    );

    const luxValues = luxEvents
      .map((e) => numberValue(e.new_state))
      .filter((v): v is number => v !== null);

    const avgLux = average(luxValues);

    if (avgLux !== null) {
      addUnique(
        patterns,
        `Luminosità media ${ROOM_LABELS[room]}: circa ${avgLux} lx`
      );
    }

    const lowLux = luxValues.filter((v) => v <= 80).length;

    if (lowLux >= 5) {
      addUnique(
        patterns,
        `${ROOM_LABELS[room]} spesso poco luminoso (${lowLux} rilevamenti sotto 80 lx)`
      );
    }
  }

  // 5. Clima / temperatura / ambiente
  const climateEvents = events.filter(
    (e) =>
      e.entity_type === "climate" ||
      e.entity_type === "temperature" ||
      e.event_type === "temperature_changed" ||
      e.event_type === "climate_on" ||
      e.event_type === "climate_off"
  );

  if (climateEvents.length >= 3) {
    addUnique(
      patterns,
      `Clima/temperatura rilevati spesso (${climateEvents.length} eventi)`
    );
  }

  const hotEvents = climateEvents.filter((e) => {
    const n = numberValue(e.new_state);
    return n !== null && n >= 27;
  });

  if (hotEvents.length >= 3) {
    addUnique(
      patterns,
      `Temperatura spesso alta in casa (${hotEvents.length} rilevamenti sopra 27°C)`
    );
  }

  // 6. Due persone in casa
  const twoPeopleEvents = events.filter((e) => (e.people_home_count || 0) >= 2);

  if (twoPeopleEvents.length >= 10) {
    addUnique(
      patterns,
      `Casa spesso occupata da due persone (${twoPeopleEvents.length} eventi)`
    );
  }

  // 7. Una persona sola
  const onePersonEvents = events.filter((e) => (e.people_home_count || 0) === 1);

  if (onePersonEvents.length >= 10) {
    addUnique(
      patterns,
      `Casa spesso occupata da una sola persona (${onePersonEvents.length} eventi)`
    );
  }

  // 8. Transiti tra stanze, ignorando ripetizioni identiche e rumore
  const movementEvents = events.filter(
    (e) =>
      e.room_key &&
      ["presence_on", "motion_on"].includes(e.event_type)
  );

  const transitions = new Map<string, number>();

  for (let i = 0; i < movementEvents.length - 1; i++) {
    const current = movementEvents[i];
    const next = movementEvents[i + 1];

    if (!current.room_key || !next.room_key) continue;
    if (current.room_key === next.room_key) continue;

    const diffMs =
      new Date(next.occurred_at).getTime() -
      new Date(current.occurred_at).getTime();

    // Transito plausibile entro 90 secondi
    if (diffMs < 0 || diffMs > 90 * 1000) continue;

    const key = `${current.room_key} → ${next.room_key}`;
    transitions.set(key, (transitions.get(key) || 0) + 1);
  }

  for (const [transition, count] of transitions.entries()) {
    if (count >= 2) {
      addUnique(
        patterns,
        `Transito frequente: ${transition} (${count} volte)`
      );
    }
  }

  // 9. Stanze multiple accese con due persone
  const lightEventsWithTwoPeople = events.filter(
    (e) =>
      e.event_type === "light_on" &&
      (e.people_home_count || 0) >= 2
  );

  if (lightEventsWithTwoPeople.length >= 5) {
    addUnique(
      patterns,
      `Quando siete in due, risultano spesso più luci o zone attive`
    );
  }

  return patterns;
}