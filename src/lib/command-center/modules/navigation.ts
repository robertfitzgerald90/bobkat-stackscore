import { registerCommands } from "@/lib/command-center/registry";

/** SS-ADMIN-002 — Communications destinations (unchanged behavior). */
const COMMUNICATIONS_NAV = [
  { href: "/admin/communications", label: "Communications Overview", keywords: ["comms", "email"] },
  { href: "/admin/communications/campaigns", label: "Campaigns", keywords: ["outreach"] },
  { href: "/admin/communications/prospects", label: "Prospects", keywords: ["leads"] },
  { href: "/admin/communications/templates", label: "Email Templates", keywords: ["email"] },
  { href: "/admin/communications/history", label: "Communication History", keywords: ["messages"] },
  { href: "/admin/communications/analytics", label: "Communication Analytics", keywords: ["metrics"] },
  { href: "/admin/communications/variables", label: "Communication Variables", keywords: [] },
] as const;

/**
 * SS-ADMIN-002 staff command palette navigation — aligned with seven primary
 * destinations + secondary Command Center / Leads / Operations children.
 * Playbooks omitted from palette (route preserved; not primary).
 */
const STAFF_NAV = [
  {
    href: "/dashboard",
    label: "Command Center",
    staffOnly: true,
    icon: "LayoutDashboard",
    keywords: ["dashboard", "home"],
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    portfolioOnly: true,
    icon: "LayoutGrid",
    keywords: ["command center"],
  },
  {
    href: "/insights",
    label: "Business Insights",
    staffOnly: true,
    icon: "BarChart3",
    keywords: ["command center", "insights"],
  },
  {
    href: "/consulting",
    label: "Consulting Workspace",
    staffOnly: true,
    icon: "Briefcase",
    keywords: ["command center", "consulting"],
  },
  {
    href: "/assessments",
    label: "Assessments",
    staffOnly: true,
    icon: "ClipboardList",
    keywords: ["command center", "assessment"],
  },
  {
    href: "/clients",
    label: "Clients",
    staffOnly: true,
    icon: "Users",
    keywords: ["organizations", "customers"],
  },
  {
    href: "/projects",
    label: "Projects",
    staffOnly: true,
    icon: "FolderKanban",
    keywords: ["delivery"],
  },
  {
    href: "/leads",
    label: "Leads",
    adminOnly: true,
    icon: "Camera",
    keywords: ["intake", "snapshot", "website"],
  },
  {
    href: "/snapshot-leads",
    label: "Snapshot Leads",
    adminOnly: true,
    icon: "Camera",
    keywords: ["leads"],
  },
  {
    href: "/website-leads",
    label: "Website Leads",
    adminOnly: true,
    icon: "Globe",
    keywords: ["leads"],
  },
  {
    href: "/admin/communications/prospects",
    label: "Communications Prospects",
    adminOnly: true,
    icon: "Mail",
    keywords: ["leads", "prospects", "outreach"],
  },
  {
    href: "/admin/vcio",
    label: "Recurring Services",
    staffOnly: true,
    icon: "Repeat",
    keywords: ["vcio", "subscriptions"],
  },
  {
    href: "/admin/communications",
    label: "Communications",
    staffOnly: true,
    icon: "Mail",
    keywords: ["email"],
  },
  {
    href: "/admin/billing",
    label: "Billing",
    adminOnly: true,
    icon: "WalletCards",
    keywords: ["operations"],
  },
  {
    href: "/admin/users",
    label: "Users",
    adminOnly: true,
    icon: "Shield",
    keywords: ["operations"],
  },
  {
    href: "/admin/assessment-library",
    label: "Assessment Library",
    adminOnly: true,
    icon: "BookOpen",
    keywords: ["operations"],
  },
  {
    href: "/technology-catalog",
    label: "Technology Catalog",
    staffOnly: true,
    icon: "Library",
    keywords: ["operations", "catalog"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "Settings",
    keywords: ["operations"],
  },
] as const;

function commsCommandId(href: string): string {
  return `nav:comms:${href.replace(/^\/admin\/communications\/?/, "") || "overview"}`;
}

export function registerNavigationCommands(): void {
  registerCommands(
    "navigation",
    STAFF_NAV.map((item) => ({
      id: `nav:${item.href}`,
      category: "navigation" as const,
      title: item.label,
      subtitle: "Go to page",
      href: item.href,
      icon: item.icon,
      keywords: [
        item.label,
        item.href,
        ...("keywords" in item ? [...(item.keywords ?? [])] : []),
      ],
      permissions: {
        adminOnly: "adminOnly" in item ? item.adminOnly : undefined,
        staffOnly: "staffOnly" in item ? item.staffOnly : undefined,
        portfolioOnly: "portfolioOnly" in item ? item.portfolioOnly : undefined,
        clientHidden: true,
      },
      favoriteKey: `nav:${item.href}`,
    })),
  );

  registerCommands(
    "navigation",
    COMMUNICATIONS_NAV.map((item) => ({
      id: commsCommandId(item.href),
      category: "navigation" as const,
      title: item.label,
      subtitle: "Communications",
      href: item.href,
      icon: "Mail",
      keywords: [item.label, ...item.keywords],
      permissions: { staffOnly: true, clientHidden: true },
      favoriteKey: commsCommandId(item.href),
    })),
  );
}
