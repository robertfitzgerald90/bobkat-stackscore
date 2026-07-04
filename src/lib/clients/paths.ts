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

export function clientRecommendationDetailPath(clientId: string, recommendationId: string) {
  return `${clientRecommendationsPath(clientId)}?selected=${recommendationId}`;
}

/**
 * Future Client Workspace Projects section (DOC-201).
 * Not yet routed — use clientProjectsPath for live project register links.
 */
export function clientWorkspaceProjectsPath(clientId: string) {
  return clientWorkspaceSectionPath(clientId, "projects");
}

/**
 * Project deep link. Uses the global Project Register for detail views.
 */
export function clientProjectDetailPath(clientId: string, projectId: string) {
  return `${clientProjectsPath(clientId)}&selected=${projectId}`;
}

/** Project Register filtered to a single client. */
export function clientProjectsPath(clientId: string) {
  return `/projects?client=${clientId}`;
}
