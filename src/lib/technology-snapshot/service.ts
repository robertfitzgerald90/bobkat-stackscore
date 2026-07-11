import type { TechnologySnapshotLeadStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { CreateSnapshotLeadInput } from "./schemas";
import { buildSnapshotResult } from "./scoring";
import type { SnapshotAnswers } from "./types";

export async function createTechnologySnapshotLead(input: CreateSnapshotLeadInput) {
  const answers = input.answers as SnapshotAnswers;
  const result = buildSnapshotResult(answers);

  const lead = await prisma.technologySnapshotLead.create({
    data: {
      contactName: input.contactName,
      companyName: input.companyName,
      email: input.email.toLowerCase(),
      phone: input.phone?.trim() || null,
      industry: input.industry,
      companySize: input.companySize?.trim() || null,
      itManagementModel: input.itManagementModel,
      answers,
      totalScore: result.totalScore,
      classification: result.classification,
      lowestPillars: result.lowestPillars,
      status: "new",
      prospectId: input.prospectId ?? null,
    },
  });

  if (input.prospectId) {
    await prisma.prospect.updateMany({
      where: { id: input.prospectId },
      data: { lastContactAt: new Date() },
    });
  }

  return {
    lead,
    result,
  };
}

export async function listTechnologySnapshotLeads() {
  return prisma.technologySnapshotLead.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTechnologySnapshotLeadStatus(
  id: string,
  status: TechnologySnapshotLeadStatus,
) {
  return prisma.technologySnapshotLead.update({
    where: { id },
    data: { status },
  });
}
