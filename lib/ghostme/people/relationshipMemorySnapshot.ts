import type { PeopleSnapshot } from "@/lib/ghostme/people/peopleSnapshot";
import type { MemorySnapshot } from "@/lib/ghostme/memory/memorySnapshot";
import type { PeopleGraphLink } from "@/lib/ghostme/people/peopleGraphLinkService";

export type RelationshipMemorySnapshot = {
  relationships: any[];
  recentMentions: any[];
  sharedEvents: any[];
  relatedPlaces: any[];
  openLoops: any[];
  personActivity: Array<{
    person: string;
    importance: number;
    totalMentions: number;
    recentMentions: number;
    linkedEvents: number;
    openLoops: number;
    lastMentionedAt: string | null;
  }>;
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

function personNames(people: PeopleSnapshot) {
  return (people.items || [])
    .map((person) => ({
      name: person.name,
      key: normalize(person.name),
      relationshipType: person.relationship_type || null,
      importance: Number(person.importance || 0),
      mentionCount: Number(person.mention_count || 0),
      lastMentionedAt: person.last_mentioned_at || person.updated_at || null,
    }))
    .filter((person) => person.name && person.key);
}

function textFor(row: any) {
  return [
    row.title,
    row.content,
    row.summary,
    row.description,
    row.event_title,
    row.place_label,
    row.location,
    Array.isArray(row.topics) ? row.topics.join(" ") : row.topics,
    Array.isArray(row.related_topics) ? row.related_topics.join(" ") : row.related_topics,
  ].join(" ");
}

function mentionedPeople(row: any, people: ReturnType<typeof personNames>) {
  const text = normalize(textFor(row));
  return people
    .filter((person) => text.includes(person.key))
    .map((person) => person.name);
}

function compactMention(row: any, people: string[], source: string) {
  return {
    source,
    title: row.title || row.summary || row.description || row.content || null,
    people,
    at: row.updated_at || row.created_at || row.event_date || row.start_at || null,
  };
}

function uniqueBy(items: any[], keyFn: (item: any) => string) {
  const seen = new Set<string>();
  const result: any[] = [];

  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(item);
  }

  return result;
}

function isRecent(value: any, days = 14) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) && time >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function isRelevantEvent(value: any) {
  const time = new Date(value || 0).getTime();
  return (
    Number.isFinite(time) &&
    time >= Date.now() - 30 * 24 * 60 * 60 * 1000 &&
    time <= Date.now() + 90 * 24 * 60 * 60 * 1000
  );
}

function extractRelatedPlaces(rows: any[], people: ReturnType<typeof personNames>) {
  const placeTerms = ["casa", "lavoro", "bar", "ristorante", "ospedale", "scuola"];
  const related: any[] = [];

  for (const row of rows) {
    const text = clean(textFor(row));
    const names = mentionedPeople(row, people);
    if (!names.length) continue;

    for (const term of placeTerms) {
      if (!text.includes(term)) continue;

      related.push({
        place: term,
        people: names,
        source: row.title || row.summary || row.description || "memory",
      });
    }
  }

  return uniqueBy(related, (item) => `${item.place}|${item.people.join(",")}`).slice(0, 8);
}

function latestEvidence(link: PeopleGraphLink) {
  return [...(Array.isArray(link.evidences) ? link.evidences : [])].sort(
    (left, right) =>
      new Date(right?.observed_at || 0).getTime() -
      new Date(left?.observed_at || 0).getTime()
  )[0] || null;
}

export function buildRelationshipMemorySnapshot({
  people,
  memory,
  calendarEvents = [],
  actions = [],
}: {
  people: PeopleSnapshot;
  memory: MemorySnapshot;
  calendarEvents?: any[];
  actions?: any[];
}): RelationshipMemorySnapshot {
  const knownPeople = personNames(people);
  const relationships = (people.importantPeople?.length
    ? people.importantPeople
    : people.items || []
  ).slice(0, 8);

  const memoryRows = [
    ...(memory.activeMemories || []).map((row) => ({ ...row, source: "memory" })),
    ...(memory.episodicMemories || []).map((row) => ({ ...row, source: "episode" })),
    ...(memory.summaries || []).map((row) => ({ ...row, source: "summary" })),
    ...(memory.timeline || []).map((row) => ({ ...row, source: "timeline" })),
  ];

  const recentMentions = uniqueBy(
    memoryRows
      .map((row) => ({
        row,
        people: mentionedPeople(row, knownPeople),
      }))
      .filter((item) => item.people.length)
      .map((item) => compactMention(item.row, item.people, item.row.source)),
    (item) => `${item.source}|${item.title}|${item.people.join(",")}`
  )
    .filter((mention) => isRecent(mention.at))
    .slice(0, 10);

  const sharedEvents = uniqueBy(
    calendarEvents
      .map((event) => ({
        event,
        people: mentionedPeople(event, knownPeople),
      }))
      .filter((item) => item.people.length)
      .map((item) => ({
        id: item.event.id || null,
        title: item.event.title || item.event.description || null,
        people: item.people,
        startAt: item.event.start_at || item.event.remind_at || null,
        status: item.event.status || null,
      }))
      .filter((item) => isRelevantEvent(item.startAt)),
    (item) => `${item.title}|${item.startAt}|${item.people.join(",")}`
  ).slice(0, 8);

  const openLoops = uniqueBy(
    actions
      .map((action) => ({
        action,
        people: mentionedPeople(action, knownPeople),
      }))
      .filter((item) => item.people.length)
      .map((item) => ({
        id: item.action.id || null,
        title: item.action.title || item.action.description || null,
        people: item.people,
        priority: item.action.priority || null,
        updatedAt: item.action.updated_at || null,
      })),
    (item) => `${item.title}|${item.people.join(",")}`
  ).slice(0, 8);

  const relatedPlaces = extractRelatedPlaces(memoryRows, knownPeople);
  const peopleById = new Map<string, string>(
    (people.items || []).filter((person) => person.id).map((person) => [person.id, person.name])
  );
  const graphLinks = people.links || [];
  const personForLink = (link: PeopleGraphLink) =>
    peopleById.get(link.person_id) || null;
  const graphRecentMentions = graphLinks
    .filter((link) => ["memory", "episodic_memory"].includes(link.target_type))
    .map((link) => {
      const evidence = latestEvidence(link);
      return {
        source: link.target_type === "memory" ? "memory" : "episode",
        title: link.target_label || evidence?.note || null,
        people: [personForLink(link)].filter(Boolean),
        at: evidence?.observed_at || link.updated_at || null,
        linkId: link.id,
      };
    });
  const graphSharedEvents = graphLinks
    .filter((link) => link.target_type === "calendar_event")
    .map((link) => {
      const evidence = latestEvidence(link);
      return {
        id: link.target_id,
        title: link.target_label || evidence?.note || null,
        people: [personForLink(link)].filter(Boolean),
        startAt: evidence?.metadata?.start_at || evidence?.observed_at || null,
        status: evidence?.metadata?.status || null,
        linkId: link.id,
      };
    });
  const graphOpenLoops = graphLinks
    .filter((link) => ["action_intent", "goal"].includes(link.target_type))
    .map((link) => {
      const evidence = latestEvidence(link);
      return {
        id: link.target_id,
        title: link.target_label || evidence?.note || null,
        people: [personForLink(link)].filter(Boolean),
        priority: evidence?.metadata?.importance || null,
        updatedAt: evidence?.metadata?.updated_at || evidence?.observed_at || null,
        targetType: link.target_type,
        linkId: link.id,
      };
    });
  const graphPlaces = graphLinks
    .filter((link) => link.target_type === "place")
    .map((link) => ({
      place: link.target_label || link.target_key,
      people: [personForLink(link)].filter(Boolean),
      source: "people_graph_links",
      linkId: link.id,
    }));
  const effectiveRecentMentions = graphRecentMentions.length
    ? graphRecentMentions
    : recentMentions;
  const effectiveSharedEvents = graphSharedEvents.length
    ? graphSharedEvents
    : sharedEvents;
  const effectiveOpenLoops = graphOpenLoops.length ? graphOpenLoops : openLoops;
  const effectiveRelatedPlaces = graphPlaces.length ? graphPlaces : relatedPlaces;
  const personActivity = knownPeople
    .map((person) => {
      const mentions = effectiveRecentMentions.filter((mention) =>
        includesPersonName(mention.people, person.name)
      );
      const events = effectiveSharedEvents.filter((event) =>
        includesPersonName(event.people, person.name)
      );
      const loops = effectiveOpenLoops.filter((loop) =>
        includesPersonName(loop.people, person.name)
      );
      return {
        person: person.name,
        importance: person.importance,
        totalMentions: person.mentionCount,
        recentMentions: mentions.length,
        linkedEvents: events.length,
        openLoops: loops.length,
        lastMentionedAt: latestTimestamp([
          person.lastMentionedAt,
          ...mentions.map((mention) => mention.at),
          ...events.map((event) => event.startAt),
          ...loops.map((loop) => loop.updatedAt),
        ]),
      };
    })
    .sort(
      (left, right) =>
        right.recentMentions + right.linkedEvents + right.openLoops -
        (left.recentMentions + left.linkedEvents + left.openLoops)
    )
    .slice(0, 12);
  const confidence = Math.min(
    95,
    relationships.length * 15 +
      effectiveRecentMentions.length * 8 +
      effectiveSharedEvents.length * 10 +
      effectiveOpenLoops.length * 10
  );

  return {
    relationships,
    recentMentions: effectiveRecentMentions,
    sharedEvents: effectiveSharedEvents,
    relatedPlaces: effectiveRelatedPlaces,
    openLoops: effectiveOpenLoops,
    personActivity,
    confidence,
    lastUpdated: latestTimestamp([
      people.lastUpdated,
      memory.lastUpdated,
      ...calendarEvents.map((event) => event.updated_at || event.start_at || event.remind_at),
      ...actions.map((action) => action.updated_at),
    ]),
  };
}

function includesPersonName(values: any[], name: string) {
  const key = normalize(name);
  return (values || []).some((value) => normalize(value) === key);
}
