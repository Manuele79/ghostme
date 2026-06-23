import { after, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEntityInfo } from "@/lib/ghostme/homeAssistant/homeEntityMapper";
import { classifyHomeEventSignificance } from "@/lib/ghostme/homeAssistant/homeEventSignificance";
import { logSignificantHomeEvent } from "@/lib/ghostme/homeAssistant/homeEventLogger";
import { isDevelopmentEnvironment } from "@/lib/ghostme/auth/serverAuth";
import { runHouseLightLearning } from "@/lib/ghostme/homeAssistant/houseLightLearningFlow";
import {
  canAccessHomeAssistant,
  getDefaultHomeAssistantUserId,
} from "@/lib/ghostme/homeAssistant/homeAssistantAccess";

function clean(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function friendlyName(body: unknown) {
  const row = objectValue(body);
  const attributes = objectValue(row.attributes);
  return String(
    attributes.friendly_name || row.entity_name || row.entity_id || ""
  );
}

function getStateValue(value: unknown) {
  if (value && typeof value === "object" && "state" in value) {
    return String(value.state ?? "");
  }

  return String(value ?? "");
}

function getAttributes(body: unknown) {
  const row = objectValue(body);
  if (row.attributes && typeof row.attributes === "object") {
    return objectValue(row.attributes);
  }

  const newState = objectValue(row.new_state);
  if (newState.attributes && typeof newState.attributes === "object") {
    return objectValue(newState.attributes);
  }

  return {};
}

function getEventType(entityType: string, state: string, incomingEventType?: string | null) {
  const cleanState = clean(state);
  const cleanIncoming = clean(incomingEventType);

  if (cleanIncoming === "automation_triggered") return "automation_on";

  if (entityType === "motion") return cleanState === "on" ? "motion_on" : "motion_off";
  if (entityType === "presence") return cleanState === "on" ? "presence_on" : "presence_off";
  if (entityType === "temperature") return "temperature_changed";
  if (entityType === "humidity") return "humidity_changed";
  if (entityType === "lux") return "lux_changed";
  if (entityType === "pressure") return "pressure_changed";
  if (entityType === "co2") return "co2_changed";
  if (entityType === "noise") return "noise_changed";
  if (entityType === "light") return cleanState === "on" ? "light_on" : "light_off";
  if (entityType === "switch") return cleanState === "on" ? "switch_on" : "switch_off";

  if (entityType === "tv") {
    return ["on", "playing", "paused", "idle"].includes(cleanState)
      ? "tv_on"
      : "tv_off";
  }

  if (entityType === "phone") {
    return cleanState === "home" || cleanState.includes("windtre")
      ? "phone_home"
      : "phone_not_home";
  }

  if (entityType === "person") return "person_location_changed";
  if (entityType === "weather") return "weather_changed";
  if (entityType === "sun") return "sun_changed";

  if (entityType === "climate") {
    return ["heat", "cool", "auto", "dry", "fan_only", "on"].includes(cleanState)
      ? "climate_on"
      : "climate_off";
  }

  if (entityType === "fan") return cleanState === "on" ? "fan_on" : "fan_off";
  if (entityType === "appliance") return "appliance_changed";
  if (entityType === "automation") return cleanState === "on" ? "automation_on" : "automation_off";
  if (entityType === "contact") return ["on", "open"].includes(cleanState) ? "contact_open" : "contact_closed";

  return "state_changed";
}

function needsCooldownContext(entityType: string, eventType: string) {
  return (
    ["temperature", "humidity", "lux", "motion", "presence"].includes(entityType) ||
    (entityType === "automation" && eventType === "automation_on")
  );
}

function logSkippedEvent(entityId: string, reason: string) {
  console.log("HOUSE EVENT SKIPPED:", {
    entityId,
    reason,
  });
}

function unmappedReason(entityId: string) {
  return /battery|batteria|linkquality|link_quality|rssi|signal_strength/i.test(
    entityId
  )
    ? "noisy_sensor_ignored"
    : "unmapped_entity";
}

async function getLastHouseEvent({
  userId,
  entityId,
}: {
  userId: string;
  entityId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("house_events")
    .select("id, new_state, event_type, occurred_at")
    .eq("user_id", userId)
    .eq("entity_id", entityId)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("HA WEBHOOK LAST EVENT ERROR:", error);
  }

  return data || null;
}

async function getLastCooldownEvents({
  userId,
  entityId,
  eventType,
  roomKey,
}: {
  userId: string;
  entityId: string;
  eventType: string;
  roomKey?: string | null;
}) {
  const eventTypeQuery = supabaseAdmin
    .from("house_events")
    .select("entity_id, room_key, occurred_at")
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const roomQuery = roomKey
    ? supabaseAdmin
        .from("house_events")
        .select("occurred_at")
        .eq("user_id", userId)
        .eq("room_key", roomKey)
        .eq("event_type", eventType)
        .order("occurred_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });
  const [eventTypeResult, roomResult] = await Promise.all([eventTypeQuery, roomQuery]);
  const lastTypeMatchesCurrentContext =
    eventTypeResult.data?.entity_id === entityId ||
    Boolean(roomKey && eventTypeResult.data?.room_key === roomKey);
  return {
    lastEventTypeOccurredAt: lastTypeMatchesCurrentContext
      ? eventTypeResult.data?.occurred_at || null
      : null,
    lastRoomEventOccurredAt: roomResult.data?.occurred_at || null,
  };
}

async function updateHouseEntity({
  userId,
  entityId,
  entityName,
}: {
  userId: string;
  entityId: string;
  entityName: string;
}) {
  const info = getEntityInfo(entityId);

  if (info.type === "other") return false;

  const { error } = await supabaseAdmin
    .from("house_entities")
    .upsert(
      {
        user_id: userId,
        entity_id: entityId,
        entity_name: entityName,
        room_key: info.room || null,
        entity_type: info.type,
        is_useful: true,
        can_trigger_event: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,entity_id" }
    );

  if (error) {
    console.log("HA WEBHOOK ENTITY UPSERT ERROR:", error);
    return false;
  }

  return true;
}

function isAuthorized(req: Request, body: unknown) {
  const secret =
    process.env.HOME_ASSISTANT_WEBHOOK_SECRET || process.env.WORKER_SECRET;

  if (!secret) return isDevelopmentEnvironment();

  const url = new URL(req.url);
  const headerToken =
    req.headers.get("x-ghostme-ha-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token =
    headerToken || url.searchParams.get("token") || objectValue(body).token;

  return token === secret;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!isAuthorized(req, body)) {
      return NextResponse.json(
        {
          received: false,
          significant: false,
          reason: "unauthorized",
          inserted: false,
        },
        { status: 401 }
      );
    }

    const requestedUserId = body.userId || body.user_id || null;
    const mappedUserId = requestedUserId || getDefaultHomeAssistantUserId();
    const entityId = body.entity_id || body.entityId;

    if (!mappedUserId) {
      return NextResponse.json(
        { received: false, significant: false, reason: "user_mapping_not_configured", inserted: false },
        { status: 503 }
      );
    }

    if (!mappedUserId || !canAccessHomeAssistant(mappedUserId)) {
      return NextResponse.json(
        { received: false, significant: false, reason: "user_mapping_not_allowed", inserted: false },
        { status: 403 }
      );
    }

    if (!entityId) {
      return NextResponse.json(
        {
          received: false,
          significant: false,
          reason: "missing_entity",
          inserted: false,
        },
        { status: 400 }
      );
    }

    const info = getEntityInfo(entityId);
    if (info.type === "other") {
      const reason = unmappedReason(entityId);
      logSkippedEvent(entityId, reason);
      return NextResponse.json(
        { received: true, significant: false, reason, inserted: false }
      );
    }
    const userId = mappedUserId;
    const oldState = getStateValue(body.old_state ?? body.oldState);
    const incomingEventType = clean(body.event_type || body.eventType);
    const rawNewState = getStateValue(body.new_state ?? body.newState ?? body.state);
    const newState =
      rawNewState || (incomingEventType === "automation_triggered" ? "triggered" : "");
    const entityName = friendlyName({ ...body, entity_id: entityId });
    const eventType = getEventType(info.type, newState, body.event_type || body.eventType);
    const attributes = getAttributes(body);
    const occurredAt =
      body.timestamp ||
      body.time_fired ||
      body.new_state?.last_updated ||
      body.new_state?.last_changed ||
      new Date().toISOString();

    const hasProvidedOldState =
      body.old_state !== undefined || body.oldState !== undefined;
    if (hasProvidedOldState) {
      const preliminaryDecision = classifyHomeEventSignificance({
        entityType: info.type,
        entityId,
        oldState,
        newState,
        eventType,
      });
      if (!preliminaryDecision.significant) {
        logSkippedEvent(entityId, preliminaryDecision.reason);
        return NextResponse.json({
          received: true,
          significant: false,
          reason: preliminaryDecision.reason,
          inserted: false,
        });
      }
    }

    const last = await getLastHouseEvent({ userId, entityId });
    const baseDecision = classifyHomeEventSignificance({
      entityType: info.type,
      entityId,
      oldState: oldState || last?.new_state || null,
      newState,
      eventType,
      lastOccurredAt: last?.occurred_at || null,
    });

    if (!baseDecision.significant) {
      logSkippedEvent(entityId, baseDecision.reason);
      return NextResponse.json({
        received: true,
        significant: false,
        reason: baseDecision.reason,
        inserted: false,
      });
    }

    const cooldownContext = needsCooldownContext(info.type, eventType)
      ? await getLastCooldownEvents({
          userId,
          entityId,
          eventType,
          roomKey: info.room || null,
        })
      : {
          lastEventTypeOccurredAt: null,
          lastRoomEventOccurredAt: null,
        };
    const decision = classifyHomeEventSignificance({
      entityType: info.type,
      entityId,
      oldState: oldState || last?.new_state || null,
      newState,
      eventType,
      lastOccurredAt: last?.occurred_at || null,
      ...cooldownContext,
    });

    if (!decision.significant) {
      logSkippedEvent(entityId, decision.reason);
      return NextResponse.json({
        received: true,
        significant: false,
        reason: decision.reason,
        inserted: false,
      });
    }

    await updateHouseEntity({
      userId,
      entityId,
      entityName,
    });

    const loggedEvent = await logSignificantHomeEvent({
      userId,
      entityId,
      entityName,
      entityType: info.type,
      roomKey: info.room || null,
      eventType,
      oldState,
      newState,
      attributes,
      lastChanged: body.new_state?.last_changed || null,
      lastUpdated: body.new_state?.last_updated || null,
      person: info.person || null,
      occurredAt,
      decision,
      previousEvent: last,
      webhookEventType: body.event_type || body.eventType || null,
    });

    if (!loggedEvent.inserted) {
      if (loggedEvent.reason === "duplicate_recent") {
        logSkippedEvent(entityId, loggedEvent.reason);
        return NextResponse.json({
          received: true,
          significant: false,
          reason: loggedEvent.reason,
          inserted: false,
        });
      }
      return NextResponse.json(
        {
          received: true,
          significant: true,
          reason: "insert_failed",
          inserted: false,
        },
        { status: 500 }
      );
    }

    after(async () => {
      await runHouseLightLearning({
        userId,
        eventId: loggedEvent.id!,
        eventType,
        priority: decision.priority,
        occurredAt,
      });
    });

    console.log("HOUSE EVENT ACCEPTED:", {
      entityId,
      eventType,
      category: decision.category,
      reason: decision.reason,
    });

    return NextResponse.json({
      received: true,
      significant: true,
      reason: decision.reason,
      inserted: true,
    });
  } catch (err) {
    console.log("HA WEBHOOK EVENT ERROR:", err);
    return NextResponse.json(
      {
        received: false,
        significant: false,
        reason: "invalid_request",
        inserted: false,
      },
      { status: 500 }
    );
  }
}
