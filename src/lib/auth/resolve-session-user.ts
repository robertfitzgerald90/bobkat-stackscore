import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/api/helpers";

export type ResolvedSessionUser = SessionUser & {
  clientId: string | null;
};

/**
 * Resolves the current user from the database using the session email.
 * JWT user ids can become stale after a database reset; email is the stable key.
 */
export async function resolveSessionUserFromDb(): Promise<ResolvedSessionUser | null> {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      clientId: true,
      isActive: true,
    },
  });

  if (!user?.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    clientId: user.clientId,
  };
}

export function toSessionUser(user: ResolvedSessionUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
