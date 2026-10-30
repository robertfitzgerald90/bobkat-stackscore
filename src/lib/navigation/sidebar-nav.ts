import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Briefcase,
  ClipboardList,
  Compass,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LayoutGrid,
  Lightbulb,
  Map,
  Mail,
  Settings,
  Shield,
  UserCircle,
  Users,
  Camera,
  Library,
  WalletCards,
  Globe,
  LifeBuoy,
} from "lucide-react";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import {
  clientExplorePath,
  customerAssessmentDashboardPath,
} from "@/lib/clients/paths";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, item is omitted unless clientId is available. */
  requiresClient?: boolean;
  adminOnly?: boolean;
  staffOnly?: boolean;
  portfolioOnly?: boolean;
  badgeCount?: number;
  /**
   * Additional path prefixes that keep this item active (SS-UX-002).
   * Used so Roadmap stays highlighted on recommendations/projects, etc.
   */
  activePathPrefixes?: string[];
};

function customerHref(clientId: string | null, path: string): string {
  if (!clientId) return "/dashboard";
  return `/clients/${clientId}/${path}`;
}

/**
 * SS-UX-002 primary customer navigation — Overview, Explore, Roadmap, Reports.
 * Billing, Account, and Support live in secondary (account menu).
 */
export function getCustomerSidebarNav(clientId: string | null): SidebarNavItem[] {
  const roadmapHref = customerHref(clientId, "roadmap");
  const reportsHref = customerHref(clientId, "executive-reports");

  return [
    {
      href: clientId ? customerAssessmentDashboardPath(clientId) : "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: clientId ? clientExplorePath(clientId) : "/dashboard",
      label: "Explore",
      icon: Compass,
      requiresClient: true,
    },
    {
      href: roadmapHref,
      label: "Roadmap",
      icon: Map,
      requiresClient: true,
      activePathPrefixes: clientId
        ? [
            `/clients/${clientId}/recommendations`,
            `/clients/${clientId}/projects`,
            `/clients/${clientId}/roadmap`,
          ]
        : undefined,
    },
    {
      href: reportsHref,
      label: "Reports",
      icon: FileText,
      requiresClient: true,
      activePathPrefixes: clientId
        ? [
            `/clients/${clientId}/executive-reports`,
            `/clients/${clientId}/quarterly-reviews`,
            `/clients/${clientId}/quarterly-review`,
          ]
        : undefined,
    },
  ];
}

/** Secondary customer destinations — account menu / command palette (not primary sidebar). */
export function getCustomerSecondaryNav(clientId: string | null): SidebarNavItem[] {
  return [
    {
      href: customerHref(clientId, "billing"),
      label: "Subscription & Billing",
      icon: WalletCards,
      requiresClient: true,
    },
    { href: "/account", label: "Account", icon: UserCircle },
    { href: "/support", label: "Support", icon: LifeBuoy },
  ].filter((item) => !item.requiresClient || Boolean(clientId));
}

export function getConsultantSidebarNav(
  role: string,
  clientId: string | null,
  navBadges: Record<string, number> = {},
): SidebarNavItem[] {
  const clientScoped = (section: string): string =>
    clientId ? `/clients/${clientId}/${section}` : "/clients";

  const items: SidebarNavItem[] = [
    { href: "/portfolio", label: "Portfolio", icon: LayoutGrid, portfolioOnly: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/insights", label: "Business Insights", icon: BarChart3 },
    { href: "/consulting", label: "Consulting Workspace", icon: Briefcase },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/assessments", label: "Assessments", icon: ClipboardList },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    {
      href: clientScoped("recommendations"),
      label: "Recommendations",
      icon: Lightbulb,
    },
    { href: clientScoped("roadmap"), label: "Roadmaps", icon: Map },
    {
      href: clientScoped("lifecycle"),
      label: "Lifecycle",
      icon: Activity,
    },
    {
      href: clientScoped("executive-reports"),
      label: "Reports",
      icon: FileText,
    },
    { href: "/technology-catalog", label: "Technology Catalog", icon: Library },
    { href: "/playbooks", label: "Playbooks", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/admin/vcio", label: "vCIO Clients", icon: LayoutGrid, staffOnly: true },
    { href: "/admin/billing", label: "Billing", icon: WalletCards, adminOnly: true },
    { href: "/admin/users", label: "Users", icon: Shield, adminOnly: true },
    {
      href: "/admin/assessment-library",
      label: "Assessment Library",
      icon: BookOpen,
      adminOnly: true,
    },
    { href: "/snapshot-leads", label: "Snapshot Leads", icon: Camera, adminOnly: true },
    {
      href: "/website-leads",
      label: "Website Leads",
      icon: Globe,
      adminOnly: true,
      badgeCount: navBadges["/website-leads"],
    },
    {
      href: "/admin/communications",
      label: "Communications",
      icon: Mail,
      staffOnly: true,
    },
  ];

  return items.filter((item) => {
    if (item.adminOnly && role !== "admin") return false;
    if (item.staffOnly && role !== "admin" && role !== "technician") return false;
    if (item.portfolioOnly && !canAccessPortfolio(role)) return false;
    if (item.requiresClient && !clientId) return false;
    return true;
  });
}

export function getSidebarNavForRole(
  role: string,
  clientId: string | null,
  navBadges: Record<string, number> = {},
): SidebarNavItem[] {
  if (isCustomerMode(role)) {
    return getCustomerSidebarNav(clientId).filter(
      (item) => !item.requiresClient || Boolean(clientId),
    );
  }
  return getConsultantSidebarNav(role, clientId, navBadges);
}

/** Extract client id from pathname when viewing a client workspace. */
export function resolveClientIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/clients\/([^/]+)/);
  if (!match || match[1] === "new") return null;
  return match[1];
}

/** Whether a sidebar item should show as active for the current pathname. */
export function isSidebarNavItemActive(pathname: string, item: SidebarNavItem): boolean {
  if (pathname === item.href) return true;
  if (item.activePathPrefixes?.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  if (
    item.href !== "/dashboard" &&
    item.href !== "/clients" &&
    pathname.startsWith(`${item.href}/`)
  ) {
    return true;
  }
  if (item.href === "/clients" && pathname.startsWith("/clients/")) {
    return true;
  }
  return false;
}
