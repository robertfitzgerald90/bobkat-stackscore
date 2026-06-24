import { prisma } from "@/lib/db";
import type { UserRole } from "@/generated/prisma/client";

export async function countActiveAdmins(excludeUserId?: string): Promise<number> {
  return prisma.user.count({
    where: {
      role: "admin",
      isActive: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function validateUserMutation(
  targetUserId: string,
  actorUserId: string,
  data: { role?: UserRole; isActive?: boolean },
): Promise<string | null> {
  if (targetUserId !== actorUserId) return null;

  if (data.isActive === false) {
    return "You cannot deactivate your own account";
  }

  if (data.role && data.role !== "admin") {
    const otherAdmins = await countActiveAdmins(actorUserId);
    if (otherAdmins === 0) {
      return "You cannot change your role while you are the only active admin";
    }
  }

  return null;
}

export async function validateDeactivateAdmin(
  targetUserId: string,
  data: { isActive?: boolean; role?: UserRole },
): Promise<string | null> {
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return "User not found";

  const isCurrentlyAdmin = target.role === "admin" && target.isActive;
  const removingAdminRole = data.role !== undefined && data.role !== "admin";
  const deactivating = data.isActive === false;

  if (isCurrentlyAdmin && (deactivating || removingAdminRole)) {
    const otherAdmins = await countActiveAdmins(targetUserId);
    if (otherAdmins === 0) {
      return "At least one active admin is required";
    }
  }

  return null;
}
