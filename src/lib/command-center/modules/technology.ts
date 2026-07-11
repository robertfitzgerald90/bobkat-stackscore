import { registerCommands } from "@/lib/command-center/registry";

export function registerTechnologyCommands(): void {
  registerCommands("technology", [
    {
      id: "technology:catalog",
      category: "navigation",
      title: "Technology Catalog",
      subtitle: "Browse vendors and products",
      href: "/technology-catalog",
      icon: "Library",
      keywords: ["technology", "catalog", "vendor", "product"],
      permissions: { staffOnly: true },
    },
    {
      id: "technology:search-hint",
      category: "technology",
      title: "Search Technologies",
      subtitle: "Type a vendor or product name",
      icon: "Search",
      keywords: ["ninja", "unifi", "microsoft", "search"],
      permissions: { staffOnly: true },
    },
    {
      id: "technology:playbooks",
      category: "navigation",
      title: "Playbooks",
      subtitle: "Technology playbooks",
      href: "/playbooks",
      icon: "BookOpen",
      keywords: ["playbook", "deploy"],
      permissions: { staffOnly: true },
    },
  ]);
}
