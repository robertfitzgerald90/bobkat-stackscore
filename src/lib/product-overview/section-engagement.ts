"use client";

const ENGAGEMENT_STORAGE_KEY = "stackscore-product-overview-section-engagement";

type EngagementMap = Record<string, number>;

function readEngagement(): EngagementMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(ENGAGEMENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as EngagementMap) : {};
  } catch {
    return {};
  }
}

function writeEngagement(map: EngagementMap) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ENGAGEMENT_STORAGE_KEY, JSON.stringify(map));
}

export function recordSectionEngagement(sectionId: string) {
  const map = readEngagement();
  map[sectionId] = (map[sectionId] ?? 0) + 1;
  writeEngagement(map);
}

export function getTopEngagedSection(): string | undefined {
  const map = readEngagement();
  let topId: string | undefined;
  let topCount = 0;
  for (const [id, count] of Object.entries(map)) {
    if (count > topCount) {
      topCount = count;
      topId = id;
    }
  }
  return topId;
}

export function getEngagementSummary(): EngagementMap {
  return readEngagement();
}

export function clearSectionEngagement() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ENGAGEMENT_STORAGE_KEY);
}

export function clearAllDemoSessionStorage() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ENGAGEMENT_STORAGE_KEY);
  sessionStorage.removeItem("stackscore-product-overview-tour");
  sessionStorage.removeItem("stackscore-product-overview-presentation");
}

