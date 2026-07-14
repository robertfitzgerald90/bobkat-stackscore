import { prisma } from "@/lib/db";
import { buildContactName } from "@/lib/technology-snapshot/contact-helpers";
import type { CreateSnapshotLeadInput } from "./schemas";
import { buildSnapshotResult } from "./scoring";
import type { SnapshotAnswers } from "./types";

export {
  addTechnologySnapshotLeadNote,
  buildSnapshotLeadDetailPayload,
  convertSnapshotLeadToClient,
  getSnapshotLeadInvitationState,
  getTechnologySnapshotLeadById,
  getTechnologySnapshotLeadSummaryStats,
  listTechnologySnapshotLeadsForAdmin,
  previewSnapshotLeadConversion,
  sendSnapshotLeadAssessmentInvitation,
  updateTechnologySnapshotLeadStatus,
} from "./lead-admin";

export async function createTechnologySnapshotLead(input: CreateSnapshotLeadInput) {
  const answers = input.answers as SnapshotAnswers;
  const result = buildSnapshotResult(answers);

  const firstName = input.firstName?.trim() || input.contactName?.trim().split(/\s+/)[0] || "";
  const lastName =
    input.lastName?.trim() ||
    (input.contactName?.trim().split(/\s+/).slice(1).join(" ") ?? "");
  const contactName =
    input.contactName?.trim() || buildContactName(firstName, lastName);

  const lead = await prisma.technologySnapshotLead.create({
    data: {
      contactName,
      firstName: firstName || null,
      lastName: lastName || null,
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
      contactConsentAt: input.contactConsent ? new Date() : null,
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
  const { listTechnologySnapshotLeadsForAdmin } = await import("./lead-admin");
  return listTechnologySnapshotLeadsForAdmin();
}
