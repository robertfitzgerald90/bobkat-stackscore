import { prisma } from "@/lib/db";
import { buildContactName } from "@/lib/technology-snapshot/contact-helpers";
import {
  SNAPSHOT_CATALOG_VERSION_V1,
  SNAPSHOT_CATALOG_VERSION_V2,
} from "./catalog-v2";
import { buildSnapshotFindingsV2, type SnapshotAnswersV2 } from "./engine";
import type { CreateSnapshotLeadInput, CreateSnapshotLeadV2Input } from "./schemas";
import { buildSnapshotResult } from "./scoring";
import type { SnapshotAnswers } from "./types";

export {
  addTechnologySnapshotLeadNote,
  buildSnapshotLeadDetailPayload,
  convertSnapshotLeadToClient,
  deleteTechnologySnapshotLeadPermanently,
  getSnapshotLeadDeletionBlockReason,
  getSnapshotLeadInvitationState,
  getTechnologySnapshotLeadById,
  getTechnologySnapshotLeadSummaryStats,
  listTechnologySnapshotLeadsForAdmin,
  previewSnapshotLeadConversion,
  sendSnapshotLeadAssessmentInvitation,
  SNAPSHOT_LEAD_CONVERTED_DELETE_BLOCKED_MESSAGE,
  updateTechnologySnapshotLeadStatus,
} from "./lead-admin";

export type { SnapshotLeadDeletionResult } from "./lead-admin";

export type { SnapshotLeadDeletionBlockInput } from "./lead-deletion";

const NOT_PROVIDED = "Not provided";

/** Legacy snap-1.0 lead create (contact-first). */
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
      catalogVersion: SNAPSHOT_CATALOG_VERSION_V1,
      findingsJson: undefined,
      categoryScores: undefined,
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

/**
 * Snapshot 2.0 contact capture after anonymous results.
 * Always recomputes findings server-side from submitted answers.
 */
export async function createTechnologySnapshotLeadV2(input: CreateSnapshotLeadV2Input) {
  const answers = input.answers as SnapshotAnswersV2;
  const findings = buildSnapshotFindingsV2(answers);

  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim() || "";
  const contactName = buildContactName(firstName, lastName);
  const companyName = input.companyName?.trim() || NOT_PROVIDED;
  const industry = input.industry?.trim() || NOT_PROVIDED;

  const categoryScores = findings.categories.map((c) => ({
    id: c.id,
    name: c.name,
    points: c.points,
    max: c.max,
    percent: c.percent,
    band: c.band,
  }));

  const lowestPillars = findings.keyFindings.opportunities.map((opp) => ({
    code: opp.questionId,
    name: opp.title,
    score: opp.points,
    answer: opp.answer,
  }));

  const lead = await prisma.technologySnapshotLead.create({
    data: {
      contactName,
      firstName,
      lastName: lastName || null,
      companyName,
      email: input.email.toLowerCase(),
      phone: input.phone?.trim() || null,
      industry,
      companySize: input.companySize?.trim() || null,
      itManagementModel: input.itManagementModel ?? "unsure",
      answers,
      totalScore: findings.overall.points,
      classification: findings.overall.band,
      lowestPillars,
      catalogVersion: SNAPSHOT_CATALOG_VERSION_V2,
      findingsJson: findings,
      categoryScores,
      status: "new",
      prospectId: input.prospectId ?? null,
      campaignId: input.campaignId ?? null,
      sourcePath: input.sourcePath?.trim() || "/technology-snapshot",
      contactConsentAt: new Date(),
      marketingConsentAt: input.marketingConsent ? new Date() : null,
    },
  });

  if (input.prospectId) {
    await prisma.prospect.updateMany({
      where: { id: input.prospectId },
      data: { lastContactAt: new Date() },
    });
  }

  return { lead, findings };
}

export async function listTechnologySnapshotLeads() {
  const { listTechnologySnapshotLeadsForAdmin } = await import("./lead-admin");
  return listTechnologySnapshotLeadsForAdmin();
}
