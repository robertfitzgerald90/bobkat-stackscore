import type { ProfileBusinessSnapshot } from "@/lib/technology-profile/types";

export function isBusinessSnapshotSparse(snapshot: ProfileBusinessSnapshot): boolean {
  return (
    !snapshot.industry &&
    snapshot.employeeCount === null &&
    snapshot.numberOfLocations === null &&
    !snapshot.primaryBusinessGoal &&
    !snapshot.technologyVision &&
    (!snapshot.itSupportModel || snapshot.itSupportModelLabel === "—") &&
    (!snapshot.environmentType || snapshot.environmentTypeLabel === "—") &&
    (!snapshot.complianceFramework || snapshot.complianceFrameworkLabel === "—")
  );
}

export function hasAnyCategoryScore(
  insights: Array<{ percentScore: number | null }>,
): boolean {
  return insights.some((insight) => insight.percentScore !== null);
}
