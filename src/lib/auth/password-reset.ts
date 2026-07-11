import { createHash, randomBytes } from "node:crypto";
import { enqueueCommunication } from "@/lib/communications/queue/service";
import { buildPasswordResetEmailData } from "@/lib/communications/workflows/email-data";
import { buildPublicAppUrl } from "@/lib/communications/links/build-protected-url";
import { recordOrganizationActivity } from "@/lib/communications/activity/record-activity";
import { prisma } from "@/lib/db";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function requestPasswordReset(email: string) {
  const normalized = normalizePurchaserEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  // Always behave as success to avoid account enumeration.
  if (!user || !user.isActive) {
    return { success: true as const };
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = buildPublicAppUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`);
  const payload = buildPasswordResetEmailData({
    resetUrl,
    firstName: user.name.split(" ")[0],
  });

  await enqueueCommunication({
    workflowKey: "password_reset",
    clientId: user.clientId,
    recipientSelection: { additionalEmails: [normalized] },
    payload: { ...payload, email: normalized, name: user.name },
    autoSend: true,
  });

  if (user.clientId) {
    await recordOrganizationActivity({
      clientId: user.clientId,
      userId: user.id,
      category: "ACCOUNT",
      eventType: "password_reset_requested",
      title: "Password reset requested",
      description: `Password reset requested for ${normalized}.`,
      visibility: "INTERNAL",
    });
  }

  return { success: true as const };
}

export async function confirmPasswordReset(input: { token: string; password: string }) {
  const tokenHash = hashToken(input.token);
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!record) {
    throw new Error("Invalid or expired reset link");
  }

  const { hashPassword } = await import("@/lib/users/password");
  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  if (record.user.clientId) {
    await recordOrganizationActivity({
      clientId: record.user.clientId,
      userId: record.user.id,
      category: "ACCOUNT",
      eventType: "password_reset_completed",
      title: "Password reset completed",
      description: `${record.user.email} reset their password.`,
      visibility: "INTERNAL",
    });
  }

  return { success: true as const };
}
