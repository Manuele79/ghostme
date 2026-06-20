import { after, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getEntityInfo } from "@/lib/ghostme/homeAssistant/homeEntityMapper";
import { classifyHomeEventSignificance } from "@/lib/ghostme/homeAssistant/homeEventSignificance";
import { isDevelopmentEnvironment } from "@/lib/ghostme/auth/serverAuth";
import { runHouseLightLearning } from "@/lib/ghostme/homeAssistant/houseLightLearningFlow";

function clean(value: any) {
  return String(value ?? "").toLowerCase().trim();
}

function friendlyName(body: any) {
  return body.attributes?.friendly_name || body.entity_name || body.entity_id;
}

function getStateValue(value: any) {
  if (value && typeof value === "object" && "state" in value) {
    return String(value.state ?? "");
  }

  return String(value ?? "");
}

function getAttributes(body: any) {
  if (body.attributes && typeof body.attributes === "object") {
    return body.attributes;
  }

  if (body.new_state?.attributes && typeof body.new_state.attributes === "object") {
    return body.new_state.attributes;
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

  return "state_changed";
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

function isAuthorized(req: Request, body: any) {
  const secret =
    process.env.HOME_ASSISTANT_WEBHOOK_SECRET || process.env.WORKER_SECRET;

  if (!secret) return isDevelopmentEnvironment();

  const url = new URL(req.url);
  const headerToken =
    req.headers.get("x-ghostme-ha-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = headerToken || url.searchParams.get("token") || body.token;

  return token === secret;
}

function allowedHomeAssistantUserId() {
  const configured =
    process.env.GHOSTME_HOME_ASSISTANT_USER_ID ||
    process.env.HOME_ASSISTANT_USER_ID;

  if (configured) return configured;
  if (isDevelopmentEnvironment()) return process.env.GHOSTME_TEST_USER_ID || null;
  return null;
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

    const mappedUserId = allowedHomeAssistantUserId();
    const requestedUserId = body.userId || body.user_id || null;
    const entityId = body.entity_id || body.entityId;

    if (!mappedUserId) {
      return NextResponse.json(
        { received: false, significant: false, reason: "user_mapping_not_configured", inserted: false },
        { status: 503 }
      );
    }

    if (requestedUserId && requestedUserId !== mappedUserId) {
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
      return NextResponse.json(
        { received: false, significant: false, reason: "unmapped_entity", inserted: false },
        { status: 400 }
      );
    }
    const userId = mappedUserId;
    const oldState = getStateValue(body.old_state ?? body.oldState);
    const newState = getStateValue(body.new_state ?? body.newState ?? body.state);
    const entityName = friendlyName({ ...body, entity_id: entityId });
    const eventType = getEventType(info.type, newState, body.event_type || body.eventType);
    const attributes = getAttributes(body);
    const occurredAt =
      body.timestamp ||
      body.time_fired ||
      body.new_state?.last_updated ||
      body.new_state?.last_changed ||
      new Date().toISOString();

    await updateHouseEntity({
      userId,
      entityId,
      entityName,
    });

    const last = await getLastHouseEvent({ userId, entityId });
    const decision = classifyHomeEventSignificance({
      entityType: info.type,
      entityId,
      oldState: oldState || last?.new_state || null,
      newState,
      eventType,
      lastOccurredAt: last?.occurred_at || null,
    });

    if (!decision.significant) {
      return NextResponse.json({
        received: true,
        significant: false,
        reason: decision.reason,
        inserted: false,
      });
    }

    const { data: insertedEvent, error } = await supabaseAdmin
      .from("house_events")
      .insert({
      user_id: userId,
      entity_id: entityId,
      entity_name: entityName,
      entity_type: info.type,
      room_key: info.room || null,
      event_type: eventType,
      old_state: oldState || last?.new_state || null,
      new_state: newState,
      value: {
        attributes,
        last_changed: body.new_state?.last_changed || null,
        last_updated: body.new_state?.last_updated || null,
        person: info.person || null,
        save_reason: decision.reason,
        significance_category: decision.category,
        significance_priority: decision.priority,
        webhook_event_type: body.event_type || body.eventType || null,
      },
      people_home_count: null,
      target_user: info.person || null,
      source: "home_assistant_webhook",
        occurred_at: occurredAt,
      })
      .select("id")
      .single();

    if (error) {
      console.log("HA WEBHOOK EVENT INSERT ERROR:", error);
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
        eventId: insertedEvent.id,
        eventType,
        priority: decision.priority,
        occurredAt,
      });
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
