import type { ClientWorkspaceSection } from "@/lib/client-workspace/nav";

/**
 * Client Workspace Overview (DOC-201 / DEV-002 Phase 1).
 * Phase 1 Commit 1: Overview is served at the existing technology-profile route
 * so Portfolio and deep links keep working. Later commits may introduce `/overview`
 * and redirect the legacy path.
 */
export function clientWorkspacePath(clientId: string) {
  return `/clients/${clientId}/technology-profile`;
}

/**
 * Path for a DOC-201 workspace section.
 * Overview uses the workspace home route; other sections use `/clients/{id}/{section}`
 * (routes land in later Phase 1 commits).
 */
export function clientWorkspaceSectionPath(
  clientId: string,
  section: ClientWorkspaceSection,
) {
  if (section === "overview") {
    return clientWorkspacePath(clientId);
  }
  return `/clients/${clientId}/${section}`;
}

/**
 * Canonical client landing route.
 * Alias of Client Workspace Overview (historically Technology Profile per DOC-113).
 */
export function clientTechnologyProfilePath(clientId: string) {
  return clientWorkspacePath(clientId);
}

/**
 * Canonical customer assessment workspace route (Overview / SS-UX-002).
 */
export function customerAssessmentDashboardPath(clientId: string) {
  return clientTechnologyProfilePath(clientId);
}

/** Customer Explore — eight technology pillars entry (SS-UX-002 foundation). */
export function clientExplorePath(clientId: string) {
  return `/clients/${clientId}/explore`;
}

/**
 * Explore deep link for a canonical pillar (SS-UX-004).
 * Uses a stable query param until pillar drilldown routes ship.
 */
export function clientExplorePillarPath(clientId: string, pillarCode: string) {
  return `${clientExplorePath(clientId)}?pillar=${encodeURIComponent(pillarCode)}`;
}

/** Customer Overview landing (alias of technology-profile). */
export function customerOverviewPath(clientId: string) {
  return customerAssessmentDashboardPath(clientId);
}


/** Client workspace with Immediate Focus in view (DOC-160 / DOC-161). */
export function clientImmediateFocusPath(clientId: string) {
  return `${clientWorkspacePath(clientId)}#immediate-focus`;
}

export function clientWorkspaceAssessmentsPath(clientId: string) {
  return clientWorkspaceSectionPath(clientId, "assessments");
}

export function clientWorkspaceExecutiveReportsPath(clientId: string) {
  return clientWorkspaceSectionPath(clientId, "executive-reports");
}

export function clientWorkspaceRoadmapPath(clientId: string) {
  return clientWorkspaceSectionPath(clientId, "roadmap");
}

export function clientWorkspaceContactsPath(clientId: string) {
  return clientWorkspaceSectionPath(clientId, "contacts");
}

export function clientRecommendationsPath(clientId: string) {
  return clientWorkspaceSectionPath(clientId, "recommendations");
}

/**
 * Improvement opportunity deep link (SS-UX-006).
 * Optional pillar keeps Explore → Opportunities filters aligned.
 */
export function clientRecommendationDetailPath(
  clientId: string,
  recommendationId: string,
  options?: { pillarCode?: string },
) {
  const params = new URLSearchParams();
  params.set("selected", recommendationId);
  if (options?.pillarCode) {
    params.set("pillar", options.pillarCode);
  }
  return `${clientRecommendationsPath(clientId)}?${params.toString()}`;
}

/** Roadmap phase workspace deep link (existing phase detail route). */
export function clientRoadmapPhasePath(clientId: string, phaseId: string) {
  return `/clients/${clientId}/roadmap/phases/${phaseId}`;
}

/**
 * Customer / client-workspace Projects list (SS-UX-012).
 */
export function clientWorkspaceProjectsPath(clientId: string) {
  return clientWorkspaceSectionPath(clientId, "projects");
}

/**
 * Customer project detail workspace (SS-UX-012).
 */
export function clientProjectDetailPath(clientId: string, projectId: string) {
  return `${clientWorkspaceProjectsPath(clientId)}/${projectId}`;
}

/**
 * Staff Project Register filtered to a single client.
 * Customers must use clientWorkspaceProjectsPath / clientProjectDetailPath.
 */
export function clientProjectsPath(clientId: string) {
  return `/projects?client=${clientId}`;
}

/** Staff Project Register deep link for a selected project. */
export function staffProjectRegisterDetailPath(clientId: string, projectId: string) {
  return `${clientProjectsPath(clientId)}&selected=${encodeURIComponent(projectId)}`;
}
