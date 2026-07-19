import type { DemoProfileBundle } from "@/lib/product-overview/demo-profiles/types";

export function getProfilePillarById(profile: DemoProfileBundle, id: string) {
  return profile.dashboard.pillars.find((pillar) => pillar.id === id);
}

export function getProfileProjectById(profile: DemoProfileBundle, id: string) {
  return profile.dashboard.projects.find((project) => project.id === id);
}

export function getProfileRecommendationById(profile: DemoProfileBundle, id: string) {
  return profile.recommendations.find((rec) => rec.id === id);
}

export function getProfileRoadmapInitiativeById(profile: DemoProfileBundle, id: string) {
  return profile.roadmapInitiatives.find((initiative) => initiative.id === id);
}

export function getProfileConnectionByPillarId(profile: DemoProfileBundle, pillarId: string) {
  return profile.connections.find((connection) => connection.pillarId === pillarId);
}

export function getProfileConnectionByRecommendationId(
  profile: DemoProfileBundle,
  recommendationId: string,
) {
  return profile.connections.find((connection) => connection.recommendationId === recommendationId);
}

export function getProfileReportPreviewById(profile: DemoProfileBundle, reportId: string) {
  return profile.reportPreviews[reportId];
}
