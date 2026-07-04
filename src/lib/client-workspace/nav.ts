/**
 * Client Workspace primary navigation (DOC-201, DEV-002 Phase 1).
 * Immediate Focus is an Overview component — not a nav item (DOC-161 / DOC-163).
 */

export const CLIENT_WORKSPACE_SECTIONS = [
  "overview",
  "journey",
  "roadmap",
  "projects",
  "assessments",
  "recommendations",
  "assets",
  "documents",
  "contacts",
  "billing",
  "executive-reports",
  "risks",
  "activity",
] as const;

export type ClientWorkspaceSection = (typeof CLIENT_WORKSPACE_SECTIONS)[number];

export type ClientWorkspaceNavItem = {
  section: ClientWorkspaceSection;
  label: string;
  /** When true, section is Overview (default landing). */
  isOverview?: boolean;
};

/** DOC-201 navigation order and labels. */
export const CLIENT_WORKSPACE_NAV: readonly ClientWorkspaceNavItem[] = [
  { section: "overview", label: "Overview", isOverview: true },
  { section: "journey", label: "Technology Journey" },
  { section: "roadmap", label: "Roadmap" },
  { section: "projects", label: "Projects" },
  { section: "assessments", label: "Assessments" },
  { section: "recommendations", label: "Recommendations" },
  { section: "assets", label: "Assets" },
  { section: "documents", label: "Documents" },
  { section: "contacts", label: "Contacts" },
  { section: "billing", label: "Billing" },
  { section: "executive-reports", label: "Executive Reports" },
  { section: "risks", label: "Risks" },
  { section: "activity", label: "Activity" },
] as const;

export function isClientWorkspaceSection(value: string): value is ClientWorkspaceSection {
  return (CLIENT_WORKSPACE_SECTIONS as readonly string[]).includes(value);
}
