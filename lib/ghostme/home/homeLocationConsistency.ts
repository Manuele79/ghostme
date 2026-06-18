import type { HouseStateSnapshot } from "@/lib/ghostme/home/houseStateSnapshot";

export type HomeLocationConsistency = {
  isUserAtHomeByLocation: boolean;
  isUserAtHomeByHomeAssistant: boolean;
  occupancyStatus: HouseStateSnapshot["occupancyStatus"];
  mismatch: boolean;
  confidence: number;
  reason: string;
  checkedAt: string;
};

function clean(value: any) {
  return String(value || "").toLowerCase().trim();
}

function isHomeValue(value: any) {
  return ["home", "casa"].includes(clean(value));
}

function isManuele(person: HouseStateSnapshot["people"][number]) {
  const identity = [
    person.entityId,
    person.name,
    person.person,
  ]
    .map(clean)
    .join(" ");

  return (
    identity.includes("manuele") ||
    identity.includes("manu") ||
    identity.includes("person.manuele")
  );
}

function isAwayState(value: any) {
  return ["not_home", "away", "fuori"].includes(clean(value));
}

export function buildHomeLocationConsistency({
  currentPlace,
  currentCategory,
  houseState,
}: {
  currentPlace?: string | null;
  currentCategory?: string | null;
  houseState: HouseStateSnapshot;
}): HomeLocationConsistency {
  const isUserAtHomeByLocation =
    isHomeValue(currentPlace) || isHomeValue(currentCategory);
  const occupancyStatus = houseState.occupancyStatus;
  const manuele = houseState.people.find(isManuele) || null;
  const hasLocationSignal = Boolean(clean(currentPlace) || clean(currentCategory));
  const hasExplicitManueleSignal = Boolean(manuele);
  const isManueleAway = Boolean(manuele && !manuele.isHome && isAwayState(manuele.state));

  const isUserAtHomeByHomeAssistant = Boolean(manuele?.isHome);
  const homeAssistantSaysEmpty =
    occupancyStatus === "empty" || (hasExplicitManueleSignal && isManueleAway);

  let mismatch = false;
  let confidence = 40;
  let reason = "insufficient_signals";

  if (isUserAtHomeByLocation && homeAssistantSaysEmpty) {
    mismatch = true;
    confidence = hasExplicitManueleSignal ? 90 : 75;
    reason = hasExplicitManueleSignal
      ? "location_home_but_home_assistant_says_user_not_home"
      : "location_home_but_home_assistant_says_house_empty";
  } else if (
    hasLocationSignal &&
    !isUserAtHomeByLocation &&
    isUserAtHomeByHomeAssistant
  ) {
    mismatch = true;
    confidence = 90;
    reason = "home_assistant_says_user_home_but_location_not_home";
  } else if (isUserAtHomeByLocation && isUserAtHomeByHomeAssistant) {
    confidence = 85;
    reason = "location_and_home_assistant_agree_user_home";
  } else if (!isUserAtHomeByLocation && homeAssistantSaysEmpty) {
    confidence = hasLocationSignal ? 75 : 60;
    reason = "location_and_home_assistant_do_not_indicate_user_home";
  } else if (isUserAtHomeByLocation) {
    confidence = 55;
    reason = "location_says_home_without_confirming_home_assistant_user_signal";
  } else if (isUserAtHomeByHomeAssistant) {
    confidence = 65;
    reason = "home_assistant_says_user_home_without_matching_location_signal";
  }

  return {
    isUserAtHomeByLocation,
    isUserAtHomeByHomeAssistant,
    occupancyStatus,
    mismatch,
    confidence,
    reason,
    checkedAt: new Date().toISOString(),
  };
}
