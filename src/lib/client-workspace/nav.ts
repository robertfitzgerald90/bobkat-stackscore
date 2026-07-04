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

/** Sections visible to client-portal users during Phase 1 (mirrors ProfileSectionVisibility). */
export const CLIENT_VISIBLE_WORKSPACE_SECTIONS: readonly ClientWorkspaceSection[] = [
  "overview",
  "documents",
  "contacts",
];

export function isClientVisibleWorkspaceSection(section: ClientWorkspaceSection): boolean {
  return CLIENT_VISIBLE_WORKSPACE_SECTIONS.includes(section);
}

export function isClientWorkspaceSection(value: string): value is ClientWorkspaceSection {
  return (CLIENT_WORKSPACE_SECTIONS as readonly string[]).includes(value);
}

/**
 * Hrefs for DOC-201 sections.
 * Returns null when the section page is not available yet (render disabled).
 */
export function resolveClientWorkspaceNavHref(
  clientId: string,
  section: ClientWorkspaceSection,
): string | null {
  switch (section) {
    case "overview":
      return `/clients/${clientId}/technology-profile`;
    case "journey":
    case "roadmap":
    case "projects":
    case "assessments":
    case "recommendations":
    case "assets":
    case "documents":
    case "contacts":
    case "billing":
    case "executive-reports":
    case "risks":
    case "activity":
      return `/clients/${clientId}/${section}`;
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
  if (rest.startsWith("/journey")) return "journey";
  if (rest.startsWith("/recommendations")) return "recommendations";
  if (rest.startsWith("/roadmap") || rest.startsWith("/improvement-plan")) {
    return "roadmap";
  }
  if (rest.startsWith("/contacts") || rest.startsWith("/business-profile")) {
    return "contacts";
  }
  if (
    rest.startsWith("/executive-reports") ||
    rest.startsWith("/quarterly-review") ||
    rest.startsWith("/progress-report") ||
    rest.startsWith("/improvement")
  ) {
    return "executive-reports";
  }
  if (rest.startsWith("/assessments")) return "assessments";
  if (rest.startsWith("/projects")) return "projects";
  if (rest.startsWith("/documents")) return "documents";

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
      isClientVisibleWorkspaceSection(item.section),
    );
  }
  return [...CLIENT_WORKSPACE_NAV];
}
