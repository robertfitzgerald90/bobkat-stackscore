import { registerCommands } from "@/lib/command-center/registry";

export function registerProjectCommands(): void {
  registerCommands("projects", [
    {
      id: "projects:view",
      category: "navigation",
      title: "View Projects",
      subtitle: "Project register",
      href: "/projects",
      icon: "FolderKanban",
      keywords: ["projects"],
      permissions: { staffOnly: true },
    },
    {
      id: "projects:new",
      category: "create",
      title: "Create Project",
      subtitle: "Open project register",
      href: "/projects",
      icon: "Plus",
      keywords: ["project", "create", "new"],
      permissions: { staffOnly: true },
    },
    {
      id: "roadmaps:generate",
      category: "create",
      title: "Generate Roadmap",
      subtitle: "From client workspace",
      href: "/clients",
      icon: "Map",
      keywords: ["roadmap", "generate"],
      permissions: { staffOnly: true },
    },
    {
      id: "proposals:generate",
      category: "create",
      title: "Generate Proposal",
      subtitle: "Proposal workflow (coming soon)",
      href: "/clients",
      icon: "FileText",
      keywords: ["proposal", "generate"],
      permissions: { staffOnly: true },
      dynamic: true,
    },
  ]);
}
