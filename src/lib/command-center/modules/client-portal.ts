import { registerCommands } from "@/lib/command-center/registry";
import {
  clientExplorePath,
  clientRecommendationsPath,
  clientWorkspaceExecutiveReportsPath,
  clientWorkspaceRoadmapPath,
  customerAssessmentDashboardPath,
} from "@/lib/clients/paths";
import type { PageContext } from "@/lib/command-center/types";

function clientIdFrom(context: PageContext): string | null {
  return context.userClientId ?? context.clientId;
}

export function registerClientPortalCommands(): void {
  registerCommands("client-portal", [
    {
      id: "nav:customer:assessment-dashboard",
      category: "navigation",
      title: "Overview",
      subtitle: "Your technology maturity summary",
      icon: "LayoutDashboard",
      keywords: ["dashboard", "briefing", "executive", "home", "overview"],
      permissions: { roles: ["client"], requiresClient: true },
      favoriteKey: "nav:customer:assessment-dashboard",
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? customerAssessmentDashboardPath(clientId) : "/dashboard";
      },
    },
    {
      id: "nav:customer:explore",
      category: "navigation",
      title: "Explore",
      subtitle: "Technology maturity pillars",
      icon: "Compass",
      keywords: ["explore", "pillars", "maturity"],
      permissions: { roles: ["client"], requiresClient: true },
      favoriteKey: "nav:customer:explore",
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? clientExplorePath(clientId) : null;
      },
    },
    {
      id: "nav:customer:roadmap",
      category: "navigation",
      title: "Roadmap",
      subtitle: "Living execution plan and priorities",
      icon: "Map",
      keywords: ["roadmap", "plan", "strategy", "execution"],
      permissions: { roles: ["client"], requiresClient: true },
      favoriteKey: "nav:customer:roadmap",
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? clientWorkspaceRoadmapPath(clientId) : null;
      },
    },
    {
      id: "nav:customer:recommendations",
      category: "deliverables",
      title: "Recommendations",
      subtitle: "Prioritized improvement opportunities",
      icon: "Lightbulb",
      keywords: ["recommendations", "priorities", "opportunities"],
      permissions: { roles: ["client"], requiresClient: true },
      when: (context) => Boolean(context.clientPortal?.hasRecommendations),
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? clientRecommendationsPath(clientId) : null;
      },
    },
    {
      id: "nav:customer:vcio",
      category: "navigation",
      title: "vCIO Dashboard",
      subtitle: "Strategic technology advisory workspace",
      icon: "LayoutGrid",
      keywords: ["vcio", "strategy", "advisory"],
      permissions: { roles: ["client"], requiresClient: true },
      favoriteKey: "nav:customer:vcio",
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? `/clients/${clientId}/vcio` : null;
      },
    },
    {
      id: "nav:customer:lifecycle",
      category: "navigation",
      title: "Technology Lifecycle",
      subtitle: "Lifecycle progress and status",
      icon: "Activity",
      keywords: ["lifecycle", "maturity"],
      permissions: { roles: ["client"], requiresClient: true },
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? `/clients/${clientId}/lifecycle` : null;
      },
    },
    {
      id: "nav:customer:projects",
      category: "navigation",
      title: "Projects",
      subtitle: "Implementation projects",
      icon: "FolderKanban",
      keywords: ["projects", "implementation"],
      permissions: { roles: ["client"], requiresClient: true },
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? `/clients/${clientId}/projects` : null;
      },
    },
    {
      id: "nav:customer:quarterly-reviews",
      category: "navigation",
      title: "Business Reviews",
      subtitle: "vCIO review history",
      icon: "CalendarDays",
      keywords: ["quarterly", "review", "qbr"],
      permissions: { roles: ["client"], requiresClient: true },
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? `/clients/${clientId}/quarterly-reviews` : null;
      },
    },
    {
      id: "nav:customer:reports",
      category: "deliverables",
      title: "Reports",
      subtitle: "Executive assessment report",
      icon: "FileText",
      keywords: ["report", "executive", "pdf"],
      permissions: { roles: ["client"], requiresClient: true },
      when: (context) => Boolean(context.clientPortal?.hasCompletedAssessment),
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? clientWorkspaceExecutiveReportsPath(clientId) : null;
      },
    },
    {
      id: "nav:customer:subscription-billing",
      category: "account",
      title: "Subscription & Billing",
      subtitle: "Manage subscription and invoices",
      icon: "WalletCards",
      keywords: ["billing", "subscription", "stripe", "invoice"],
      permissions: { roles: ["client"], requiresClient: true },
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? `/clients/${clientId}/billing` : null;
      },
    },
    {
      id: "nav:customer:account",
      category: "account",
      title: "Account",
      subtitle: "Profile and settings",
      href: "/account",
      icon: "UserCircle",
      keywords: ["account", "profile", "settings"],
      permissions: { roles: ["client"] },
      favoriteKey: "nav:customer:account",
    },
    {
      id: "nav:customer:support",
      category: "account",
      title: "Support",
      subtitle: "Help and booking",
      href: "/support",
      icon: "LifeBuoy",
      keywords: ["support", "help", "booking"],
      permissions: { roles: ["client"] },
    },
    {
      id: "client:resume-assessment",
      category: "assessment",
      title: "Resume Assessment",
      subtitle: "Continue where you left off",
      href: "/assessment/start",
      icon: "Play",
      keywords: ["resume", "assessment", "continue"],
      permissions: { roles: ["client"], requiresClient: true },
      when: (context) => Boolean(context.clientPortal?.draftAssessmentId),
      priority: 90,
    },
    {
      id: "client:review-report",
      category: "assessment",
      title: "Review Assessment Report",
      subtitle: "Executive report and results",
      icon: "FileText",
      keywords: ["report", "review", "assessment"],
      permissions: { roles: ["client"], requiresClient: true },
      when: (context) => Boolean(context.clientPortal?.reportHref),
      resolveHrefFromContext: (context) => context.clientPortal?.reportHref ?? null,
      priority: 85,
    },
    {
      id: "client:download-report",
      category: "deliverables",
      title: "Download Report",
      subtitle: "PDF export",
      icon: "Download",
      keywords: ["download", "pdf", "report"],
      permissions: { roles: ["client"], requiresClient: true },
      when: (context) => Boolean(context.clientPortal?.pdfHref),
      resolveHrefFromContext: (context) => context.clientPortal?.pdfHref ?? null,
      priority: 80,
    },
    {
      id: "client:view-recommendations",
      category: "deliverables",
      title: "View Recommendations",
      subtitle: "Top priorities from your assessment",
      icon: "Lightbulb",
      keywords: ["recommendations", "priorities"],
      permissions: { roles: ["client"], requiresClient: true },
      when: (context) => Boolean(context.clientPortal?.hasRecommendations),
      resolveHrefFromContext: (context) => {
        const clientId = clientIdFrom(context);
        return clientId ? clientRecommendationsPath(clientId) : null;
      },
      priority: 75,
    },
  ]);
}
