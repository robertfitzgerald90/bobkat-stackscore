import { registerCommands } from "@/lib/command-center/registry";

export function registerAssessmentCommands(): void {
  registerCommands("assessments", [
    {
      id: "assessments:dashboard",
      category: "navigation",
      title: "Assessments",
      subtitle: "All assessments",
      href: "/assessments",
      icon: "ClipboardList",
      keywords: ["assessment", "dashboard"],
      permissions: { staffOnly: true, clientHidden: true },
    },
    {
      id: "assessments:new",
      category: "create",
      title: "New Assessment",
      subtitle: "Start from clients",
      href: "/clients",
      icon: "Plus",
      keywords: ["assessment", "create", "new"],
      permissions: { staffOnly: true, clientHidden: true },
    },
  ]);
}
