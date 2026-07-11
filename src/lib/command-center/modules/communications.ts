import { registerCommands } from "@/lib/command-center/registry";
import {
  clientWorkspaceAssessmentsPath,
  clientWorkspacePath,
  clientWorkspaceProjectsPath,
  clientWorkspaceRoadmapPath,
} from "@/lib/clients/paths";
import { isAssessmentContext, isClientWorkspaceContext, isTechnologyContext } from "@/lib/command-center/context";

export function registerCommunicationsCommands(): void {
  registerCommands("communications", [
    {
      id: "communications:quick-invite",
      category: "communications",
      title: "Quick Invite",
      subtitle: "Send assessment invitation",
      actionId: "communications:quick-invite",
      icon: "UserPlus",
      keywords: ["invite", "prospect", "email", "assessment", "outreach"],
      permissions: { staffOnly: true },
      shortcut: "Ctrl+I",
    },
    {
      id: "communications:new-campaign",
      category: "communications",
      title: "New Campaign",
      subtitle: "Create outreach campaign",
      href: "/admin/communications/campaigns/new",
      icon: "Megaphone",
      keywords: ["campaign", "outreach"],
      permissions: { staffOnly: true },
    },
    {
      id: "communications:import-prospects",
      category: "communications",
      title: "Import Prospects",
      subtitle: "CSV import",
      href: "/admin/communications/prospects/import",
      icon: "Upload",
      keywords: ["csv", "prospects", "bulk"],
      permissions: { staffOnly: true },
    },
    {
      id: "communications:preview-template",
      category: "communications",
      title: "Preview Template",
      subtitle: "Assessment invitation (EMAIL-009)",
      href: "/admin/communications/templates/EMAIL-009",
      icon: "Eye",
      keywords: ["preview", "email", "template"],
      permissions: { staffOnly: true },
    },
    {
      id: "communications:test-email",
      category: "communications",
      title: "Send Test Email",
      subtitle: "Open template library",
      href: "/admin/communications/templates",
      icon: "Send",
      keywords: ["test", "email"],
      permissions: { staffOnly: true },
    },
  ]);
}

export function registerContextualCommands(): void {
  registerCommands("contextual", [
    {
      id: "context:client-quick-invite",
      category: "contextual",
      title: "Quick Invite",
      subtitle: "Invite this organization",
      actionId: "communications:quick-invite",
      icon: "UserPlus",
      keywords: ["invite"],
      permissions: { staffOnly: true },
      priority: 100,
      when: (ctx) => isClientWorkspaceContext(ctx),
    },
    {
      id: "context:client-roadmap",
      category: "contextual",
      title: "Generate Roadmap",
      subtitle: "Open organization roadmap",
      icon: "Map",
      keywords: ["roadmap"],
      permissions: { staffOnly: true },
      priority: 90,
      when: (ctx) => isClientWorkspaceContext(ctx),
      href: "",
    },
    {
      id: "context:client-blueprint",
      category: "contextual",
      title: "Technology Blueprint",
      subtitle: "View technology profile",
      icon: "Library",
      keywords: ["blueprint", "technology"],
      permissions: { staffOnly: true },
      priority: 85,
      when: (ctx) => isClientWorkspaceContext(ctx),
      href: "",
    },
    {
      id: "context:client-new-project",
      category: "contextual",
      title: "New Project",
      subtitle: "Create project for organization",
      icon: "FolderKanban",
      keywords: ["project"],
      permissions: { staffOnly: true },
      priority: 80,
      when: (ctx) => isClientWorkspaceContext(ctx),
      href: "",
    },
    {
      id: "context:client-run-assessment",
      category: "contextual",
      title: "Run Assessment",
      subtitle: "Open assessments",
      icon: "ClipboardList",
      keywords: ["assessment"],
      permissions: { staffOnly: true },
      priority: 75,
      when: (ctx) => isClientWorkspaceContext(ctx),
      href: "",
    },
    {
      id: "context:assessment-roadmap",
      category: "contextual",
      title: "Generate Roadmap",
      subtitle: "From assessment results",
      icon: "Map",
      keywords: ["roadmap"],
      permissions: { staffOnly: true },
      priority: 95,
      when: (ctx) => isAssessmentContext(ctx),
      href: "",
    },
    {
      id: "context:assessment-export-pdf",
      category: "contextual",
      title: "Export PDF",
      subtitle: "Assessment report",
      icon: "FileText",
      keywords: ["pdf", "export", "report"],
      permissions: { staffOnly: true },
      priority: 90,
      when: (ctx) => isAssessmentContext(ctx),
      href: "",
    },
    {
      id: "context:assessment-recommendations",
      category: "contextual",
      title: "View Recommendations",
      subtitle: "Assessment recommendations",
      icon: "Lightbulb",
      keywords: ["recommendations"],
      permissions: { staffOnly: true },
      priority: 85,
      when: (ctx) => isAssessmentContext(ctx),
      href: "",
    },
    {
      id: "context:technology-view-playbooks",
      category: "contextual",
      title: "View Playbooks",
      subtitle: "Related playbooks",
      href: "/playbooks",
      icon: "BookOpen",
      keywords: ["playbooks"],
      permissions: { staffOnly: true },
      priority: 80,
      when: (ctx) => isTechnologyContext(ctx),
    },
    {
      id: "context:technology-create-recommendation",
      category: "contextual",
      title: "Create Recommendation",
      subtitle: "From technology catalog",
      href: "/clients",
      icon: "Lightbulb",
      keywords: ["recommendation"],
      permissions: { staffOnly: true },
      priority: 70,
      when: (ctx) => isTechnologyContext(ctx),
    },
  ]);
}

/** Resolve dynamic hrefs for contextual commands after page context is known */
export function resolveContextualHref(
  commandId: string,
  context: { clientId: string | null; assessmentId: string | null; technologySlug: string | null },
): string | null {
  const { clientId, assessmentId } = context;

  switch (commandId) {
    case "context:client-roadmap":
      return clientId ? clientWorkspaceRoadmapPath(clientId) : null;
    case "context:client-blueprint":
      return clientId ? clientWorkspacePath(clientId) : null;
    case "context:client-new-project":
      return clientId ? clientWorkspaceProjectsPath(clientId) : null;
    case "context:client-run-assessment":
      return clientId ? clientWorkspaceAssessmentsPath(clientId) : null;
    case "context:assessment-roadmap":
      return clientId ? clientWorkspaceRoadmapPath(clientId) : null;
    case "context:assessment-export-pdf":
      return assessmentId ? `/assessments/${assessmentId}/report` : null;
    case "context:assessment-recommendations":
      return clientId ? `/clients/${clientId}/recommendations` : null;
    case "context:technology-view-product":
      return context.technologySlug
        ? `/technology-catalog/${context.technologySlug}`
        : null;
    default:
      return null;
  }
}
