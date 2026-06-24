import type { ClientStatus, Priority, UserRole } from "@/generated/prisma/client";

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  prospect: "Prospect",
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  technician: "Technician",
  client: "Client",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function formatClientStatus(status: string): string {
  const label = CLIENT_STATUS_LABELS[status as ClientStatus];
  if (label) return label;

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatUserRole(role: string): string {
  const label = USER_ROLE_LABELS[role as UserRole];
  if (label) return label;

  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatPriority(priority: string): string {
  const label = PRIORITY_LABELS[priority as Priority];
  if (label) return label;

  return priority
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
