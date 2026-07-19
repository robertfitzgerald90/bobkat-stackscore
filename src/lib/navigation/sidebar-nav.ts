import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
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
} from "lucide-react";
import { canAccessPortfolio } from "@/lib/navigation/default-landing";
import { isCustomerMode } from "@/lib/navigation/portal-mode";
import { customerAssessmentDashboardPath } from "@/lib/clients/paths";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** When true, item is omitted unless clientId is available. */
  requiresClient?: boolean;
  adminOnly?: boolean;
  staffOnly?: boolean;
  portfolioOnly?: boolean;
};

function customerHref(clientId: string | null, path: string): string {
  if (!clientId) return "/dashboard";
  return `/clients/${clientId}/${path}`;
}

export function getCustomerSidebarNav(clientId: string | null): SidebarNavItem[] {
  return [
    {
      href: clientId ? customerAssessmentDashboardPath(clientId) : "/dashboard",
      label: "Assessment Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: customerHref(clientId, "recommendations"),
      label: "Recommendations",
      icon: Lightbulb,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "lifecycle"),
      label: "Technology Lifecycle",
      icon: Activity,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "vcio"),
      label: "vCIO Dashboard",
      icon: LayoutGrid,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "roadmap"),
      label: "Roadmap",
      icon: Map,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "quarterly-reviews"),
      label: "Quarterly Reviews",
      icon: CalendarDays,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "projects"),
      label: "Projects",
      icon: FolderKanban,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "executive-reports"),
      label: "Reports",
      icon: FileText,
      requiresClient: true,
    },
    {
      href: customerHref(clientId, "billing"),
      label: "Subscription & Billing",
      icon: WalletCards,
      requiresClient: true,
    },
    { href: "/account", label: "Account", icon: UserCircle },
  ];
}

export function getConsultantSidebarNav(
  role: string,
  clientId: string | null,
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
): SidebarNavItem[] {
  if (isCustomerMode(role)) {
    return getCustomerSidebarNav(clientId).filter(
      (item) => !item.requiresClient || Boolean(clientId),
    );
  }
  return getConsultantSidebarNav(role, clientId);
}

/** Extract client id from pathname when viewing a client workspace. */
export function resolveClientIdFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/clients\/([^/]+)/);
  if (!match || match[1] === "new") return null;
  return match[1];
}
