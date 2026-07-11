import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

const activateSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(10, "Password must be at least 10 characters"),
  name: z.string().trim().min(1).max(120).optional(),
});

function hashActivationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function activateAccount(input: z.infer<typeof activateSchema>) {
  const parsed = activateSchema.parse(input);
  const tokenHash = hashActivationToken(parsed.token);

  const activationToken = await prisma.accountActivationToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          clientId: true,
        },
      },
    },
  });

  if (!activationToken) {
    return { ok: false as const, error: "Invalid or expired activation link" };
  }

  if (activationToken.usedAt) {
    return { ok: false as const, error: "This activation link has already been used" };
  }

  if (activationToken.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: "This activation link has expired" };
  }

  if (activationToken.user.role !== "client") {
    return { ok: false as const, error: "This activation link is not valid for client access" };
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: activationToken.userId },
      data: {
        passwordHash,
        isActive: true,
        ...(parsed.name ? { name: parsed.name } : {}),
      },
    }),
    prisma.accountActivationToken.update({
      where: { id: activationToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  if (activationToken.user.clientId) {
    const { recordAccountActivatedActivity } = await import(
      "@/lib/communications/activity/record-activity"
    );
    await recordAccountActivatedActivity({
      clientId: activationToken.user.clientId,
      userId: activationToken.user.id,
      email: normalizePurchaserEmail(activationToken.user.email),
    });
  }

  return {
    ok: true as const,
    email: normalizePurchaserEmail(activationToken.user.email),
  };
}

export async function validateActivationToken(rawToken: string) {
  const tokenHash = hashActivationToken(rawToken);
  const activationToken = await prisma.accountActivationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { email: true, name: true, isActive: true } } },
  });

  if (!activationToken || activationToken.usedAt) return { valid: false as const };
  if (activationToken.expiresAt.getTime() < Date.now()) return { valid: false as const };

  return {
    valid: true as const,
    email: activationToken.user.email,
    name: activationToken.user.name,
    alreadyActive: activationToken.user.isActive,
  };
}
