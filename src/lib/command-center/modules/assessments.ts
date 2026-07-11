import { registerCommands } from "@/lib/command-center/registry";

export function registerAssessmentCommands(): void {
  registerCommands("assessments", [
    {
      id: "assessments:dashboard",
      category: "navigation",
      title: "Assessment Dashboard",
      subtitle: "All assessments",
      href: "/assessments",
      icon: "ClipboardList",
      keywords: ["assessment", "dashboard"],
    },
    {
      id: "assessments:new",
      category: "create",
      title: "New Assessment",
      subtitle: "Start from clients",
      href: "/clients",
      icon: "Plus",
      keywords: ["assessment", "create", "new"],
      permissions: { staffOnly: true },
    },
    {
      id: "assessments:resume",
      category: "navigation",
      title: "Resume Assessment",
      subtitle: "Continue in progress",
      href: "/assessment/start",
      icon: "Play",
      keywords: ["resume", "assessment", "continue"],
      permissions: { clientHidden: true },
    },
  ]);
}
