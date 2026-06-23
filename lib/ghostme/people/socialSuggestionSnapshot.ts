import type { PeopleSnapshot } from "@/lib/ghostme/people/peopleSnapshot";
import type { RelationshipMemorySnapshot } from "@/lib/ghostme/people/relationshipMemorySnapshot";

export type SocialSuggestion =
  | "reconnect_with_person"
  | "review_open_loop"
  | "check_shared_event"
  | "enrich_relationship_context";

export type SocialRelationshipAttention = {
  person: string;
  signals: Array<
    | "person_with_open_loop"
    | "upcoming_shared_event"
    | "relationship_context_sparse"
    | "reconnect_candidate"
    | "recent_shared_memory"
    | "no_recent_mentions"
    | "frequent_recent_mentions"
    | "many_recent_connections"
  >;
  priority: number;
  reason: string;
  lastMentionedAt: string | null;
  recentMentions: number;
  linkedEvents: number;
  openLoopTitle: string | null;
  upcomingEventTitle: string | null;
};

export type SocialSuggestionSnapshot = {
  suggestions: SocialSuggestion[];
  relationshipAttention: SocialRelationshipAttention[];
  openLoops: any[];
  sparseRelationships: any[];
  confidence: number;
  lastUpdated: string | null;
};

function clean(value: any) {
  return String(value || "").trim().toLowerCase();
}

function normalize(value: any) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function personName(person: any) {
  return String(person?.name || person?.topic || "").trim();
}

function includesPerson(values: any[], name: string) {
  const key = normalize(name);
  if (!key) return false;

  return values.some((value) =>
    (value?.people || []).some((person: any) => normalize(person) === key)
  );
}

function hasUpcomingSharedEvent(values: any[], name: string) {
  const key = normalize(name);
  const now = Date.now();

  return values.some((value) => {
    const includes = (value?.people || []).some(
      (person: any) => normalize(person) === key
    );
    const startTime = new Date(value?.startAt || "").getTime();

    return includes && !Number.isNaN(startTime) && startTime >= now;
  });
}

function isUpcoming(value: any) {
  const startTime = new Date(value?.startAt || "").getTime();
  return !Number.isNaN(startTime) && startTime >= Date.now();
}

function titleFor(value: any) {
  return String(value?.title || value?.description || "").trim();
}

function isOlderThan(value: any, days: number) {
  if (!value) return false;
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) && time < Date.now() - days * 24 * 60 * 60 * 1000;
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function latestTimestamp(values: Array<string | null | undefined>) {
  let latest: string | null = null;
  let latestTime = 0;

  for (const value of values) {
    if (!value) continue;

    const time = new Date(value).getTime();
    if (Number.isNaN(time) || time <= latestTime) continue;

    latest = value;
    latestTime = time;
  }

  return latest;
}

export function buildSocialSuggestionSnapshot({
  people,
  relationshipMemory,
}: {
  people: PeopleSnapshot;
  relationshipMemory: RelationshipMemorySnapshot;
}): SocialSuggestionSnapshot {
  const relationships = relationshipMemory.relationships || [];
  const recentMentions = relationshipMemory.recentMentions || [];
  const sharedEvents = relationshipMemory.sharedEvents || [];
  const openLoops = relationshipMemory.openLoops || [];
  const relationshipAttention: SocialRelationshipAttention[] = [];
  const sparseRelationships: any[] = [];
  const suggestions: SocialSuggestion[] = [];

  for (const relationship of relationships) {
    const name = personName(relationship);
    if (!name) continue;

    const hasMention = includesPerson(recentMentions, name);
    const hasOpenLoop = includesPerson(openLoops, name);
    const hasSharedEvent = includesPerson(sharedEvents, name);
    const hasUpcomingEvent = hasUpcomingSharedEvent(sharedEvents, name);
    const activity = relationshipMemory.personActivity.find(
      (item) => normalize(item.person) === normalize(name)
    );
    const personOpenLoop = openLoops.find((item) =>
      (item.people || []).some((person: any) => normalize(person) === normalize(name))
    );
    const upcomingEvent = sharedEvents.find((item) => {
      const includes = (item.people || []).some(
        (person: any) => normalize(person) === normalize(name)
      );
      return includes && isUpcoming(item);
    });
    const neglected =
      Number(activity?.importance || relationship.importance || 0) >= 7 &&
      isOlderThan(activity?.lastMentionedAt, 30);
    const signals: SocialRelationshipAttention["signals"] = [];

    if (hasOpenLoop) signals.push("person_with_open_loop");
    if (hasUpcomingEvent) signals.push("upcoming_shared_event");
    if (hasMention) signals.push("recent_shared_memory");
    if (neglected) signals.push("no_recent_mentions", "reconnect_candidate");
    if (Number(activity?.recentMentions || 0) >= 3) {
      signals.push("frequent_recent_mentions");
    }
    if (Number(activity?.linkedEvents || 0) >= 3) {
      signals.push("many_recent_connections");
    }

    if (!hasMention && !hasOpenLoop && !hasSharedEvent) {
      signals.push("relationship_context_sparse");
      sparseRelationships.push(relationship);
    }

    const priority =
      (hasOpenLoop ? 4 : 0) +
      (hasUpcomingEvent ? 3 : 0) +
      (Number(activity?.recentMentions || 0) >= 3 ? 3 : hasMention ? 1 : 0) +
      (Number(activity?.linkedEvents || 0) >= 3 ? 3 : 0) +
      (neglected ? 3 : 0);

    if (signals.length) {
      const reason = hasOpenLoop
        ? `C'è ancora un punto aperto: ${titleFor(personOpenLoop)}.`
        : hasUpcomingEvent
          ? `${name} è collegato all'evento futuro ${titleFor(upcomingEvent)}.`
          : Number(activity?.recentMentions || 0) >= 3
            ? `Hai parlato di ${name} ${activity?.recentMentions} volte nelle ultime due settimane.`
            : Number(activity?.linkedEvents || 0) >= 3
              ? `${name} è collegato a ${activity?.linkedEvents} eventi vicini nel tempo.`
              : neglected
                ? `È da più di un mese che ${name} non emerge nei dati recenti.`
                : `Manca ancora contesto utile sul rapporto con ${name}.`;
      relationshipAttention.push({
        person: name,
        signals,
        priority,
        reason,
        lastMentionedAt: activity?.lastMentionedAt || null,
        recentMentions: Number(activity?.recentMentions || 0),
        linkedEvents: Number(activity?.linkedEvents || 0),
        openLoopTitle: titleFor(personOpenLoop) || null,
        upcomingEventTitle: titleFor(upcomingEvent) || null,
      });
    }
  }

  if (openLoops.length) suggestions.push("review_open_loop");
  if (sharedEvents.some(isUpcoming)) {
    suggestions.push("check_shared_event");
  }
  if (sparseRelationships.length) suggestions.push("enrich_relationship_context");
  if (relationshipAttention.some((item) => item.signals.includes("reconnect_candidate"))) {
    suggestions.push("reconnect_with_person");
  }

  return {
    suggestions: unique(suggestions),
    relationshipAttention: relationshipAttention
      .sort((left, right) => right.priority - left.priority)
      .slice(0, 8),
    openLoops: openLoops.slice(0, 8),
    sparseRelationships: sparseRelationships.slice(0, 8),
    confidence: Math.min(95, Math.max(0, relationshipMemory.confidence || 0)),
    lastUpdated: latestTimestamp([
      people.lastUpdated,
      relationshipMemory.lastUpdated,
      ...recentMentions.map((mention) => mention.at),
      ...sharedEvents.map((event) => event.startAt),
      ...openLoops.map((loop) => loop.updatedAt),
    ]),
  };
}
