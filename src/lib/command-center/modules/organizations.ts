import { registerCommands } from "@/lib/command-center/registry";

export function registerOrganizationCommands(): void {
  registerCommands("organizations", [
    {
      id: "organizations:new",
      category: "create",
      title: "New Client",
      subtitle: "Create client record",
      href: "/clients/new",
      icon: "Building2",
      keywords: ["client", "organization", "company", "create"],
      permissions: { staffOnly: true },
    },
    {
      id: "organizations:browse",
      category: "customers",
      title: "Browse Clients",
      subtitle: "Client directory",
      href: "/clients",
      icon: "Users",
      keywords: ["clients", "organizations", "customers"],
      permissions: { staffOnly: true },
    },
    {
      id: "communications:new-prospect",
      category: "create",
      title: "New Prospect",
      subtitle: "Quick Invite workflow",
      actionId: "communications:quick-invite",
      icon: "UserPlus",
      keywords: ["prospect", "lead", "invite"],
      permissions: { staffOnly: true },
    },
  ]);
}
