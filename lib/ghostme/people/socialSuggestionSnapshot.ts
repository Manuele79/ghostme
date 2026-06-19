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
  >;
  priority: number;
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
    const signals: SocialRelationshipAttention["signals"] = [];

    if (hasOpenLoop) signals.push("person_with_open_loop");
    if (hasUpcomingEvent) signals.push("upcoming_shared_event");
    if (hasMention) signals.push("recent_shared_memory");
    if (!hasMention) signals.push("no_recent_mentions");

    if (!hasMention && !hasOpenLoop && !hasSharedEvent) {
      signals.push("relationship_context_sparse", "reconnect_candidate");
      sparseRelationships.push(relationship);
    }

    const priority =
      (hasOpenLoop ? 4 : 0) +
      (hasUpcomingEvent ? 3 : 0) +
      (hasMention ? 1 : 0) +
      (!hasMention && !hasOpenLoop && !hasSharedEvent ? 2 : 0);

    if (signals.length) {
      relationshipAttention.push({ person: name, signals, priority });
    }
  }

  if (openLoops.length) suggestions.push("review_open_loop");
  if (sharedEvents.some(isUpcoming)) {
    suggestions.push("check_shared_event");
  }
  if (sparseRelationships.length) {
    suggestions.push("enrich_relationship_context", "reconnect_with_person");
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
