import type { UserRole } from "@/generated/prisma/client";

/** Default post-login landing route per role (DOC-160). */
export function getDefaultLandingPath(role: UserRole | string): string {
  if (role === "admin") return "/portfolio";
  return "/dashboard";
}

/** Roles that can access the Portfolio module. */
export function canAccessPortfolio(role: UserRole | string): boolean {
  return role === "admin";
}
