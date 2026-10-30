/**
 * SS-ADMIN-006 — Communications workspace five-group navigation.
 * Routes and adminOnly flags preserved from the prior flat subnav.
 */

export const COMMUNICATIONS_GROUP_IDS = [
  "overview",
  "outreach",
  "delivery",
  "automation",
  "configuration",
] as const;

export type CommunicationsGroupId = (typeof COMMUNICATIONS_GROUP_IDS)[number];

export type CommunicationsNavChild = {
  href: string;
  label: string;
  /** When true, active only on exact pathname match. */
  exact?: boolean;
  adminOnly?: boolean;
};

export type CommunicationsNavGroup = {
  id: CommunicationsGroupId;
  label: string;
  defaultHref: string;
  children: readonly CommunicationsNavChild[];
};

/**
 * Ticket-approved mapping — destinations keep existing hrefs.
 */
export const COMMUNICATIONS_GROUPS: readonly CommunicationsNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    defaultHref: "/admin/communications",
    children: [
      { href: "/admin/communications", label: "Overview", exact: true },
      { href: "/admin/communications/analytics", label: "Analytics" },
    ],
  },
  {
    id: "outreach",
    label: "Outreach",
    defaultHref: "/admin/communications/campaigns",
    children: [
      { href: "/admin/communications/campaigns", label: "Campaigns" },
      { href: "/admin/communications/prospects", label: "Prospects" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    defaultHref: "/admin/communications/templates",
    children: [
      { href: "/admin/communications/templates", label: "Templates" },
      { href: "/admin/communications/history", label: "History" },
      { href: "/admin/communications/testing", label: "Testing", adminOnly: true },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    defaultHref: "/admin/communications/automations",
    children: [
      { href: "/admin/communications/automations", label: "Automations", adminOnly: true },
    ],
  },
  {
    id: "configuration",
    label: "Configuration",
    defaultHref: "/admin/communications/components",
    children: [
      { href: "/admin/communications/components", label: "Components", adminOnly: true },
      { href: "/admin/communications/variables", label: "Variables" },
      { href: "/admin/communications/settings", label: "Settings", adminOnly: true },
    ],
  },
] as const;

const DESTINATION_MATCHERS: Array<{
  href: string;
  exact: boolean;
  groupId: CommunicationsGroupId;
}> = [
  { href: "/admin/communications/campaigns", exact: false, groupId: "outreach" },
  { href: "/admin/communications/prospects", exact: false, groupId: "outreach" },
  { href: "/admin/communications/templates", exact: false, groupId: "delivery" },
  { href: "/admin/communications/history", exact: false, groupId: "delivery" },
  { href: "/admin/communications/testing", exact: false, groupId: "delivery" },
  { href: "/admin/communications/automations", exact: false, groupId: "automation" },
  { href: "/admin/communications/components", exact: false, groupId: "configuration" },
  { href: "/admin/communications/variables", exact: false, groupId: "configuration" },
  { href: "/admin/communications/settings", exact: false, groupId: "configuration" },
  { href: "/admin/communications/analytics", exact: false, groupId: "overview" },
  { href: "/admin/communications", exact: true, groupId: "overview" },
];

export function isCommunicationsNavChildActive(
  pathname: string,
  child: CommunicationsNavChild,
): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  if (child.exact) return path === child.href;
  return path === child.href || path.startsWith(`${child.href}/`);
}

export function resolveActiveCommunicationsGroup(
  pathname: string,
): CommunicationsGroupId | null {
  const path = pathname.split("?")[0] ?? pathname;
  if (!path.startsWith("/admin/communications")) return null;

  for (const matcher of DESTINATION_MATCHERS) {
    if (matcher.exact) {
      if (path === matcher.href) return matcher.groupId;
      continue;
    }
    if (path === matcher.href || path.startsWith(`${matcher.href}/`)) {
      return matcher.groupId;
    }
  }

  return "overview";
}

export function resolveCommunicationsGroupHref(
  group: CommunicationsNavGroup,
  isAdmin: boolean,
): string {
  const visible = group.children.filter((child) => !child.adminOnly || isAdmin);
  if (visible.some((child) => child.href === group.defaultHref)) {
    return group.defaultHref;
  }
  return visible[0]?.href ?? group.defaultHref;
}

export function getVisibleCommunicationsGroups(
  isAdmin: boolean,
): CommunicationsNavGroup[] {
  return COMMUNICATIONS_GROUPS.map((group) => {
    const children = group.children.filter((child) => !child.adminOnly || isAdmin);
    const defaultHref =
      children.some((child) => child.href === group.defaultHref)
        ? group.defaultHref
        : (children[0]?.href ?? group.defaultHref);
    return { ...group, children, defaultHref };
  }).filter((group) => group.children.length > 0);
}

export const COMMUNICATIONS_GROUP_LABELS = COMMUNICATIONS_GROUPS.map(
  (group) => group.label,
) as readonly string[];
