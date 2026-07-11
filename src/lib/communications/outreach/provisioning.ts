import type { ProspectLeadSource } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  activationTokenExpiresAt,
  createPlaceholderPasswordHash,
  generateActivationToken,
  normalizePurchaserEmail,
} from "@/lib/stripe/fulfillment/helpers";

const ASSESSMENT_NAME = "Technology Assessment";

export type ProvisionInviteWorkspaceInput = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone?: string | null;
  industry?: string | null;
  employeeCount?: number | null;
  notes?: string | null;
  leadSource?: ProspectLeadSource;
  createdByUserId: string;
  existingProspectId?: string | null;
  existingClientId?: string | null;
};

export type ProvisionInviteWorkspaceResult = {
  prospectId: string;
  clientId: string;
  userId: string;
  assessmentId: string;
  activationToken: string;
  isNewProspect: boolean;
};

function buildContactName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export async function provisionInviteWorkspace(
  input: ProvisionInviteWorkspaceInput,
): Promise<ProvisionInviteWorkspaceResult> {
  const email = normalizePurchaserEmail(input.email);
  const contactName = buildContactName(input.firstName, input.lastName);
  const passwordHash = await createPlaceholderPasswordHash();
  const { rawToken, tokenHash } = generateActivationToken();

  return prisma.$transaction(async (tx) => {
    let prospectId = input.existingProspectId ?? null;
    let clientId = input.existingClientId ?? null;
    let userId: string | null = null;
    let assessmentId: string | null = null;
    let isNewProspect = false;

    if (prospectId) {
      const existing = await tx.prospect.findUnique({ where: { id: prospectId } });
      if (!existing) throw new Error("Prospect not found");
      clientId = existing.clientId ?? clientId;
    } else {
      const created = await tx.prospect.create({
        data: {
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          company: input.company.trim(),
          email,
          phone: input.phone?.trim() || null,
          industry: input.industry?.trim() || null,
          employeeCount: input.employeeCount ?? null,
          notes: input.notes?.trim() || null,
          leadSource: input.leadSource ?? "quick_invite",
          status: "new",
          createdByUserId: input.createdByUserId,
        },
      });
      prospectId = created.id;
      isNewProspect = true;
    }

    if (!clientId) {
      const client = await tx.client.create({
        data: {
          companyName: input.company.trim(),
          primaryContactName: contactName,
          primaryContactEmail: email,
          primaryContactPhone: input.phone?.trim() || null,
          industry: input.industry?.trim() || null,
          employeeCount: input.employeeCount ?? null,
          notes: input.notes?.trim() || null,
          status: "prospect",
          technologyProfile: { create: {} },
        },
      });
      clientId = client.id;
      await tx.prospect.update({
        where: { id: prospectId! },
        data: { clientId },
      });
    }

    const existingUser = await tx.user.findUnique({ where: { email } });
    if (existingUser) {
      userId = existingUser.id;
      if (!existingUser.clientId) {
        await tx.user.update({
          where: { id: userId },
          data: { clientId },
        });
      }
    } else {
      const user = await tx.user.create({
        data: {
          name: contactName,
          email,
          passwordHash,
          role: "client",
          isActive: false,
          invitedAt: new Date(),
          clientId,
        },
      });
      userId = user.id;
    }

    const existingAssessment = await tx.assessment.findFirst({
      where: { clientId, status: "draft" },
      orderBy: { createdAt: "desc" },
    });

    if (existingAssessment) {
      assessmentId = existingAssessment.id;
    } else {
      const assessment = await tx.assessment.create({
        data: {
          clientId,
          assessorUserId: userId,
          assessmentName: ASSESSMENT_NAME,
          assessmentType: "initial",
          assessmentDate: new Date(),
          status: "draft",
          scoringEngineVersion: "v2",
        },
      });
      assessmentId = assessment.id;
    }

    const existingToken = await tx.accountActivationToken.findFirst({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    let activationToken = rawToken;
    if (!existingToken) {
      await tx.accountActivationToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt: activationTokenExpiresAt(),
        },
      });
    } else if (input.existingClientId || input.existingProspectId) {
      await tx.accountActivationToken.create({
        data: {
          userId,
          tokenHash,
          expiresAt: activationTokenExpiresAt(),
        },
      });
    } else {
      activationToken = rawToken;
    }

    return {
      prospectId: prospectId!,
      clientId,
      userId,
      assessmentId,
      activationToken,
      isNewProspect,
    };
  });
}
