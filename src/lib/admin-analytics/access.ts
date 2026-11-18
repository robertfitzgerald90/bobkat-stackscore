export function canViewAdminAnalytics(role: string | null | undefined): boolean {
  return role === "admin";
}
