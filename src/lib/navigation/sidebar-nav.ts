import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Camera,
  ClipboardList,
  Compass,
  FileText,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LifeBuoy,
  Mail,
  Map,
  Repeat,
  Settings,
  Shield,
  UserCircle,
  Users,
  WalletCards,
} from "lucide-react";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import {
  clientExplorePath,
  customerAssessmentDashboardPath,
} from "@/lib/clients/paths";

/** SS-ADMIN-002 primary staff navigation keys. */
export type StaffPrimaryNavId =
  | "command-center"
  | "clients"
  | "projects"
  | "leads"
  | "recurring-services"
  | "communications"
  | "operations";

export type SidebarNavChild = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  staffOnly?: boolean;
  portfolioOnly?: boolean;
  badgeCount?: number;
};

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Staff primary identity for exclusive active-state resolution (SS-ADMIN-002). */
  id?: StaffPrimaryNavId;
  /** Expandable group — children are secondary destinations. */
  children?: SidebarNavChild[];
  /** When true, item is omitted unless clientId is available. */
  requiresClient?: boolean;
  adminOnly?: boolean;
  staffOnly?: boolean;
  portfolioOnly?: boolean;
  badgeCount?: number;
  /**
   * Additional path prefixes that keep this item active (customer nav / SS-UX-002).
   */
  activePathPrefixes?: string[];
};

function customerHref(clientId: string | null, path: string): string {
  if (!clientId) return "/dashboard";
  return `/clients/${clientId}/${path}`;
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * SS-UX-002 / SS-UX-012 primary customer navigation —
 * Overview, Explore, Roadmap, Projects, Reports.
 * Billing, Account, and Support live in secondary (account menu).
 */
export function getCustomerSidebarNav(clientId: string | null): SidebarNavItem[] {
  const roadmapHref = customerHref(clientId, "roadmap");
  const projectsHref = customerHref(clientId, "projects");
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
        ? [`/clients/${clientId}/recommendations`, `/clients/${clientId}/roadmap`]
        : undefined,
    },
    {
      href: projectsHref,
      label: "Projects",
      icon: FolderKanban,
      requiresClient: true,
      activePathPrefixes: clientId
        ? [`/clients/${clientId}/projects`]
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

function filterNavChild(role: string, child: SidebarNavChild): boolean {
  if (child.adminOnly && role !== "admin") return false;
  if (child.staffOnly && role !== "admin" && role !== "technician") return false;
  if (child.portfolioOnly && !canAccessPortfolio(role)) return false;
  return true;
}

function filterNavItem(role: string, item: SidebarNavItem): boolean {
  if (item.adminOnly && role !== "admin") return false;
  if (item.staffOnly && role !== "admin" && role !== "technician") return false;
  if (item.portfolioOnly && !canAccessPortfolio(role)) return false;
  if (item.children) {
    return item.children.some((child) => filterNavChild(role, child));
  }
  return true;
}

/**
 * SS-ADMIN-002 staff primary navigation — seven destinations with grouped
 * Command Center / Leads / Operations secondary children.
 * `clientId` retained for API compatibility; selection no longer depends on it.
 */
export function getConsultantSidebarNav(
  role: string,
  clientId: string | null = null,
  navBadges: Record<string, number> = {},
): SidebarNavItem[] {
  void clientId; // retained for call-site compatibility; selection is route-based
  const items: SidebarNavItem[] = [
    {
      id: "command-center",
      href: "/dashboard",
      label: "Command Center",
      icon: LayoutDashboard,
      children: [
        { href: "/portfolio", label: "Portfolio", icon: LayoutGrid, portfolioOnly: true },
        { href: "/insights", label: "Business Insights", icon: BarChart3 },
        { href: "/consulting", label: "Consulting Workspace", icon: Briefcase },
        { href: "/assessments", label: "Assessments", icon: ClipboardList },
      ],
    },
    {
      id: "clients",
      href: "/clients",
      label: "Clients",
      icon: Users,
    },
    {
      id: "projects",
      href: "/projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      id: "leads",
      href: "/leads",
      label: "Leads",
      icon: Camera,
      adminOnly: true,
      children: [
        { href: "/snapshot-leads", label: "Snapshot Leads", icon: Camera, adminOnly: true },
        {
          href: "/website-leads",
          label: "Website Leads",
          icon: Globe,
          adminOnly: true,
          badgeCount: navBadges["/website-leads"],
        },
      ],
    },
    {
      id: "recurring-services",
      href: "/admin/vcio",
      label: "Recurring Services",
      icon: Repeat,
      staffOnly: true,
    },
    {
      id: "communications",
      href: "/admin/communications",
      label: "Communications",
      icon: Mail,
      staffOnly: true,
    },
    {
      id: "operations",
      href: "/settings",
      label: "Operations",
      icon: Settings,
      children: [
        { href: "/admin/billing", label: "Billing", icon: WalletCards, adminOnly: true },
        { href: "/admin/users", label: "Users", icon: Shield, adminOnly: true },
        {
          href: "/admin/assessment-library",
          label: "Assessment Library",
          icon: BookOpen,
          adminOnly: true,
        },
        { href: "/technology-catalog", label: "Technology Catalog", icon: Library },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return items
    .map((item) => {
      if (!item.children) return item;
      const children = item.children.filter((child) => filterNavChild(role, child));
      const badgeCount = children.reduce(
        (sum, child) => sum + (child.badgeCount ?? 0),
        item.badgeCount ?? 0,
      );
      return {
        ...item,
        children,
        badgeCount: badgeCount > 0 ? badgeCount : undefined,
      };
    })
    .filter((item) => filterNavItem(role, item));
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

/**
 * Deterministic staff primary active destination (SS-ADMIN-002).
 * Returns at most one primary id; unrecognized routes return null.
 */
export function resolveActiveStaffPrimaryId(pathname: string): StaffPrimaryNavId | null {
  if (pathMatchesPrefix(pathname, "/admin/communications")) return "communications";
  if (pathMatchesPrefix(pathname, "/admin/vcio")) return "recurring-services";
  if (
    pathMatchesPrefix(pathname, "/admin/billing") ||
    pathMatchesPrefix(pathname, "/admin/users") ||
    pathMatchesPrefix(pathname, "/admin/assessment-library") ||
    pathMatchesPrefix(pathname, "/technology-catalog") ||
    pathMatchesPrefix(pathname, "/settings")
  ) {
    return "operations";
  }
  if (
    pathMatchesPrefix(pathname, "/leads") ||
    pathMatchesPrefix(pathname, "/snapshot-leads") ||
    pathMatchesPrefix(pathname, "/website-leads")
  ) {
    return "leads";
  }
  if (pathname === "/projects" || pathname.startsWith("/projects/")) {
    return "projects";
  }
  if (pathname === "/clients" || pathname.startsWith("/clients/")) {
    return "clients";
  }
  if (
    pathname === "/dashboard" ||
    pathMatchesPrefix(pathname, "/portfolio") ||
    pathMatchesPrefix(pathname, "/insights") ||
    pathMatchesPrefix(pathname, "/consulting") ||
    pathMatchesPrefix(pathname, "/assessments")
  ) {
    return "command-center";
  }
  return null;
}

/** Whether a staff secondary child should show as the active nested destination. */
export function isStaffNavChildActive(pathname: string, child: SidebarNavChild): boolean {
  return pathMatchesPrefix(pathname, child.href);
}

/**
 * Whether a sidebar item should show as active for the current pathname.
 * Customer items use prefix rules (SS-UX-002). Staff items use exclusive primary ids.
 */
export function isSidebarNavItemActive(pathname: string, item: SidebarNavItem): boolean {
  if (item.id) {
    return resolveActiveStaffPrimaryId(pathname) === item.id;
  }

  if (pathname === item.href) return true;
  if (
    item.activePathPrefixes?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return true;
  }
  if (
    item.href !== "/dashboard" &&
    item.href !== "/clients" &&
    pathname.startsWith(`${item.href}/`)
  ) {
    return true;
  }
  return false;
}

/** Ordered staff primary labels for regression assertions. */
export const STAFF_PRIMARY_NAV_LABELS = [
  "Command Center",
  "Clients",
  "Projects",
  "Leads",
  "Recurring Services",
  "Communications",
  "Operations",
] as const;
