import type { RoadmapPhaseStatus, UserRole } from "@/generated/prisma/client";

export function isConsultantRole(role: UserRole): boolean {
  return role === "admin" || role === "technician";
}

const CLIENT_ALLOWED_TRANSITIONS: Array<{
  from: RoadmapPhaseStatus;
  to: RoadmapPhaseStatus;
}> = [{ from: "awaiting_approval", to: "approved" }];

export function canClientTransitionPhase(
  from: RoadmapPhaseStatus,
  to: RoadmapPhaseStatus,
): boolean {
  return CLIENT_ALLOWED_TRANSITIONS.some(
    (transition) => transition.from === from && transition.to === to,
  );
}

export function canUpdatePhaseStatus(
  role: UserRole,
  from: RoadmapPhaseStatus,
  to: RoadmapPhaseStatus,
): boolean {
  if (isConsultantRole(role)) return true;
  if (role === "client") return canClientTransitionPhase(from, to);
  return false;
}

export function canUpdateInitiativeStatus(role: UserRole): boolean {
  return isConsultantRole(role);
}
