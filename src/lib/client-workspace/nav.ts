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

/** Sections visible to client-portal users during Phase 1. */
const CLIENT_ROLE_SECTIONS: readonly ClientWorkspaceSection[] = [
  "overview",
  "documents",
  "contacts",
];

export function isClientWorkspaceSection(value: string): value is ClientWorkspaceSection {
  return (CLIENT_WORKSPACE_SECTIONS as readonly string[]).includes(value);
}

/**
 * Interim hrefs for sections that already have live routes (Commit 2).
 * Returns null when the section page is not available yet (render disabled).
 */
export function resolveClientWorkspaceNavHref(
  clientId: string,
  section: ClientWorkspaceSection,
): string | null {
  switch (section) {
    case "overview":
      return `/clients/${clientId}/technology-profile`;
    case "recommendations":
      return `/clients/${clientId}/recommendations`;
    case "roadmap":
      return `/clients/${clientId}/improvement-plan`;
    case "assessments":
      return `/clients/${clientId}/assessments/history`;
    case "contacts":
      return `/clients/${clientId}/business-profile`;
    case "executive-reports":
      return `/clients/${clientId}/quarterly-review`;
    case "journey":
    case "projects":
    case "assets":
    case "documents":
    case "billing":
    case "risks":
    case "activity":
      return null;
    default:
      return null;
  }
}

/** Resolves which DOC-201 section is active for the current pathname. */
export function resolveActiveWorkspaceSection(pathname: string): ClientWorkspaceSection {
  const clientBase = pathname.match(/^\/clients\/[^/]+/);
  if (!clientBase) return "overview";

  const rest = pathname.slice(clientBase[0].length);
  if (!rest || rest === "/") return "overview";

  if (rest.startsWith("/technology-profile") || rest.startsWith("/overview")) {
    return "overview";
  }
  if (rest.startsWith("/recommendations")) return "recommendations";
  if (rest.startsWith("/improvement-plan")) return "roadmap";
  if (rest.startsWith("/business-profile")) return "contacts";
  if (
    rest.startsWith("/quarterly-review") ||
    rest.startsWith("/progress-report") ||
    rest.startsWith("/improvement")
  ) {
    return "executive-reports";
  }
  if (rest.startsWith("/assessments")) return "assessments";

  for (const section of CLIENT_WORKSPACE_SECTIONS) {
    if (section === "overview") continue;
    if (rest === `/${section}` || rest.startsWith(`/${section}/`)) {
      return section;
    }
  }

  return "overview";
}

/** Nav items visible for the given role. */
export function getVisibleWorkspaceNav(role: string): ClientWorkspaceNavItem[] {
  if (role === "client") {
    return CLIENT_WORKSPACE_NAV.filter((item) =>
      CLIENT_ROLE_SECTIONS.includes(item.section),
    );
  }
  return [...CLIENT_WORKSPACE_NAV];
}
