/**
 * Client Workspace navigation.
 * Section registry preserves DOC-201 routes; SS-ADMIN-003 staff chrome uses five groups.
 * Immediate Focus is an Overview component — not a nav item (DOC-161 / DOC-163).
 */

export const CLIENT_WORKSPACE_SECTIONS = [
  "overview",
  "explore",
  "360",
  "lifecycle",
  "vcio",
  "journey",
  "roadmap",
  "quarterly-reviews",
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
  "communications",
] as const;

export type ClientWorkspaceSection = (typeof CLIENT_WORKSPACE_SECTIONS)[number];

export type ClientWorkspaceNavItem = {
  section: ClientWorkspaceSection;
  label: string;
  /** When true, section is Overview (default landing). */
  isOverview?: boolean;
};

/** Section registry + page-title labels (routes preserved). */
export const CLIENT_WORKSPACE_NAV: readonly ClientWorkspaceNavItem[] = [
  { section: "overview", label: "Overview", isOverview: true },
  { section: "explore", label: "Explore" },
  { section: "360", label: "Customer 360" },
  { section: "lifecycle", label: "Technology Lifecycle" },
  { section: "vcio", label: "vCIO Dashboard" },
  { section: "journey", label: "Technology Journey" },
  { section: "roadmap", label: "Living Execution Plan" },
  { section: "quarterly-reviews", label: "Business Reviews" },
  { section: "projects", label: "Projects" },
  { section: "assessments", label: "Assessments" },
  { section: "recommendations", label: "Recommendations" },
  { section: "assets", label: "Technology Stack" },
  { section: "documents", label: "Documents" },
  { section: "contacts", label: "Contacts" },
  { section: "billing", label: "Subscription & Billing" },
  { section: "executive-reports", label: "Executive Reports" },
  { section: "risks", label: "Risks" },
  { section: "activity", label: "Activity" },
  { section: "communications", label: "Communications" },
] as const;

/** SS-ADMIN-003 staff workspace groups. */
export const CLIENT_WORKSPACE_GROUP_IDS = [
  "overview",
  "assessment",
  "strategy",
  "execution",
  "relationship",
] as const;

export type ClientWorkspaceGroupId = (typeof CLIENT_WORKSPACE_GROUP_IDS)[number];

export type ClientWorkspaceGroupChild = {
  section: ClientWorkspaceSection;
  label: string;
};

export type ClientWorkspaceGroup = {
  id: ClientWorkspaceGroupId;
  label: string;
  defaultSection: ClientWorkspaceSection;
  children: readonly ClientWorkspaceGroupChild[];
};

/**
 * Staff two-level navigation (SS-ADMIN-003).
 * Risks omitted from visible children; route `/clients/{id}/risks` remains.
 */
export const CLIENT_WORKSPACE_GROUPS: readonly ClientWorkspaceGroup[] = [
  {
    id: "overview",
    label: "Overview",
    defaultSection: "overview",
    children: [
      { section: "overview", label: "Client Overview" },
      { section: "360", label: "Customer 360" },
      { section: "journey", label: "Technology Journey" },
    ],
  },
  {
    id: "assessment",
    label: "Assessment",
    defaultSection: "assessments",
    children: [
      { section: "assessments", label: "Assessments" },
      { section: "explore", label: "Explore" },
      { section: "assets", label: "Technology Stack" },
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    defaultSection: "recommendations",
    children: [
      { section: "recommendations", label: "Recommendations" },
      { section: "roadmap", label: "Roadmap" },
      { section: "documents", label: "Documents" },
      { section: "executive-reports", label: "Executive Reports" },
    ],
  },
  {
    id: "execution",
    label: "Execution",
    defaultSection: "projects",
    children: [{ section: "projects", label: "Projects" }],
  },
  {
    id: "relationship",
    label: "Relationship",
    defaultSection: "contacts",
    children: [
      { section: "contacts", label: "Contacts" },
      { section: "lifecycle", label: "Technology Lifecycle" },
      { section: "vcio", label: "vCIO" },
      { section: "quarterly-reviews", label: "Business Reviews" },
      { section: "billing", label: "Billing" },
      { section: "activity", label: "Activity" },
      { section: "communications", label: "Communications" },
    ],
  },
] as const;

const SECTION_TO_GROUP: Record<ClientWorkspaceSection, ClientWorkspaceGroupId> = {
  overview: "overview",
  "360": "overview",
  journey: "overview",
  risks: "overview",
  assessments: "assessment",
  explore: "assessment",
  assets: "assessment",
  recommendations: "strategy",
  roadmap: "strategy",
  documents: "strategy",
  "executive-reports": "strategy",
  projects: "execution",
  contacts: "relationship",
  lifecycle: "relationship",
  vcio: "relationship",
  "quarterly-reviews": "relationship",
  billing: "relationship",
  activity: "relationship",
  communications: "relationship",
};

/** Sections reachable by customer portal users (SS-UX-002 allowlist for deep links). */
export const CLIENT_VISIBLE_WORKSPACE_SECTIONS: readonly ClientWorkspaceSection[] = [
  "overview",
  "explore",
  "lifecycle",
  "vcio",
  "roadmap",
  "quarterly-reviews",
  "projects",
  "recommendations",
  "executive-reports",
  "billing",
];

export function isClientVisibleWorkspaceSection(section: ClientWorkspaceSection): boolean {
  return CLIENT_VISIBLE_WORKSPACE_SECTIONS.includes(section);
}

export function isClientWorkspaceSection(value: string): value is ClientWorkspaceSection {
  return (CLIENT_WORKSPACE_SECTIONS as readonly string[]).includes(value);
}

export function isClientWorkspaceGroupId(value: string): value is ClientWorkspaceGroupId {
  return (CLIENT_WORKSPACE_GROUP_IDS as readonly string[]).includes(value);
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
    case "explore":
      return `/clients/${clientId}/explore`;
    case "360":
      return `/clients/${clientId}/360`;
    case "lifecycle":
      return `/clients/${clientId}/lifecycle`;
    case "vcio":
      return `/clients/${clientId}/vcio`;
    case "quarterly-reviews":
      return `/clients/${clientId}/quarterly-reviews`;
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
    case "communications":
      return `/clients/${clientId}/${section}`;
    default:
      return null;
  }
}

export function resolveClientWorkspaceGroupHref(
  clientId: string,
  group: ClientWorkspaceGroup,
): string | null {
  return resolveClientWorkspaceNavHref(clientId, group.defaultSection);
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
  if (rest.startsWith("/explore")) return "explore";
  if (rest.startsWith("/360")) return "360";
  if (rest.startsWith("/lifecycle")) return "lifecycle";
  if (rest.startsWith("/journey")) return "journey";
  if (rest.startsWith("/vcio")) return "vcio";
  if (rest.startsWith("/quarterly-reviews") || rest.startsWith("/quarterly-review")) {
    return "quarterly-reviews";
  }
  if (rest.startsWith("/recommendations")) return "recommendations";
  if (rest.startsWith("/roadmap") || rest.startsWith("/improvement-plan")) {
    return "roadmap";
  }
  if (rest.startsWith("/contacts") || rest.startsWith("/business-profile")) {
    return "contacts";
  }
  if (
    rest.startsWith("/executive-reports") ||
    rest.startsWith("/progress-report") ||
    (rest.startsWith("/improvement") && !rest.startsWith("/improvement-plan"))
  ) {
    return "executive-reports";
  }
  if (rest.startsWith("/assessments")) return "assessments";
  if (rest.startsWith("/projects")) return "projects";
  if (rest.startsWith("/documents")) return "documents";
  if (rest.startsWith("/communications")) return "communications";

  for (const section of CLIENT_WORKSPACE_SECTIONS) {
    if (section === "overview") continue;
    if (rest === `/${section}` || rest.startsWith(`/${section}/`)) {
      return section;
    }
  }

  return "overview";
}

/** Exactly one staff workspace group for recognized client routes. */
export function resolveActiveWorkspaceGroup(pathname: string): ClientWorkspaceGroupId {
  const section = resolveActiveWorkspaceSection(pathname);
  return SECTION_TO_GROUP[section];
}

export function getWorkspaceGroupById(
  groupId: ClientWorkspaceGroupId,
): ClientWorkspaceGroup | undefined {
  return CLIENT_WORKSPACE_GROUPS.find((group) => group.id === groupId);
}

/** Staff five-group navigation (Risks never included). */
export function getStaffWorkspaceGroups(): readonly ClientWorkspaceGroup[] {
  return CLIENT_WORKSPACE_GROUPS;
}

/**
 * Flat nav items visible for the given role.
 * Staff: grouped chrome uses `getStaffWorkspaceGroups`; this excludes Risks.
 * Client: DOC-201 allowlist for deep-link helpers (customer chrome uses AppSidebar).
 */
export function getVisibleWorkspaceNav(role: string): ClientWorkspaceNavItem[] {
  if (role === "client") {
    return CLIENT_WORKSPACE_NAV.filter((item) =>
      isClientVisibleWorkspaceSection(item.section),
    );
  }

  const visibleSections = new Set(
    CLIENT_WORKSPACE_GROUPS.flatMap((group) => group.children.map((child) => child.section)),
  );
  return CLIENT_WORKSPACE_NAV.filter((item) => visibleSections.has(item.section));
}

/** Whether a secondary destination should show as active for the pathname. */
export function isWorkspaceNavChildActive(
  pathname: string,
  section: ClientWorkspaceSection,
): boolean {
  return resolveActiveWorkspaceSection(pathname) === section;
}
