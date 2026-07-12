import { registerCommands } from "@/lib/command-center/registry";

const COMMUNICATIONS_NAV = [
  { href: "/admin/communications", label: "Communications Overview", keywords: ["comms", "email"] },
  { href: "/admin/communications/campaigns", label: "Campaigns", keywords: ["outreach"] },
  { href: "/admin/communications/prospects", label: "Prospects", keywords: ["leads"] },
  { href: "/admin/communications/templates", label: "Email Templates", keywords: ["email"] },
  { href: "/admin/communications/history", label: "Communication History", keywords: ["messages"] },
  { href: "/admin/communications/analytics", label: "Communication Analytics", keywords: ["metrics"] },
  { href: "/admin/communications/variables", label: "Communication Variables", keywords: [] },
] as const;

const CONSULTANT_NAV = [
  { href: "/portfolio", label: "Portfolio", portfolioOnly: true, icon: "LayoutGrid" },
  { href: "/dashboard", label: "Dashboard", staffOnly: true, icon: "LayoutDashboard" },
  { href: "/clients", label: "Organizations", staffOnly: true, icon: "Users", keywords: ["clients"] },
  { href: "/assessments", label: "Assessments", staffOnly: true, icon: "ClipboardList" },
  { href: "/projects", label: "Projects", staffOnly: true, icon: "FolderKanban" },
  { href: "/technology-catalog", label: "Technology Catalog", staffOnly: true, icon: "Library" },
  { href: "/playbooks", label: "Playbooks", staffOnly: true, icon: "BookOpen" },
  { href: "/settings", label: "Settings", icon: "Settings" },
  { href: "/admin/users", label: "Users", adminOnly: true, icon: "Shield" },
  {
    href: "/admin/assessment-library",
    label: "Assessment Library",
    adminOnly: true,
    icon: "BookOpen",
  },
  { href: "/snapshot-leads", label: "Snapshot Leads", adminOnly: true, icon: "Camera" },
  { href: "/admin/communications", label: "Communications", staffOnly: true, icon: "Mail" },
] as const;

function commsCommandId(href: string): string {
  return `nav:comms:${href.replace(/^\/admin\/communications\/?/, "") || "overview"}`;
}

export function registerNavigationCommands(): void {
  registerCommands(
    "navigation",
    CONSULTANT_NAV.map((item) => ({
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
