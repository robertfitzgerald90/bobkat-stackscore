import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/api/helpers";
import { forbidden, notFound } from "@/lib/api/helpers";
import { NextResponse } from "next/server";

export type SessionUserWithClient = SessionUser & {
  clientId: string | null;
};

export async function getSessionUserWithClient(): Promise<SessionUserWithClient | null> {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id || !session.user.email || !session.user.role) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, clientId: true, isActive: true },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    clientId: user.clientId,
  };
}

export function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "technician";
}

export async function requireAssessmentAccess(
  user: SessionUserWithClient,
  assessmentId: string,
): Promise<
  | { assessment: { id: string; clientId: string; status: string } }
  | { response: NextResponse }
> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { id: true, clientId: true, status: true },
  });

  if (!assessment) {
    return { response: notFound("Assessment not found") };
  }

  if (isStaffRole(user.role)) {
    return { assessment };
  }

  if (user.role === "client" && user.clientId === assessment.clientId) {
    return { assessment };
  }

  return { response: forbidden() };
}

export async function requireClientWorkspaceAccess(
  user: SessionUserWithClient,
  clientId: string,
): Promise<NextResponse | null> {
  if (isStaffRole(user.role)) return null;
  if (user.role === "client" && user.clientId === clientId) return null;
  return forbidden();
}
