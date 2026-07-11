import bcrypt from "bcryptjs";
import type { PrismaClient } from "@/generated/prisma/client";
import { completeAssessmentV2 } from "@/lib/assessments/complete-v2";
import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";
import { TECHNOLOGY_PILLARS } from "@/lib/technology-maturity/pillars";
import { createDefaultWizardState } from "@/lib/technology-improvement-plan/defaults";
import type { TipWizardState } from "@/lib/technology-improvement-plan/types";
import {
  ACME_DEMO,
  acmeDedupeKey,
  resolveDemoClientEmail,
  resolveDemoClientPassword,
} from "./constants";
import { clearAcmeFoundationDemo } from "./cleanup";
import { ACME_CURATED_RECOMMENDATIONS } from "./recommendations";
import {
  ACME_BASELINE_ANSWER_OVERRIDES,
  ACME_BASELINE_PILLAR_TARGETS,
  ACME_CURRENT_ANSWER_OVERRIDES,
  ACME_CURRENT_PILLAR_TARGETS,
  buildAnswerPlan,
} from "./responses";

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function loadQuestionMaps(prisma: PrismaClient) {
  const questions = await prisma.assessmentQuestion.findMany({
    where: { isActive: true },
    include: { category: true, answerOptions: true },
    orderBy: { displayOrder: "asc" },
  });

  const questionsByCode = new Map(questions.map((question) => [question.code, question]));
  const questionsByPillar = new Map<TechnologyPillarCode, string[]>();

  for (const pillar of TECHNOLOGY_PILLARS) {
    questionsByPillar.set(
      pillar.code,
      questions
        .filter((question) => question.category.code === pillar.code)
        .map((question) => question.code),
    );
  }

  const categoryIdByPillar = new Map<TechnologyPillarCode, string>();
  for (const pillar of TECHNOLOGY_PILLARS) {
    const question = questions.find((row) => row.category.code === pillar.code);
    if (question) categoryIdByPillar.set(pillar.code, question.categoryId);
  }

  return { questionsByCode, questionsByPillar, categoryIdByPillar };
}

async function applyAnswerPlan(
  prisma: PrismaClient,
  assessmentId: string,
  answerPlan: Map<string, "Yes" | "Partially" | "No">,
  questionsByCode: Awaited<ReturnType<typeof loadQuestionMaps>>["questionsByCode"],
) {
  for (const [questionCode, answerText] of answerPlan.entries()) {
    const question = questionsByCode.get(questionCode);
    if (!question) continue;

    const option = question.answerOptions.find((row) => row.answerText === answerText);
    if (!option) continue;

    await prisma.assessmentResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId: question.id,
        },
      },
      create: {
        assessmentId,
        questionId: question.id,
        selectedAnswerOptionId: option.id,
        scoreEarned: option.scoreValue,
      },
      update: {
        selectedAnswerOptionId: option.id,
        scoreEarned: option.scoreValue,
      },
    });
  }
}

async function backdateAssessment(
  prisma: PrismaClient,
  assessmentId: string,
  completedAt: Date,
) {
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      assessmentDate: completedAt,
      completedAt,
    },
  });

  await prisma.clientScoreHistory.updateMany({
    where: { assessmentId },
    data: { recordedDate: completedAt },
  });
}

async function seedCuratedRecommendations(input: {
  prisma: PrismaClient;
  clientId: string;
  assessmentId: string;
  adminUserId: string;
  categoryIdByPillar: Map<TechnologyPillarCode, string>;
}) {
  await input.prisma.assessmentRecommendation.deleteMany({
    where: { clientId: input.clientId },
  });

  const records: Array<{ id: string; key: string }> = [];

  for (const spec of ACME_CURATED_RECOMMENDATIONS) {
    const categoryId = input.categoryIdByPillar.get(spec.pillarCode);
    if (!categoryId) continue;

    const description = `${spec.description}\n\nRecommended next action: ${spec.nextAction}\nEstimated effort: ${spec.effort}`;

    const record = await input.prisma.assessmentRecommendation.create({
      data: {
        assessmentId: input.assessmentId,
        clientId: input.clientId,
        categoryId,
        dedupeKey: acmeDedupeKey(spec.key),
        latestAssessmentId: input.assessmentId,
        latestTriggerReason: "Acme Foundation demo seed",
        title: spec.title,
        description,
        businessImpact: spec.businessImpact,
        suggestedService: spec.suggestedService,
        priority: spec.priority,
        status: spec.status,
        estimatedImpactPoints: spec.estimatedImpactPoints,
        createdByUserId: input.adminUserId,
        completedAt: spec.status === "completed" ? addDays(new Date(), -14) : null,
      },
    });

    await input.prisma.recommendationAssessmentTrigger.create({
      data: {
        recommendationId: record.id,
        assessmentId: input.assessmentId,
        triggerReason: "Demo seed curation",
      },
    });

    records.push({ id: record.id, key: spec.key });
  }

  return new Map(records.map((row) => [row.key, row.id]));
}

async function seedProjects(input: {
  prisma: PrismaClient;
  clientId: string;
  technicianId: string;
  categoryIdByPillar: Map<TechnologyPillarCode, string>;
  recommendationIds: Map<string, string>;
}) {
  const endpointRecId = input.recommendationIds.get("endpoint-management");
  const backupRecId = input.recommendationIds.get("backup-recovery");
  const adminControlsRecId = input.recommendationIds.get("admin-account-controls");

  if (adminControlsRecId) {
    await input.prisma.project.create({
      data: {
        id: ACME_DEMO.projectM365Id,
        clientId: input.clientId,
        recommendationId: adminControlsRecId,
        assignedUserId: input.technicianId,
        title: "Microsoft 365 Security Baseline",
        description: [
          "Scope: Microsoft 365 tenant security review, MFA enforcement, and baseline conditional access policies for Acme Foundation staff and volunteers.",
          "Objectives: Reduce account takeover risk, standardize authentication, and improve visibility into admin roles.",
          "Milestones: Tenant review completed · MFA rollout completed · Admin role review completed · Security defaults documented",
          "Completion notes: Baseline policies deployed with executive approval. Remaining exceptions documented for shared event kiosk account.",
          "Business outcomes: Improved security posture for donor communications and cloud file sharing without disrupting daily program work.",
        ].join("\n\n"),
        status: "completed",
        priority: "high",
        categoryId: input.categoryIdByPillar.get("productivity_collaboration")!,
        estimatedImpactPoints: 10,
        actualImpactPoints: 9,
        startDate: addMonths(new Date(), -4),
        targetCompletionDate: addMonths(new Date(), -2),
        completedAt: addMonths(new Date(), -2),
      },
    });
  }

  if (endpointRecId) {
    await input.prisma.project.create({
      data: {
        id: ACME_DEMO.projectEndpointId,
        clientId: input.clientId,
        recommendationId: endpointRecId,
        assignedUserId: input.technicianId,
        title: "Endpoint Management Deployment",
        description: [
          "Scope: Deploy centralized endpoint management across Houston office workstations and shared devices.",
          "Progress: Approximately 60% complete.",
          "Milestones: Discovery completed · Policies designed · Pilot devices deployed · Full rollout pending · Reporting pending",
          "Objectives: Provide patch visibility, device inventory, and remote support readiness for a 18-person nonprofit team.",
          "Expected business benefit: Fewer unmanaged endpoints and faster remediation when vulnerabilities are announced.",
        ].join("\n\n"),
        status: "in_progress",
        priority: "critical",
        categoryId: input.categoryIdByPillar.get("endpoint_management")!,
        estimatedImpactPoints: 12,
        startDate: addMonths(new Date(), -1),
        targetCompletionDate: addMonths(new Date(), 2),
      },
    });
  }

  if (backupRecId) {
    await input.prisma.project.create({
      data: {
        id: ACME_DEMO.projectBackupId,
        clientId: input.clientId,
        recommendationId: backupRecId,
        assignedUserId: input.technicianId,
        title: "Backup and Recovery Standardization",
        description: [
          "Scope: Standardize backup coverage for Microsoft 365, shared file storage, and critical operational systems.",
          "Expected timeline: Kickoff planned next month with completion targeted within 90 days.",
          "Expected business benefit: Reliable recovery for donor records, grant files, and program documentation.",
          "Related recommendations: Establish managed backup and recovery.",
        ].join("\n\n"),
        status: "approved",
        priority: "critical",
        categoryId: input.categoryIdByPillar.get("data_protection_recovery")!,
        estimatedImpactPoints: 11,
        targetCompletionDate: addMonths(new Date(), 3),
      },
    });
  }
}

async function seedImprovementPlan(input: {
  prisma: PrismaClient;
  clientId: string;
  assessmentId: string;
  adminUserId: string;
  recommendationIds: Map<string, string>;
}) {
  const seeds = ACME_CURATED_RECOMMENDATIONS.map((spec) => ({
    id: input.recommendationIds.get(spec.key)!,
    priority: spec.priority,
    estimatedImpactPoints: spec.estimatedImpactPoints,
    suggestedService: spec.suggestedService,
  })).filter((seed) => Boolean(seed.id));

  const baseState = createDefaultWizardState(seeds);
  const rec = (key: string) => input.recommendationIds.get(key)!;

  const wizardState: TipWizardState = {
    ...baseState,
    executiveSummary:
      "Acme Foundation is making measurable progress across identity, collaboration, and network fundamentals. The 2026 improvement plan prioritizes endpoint management, backup reliability, and operational visibility while sequencing governance improvements for the next 18 months.",
    globalExecutiveNotes:
      "Published for client review. Internal pricing and margin details remain consultant-only inside StackScore.",
    roadmapPhases: [
      {
        id: "phase-stabilize",
        label: "Phase 1 — Stabilize and Protect (0–90 days)",
        sortOrder: 0,
        recommendationIds: [
          rec("endpoint-management"),
          rec("patch-management"),
          rec("backup-recovery"),
          rec("admin-account-controls"),
          rec("infrastructure-monitoring"),
        ],
      },
      {
        id: "phase-govern",
        label: "Phase 2 — Improve Visibility and Governance (3–6 months)",
        sortOrder: 1,
        recommendationIds: [
          rec("technology-documentation"),
          rec("quarterly-reviews"),
          rec("incident-response"),
          rec("wireless-segmentation"),
          rec("admin-account-controls"),
        ],
      },
      {
        id: "phase-modernize",
        label: "Phase 3 — Optimize and Modernize (6–18 months)",
        sortOrder: 2,
        recommendationIds: [
          rec("vendor-lifecycle"),
          rec("technology-roadmap"),
          rec("backup-recovery"),
          rec("endpoint-management"),
          rec("quarterly-reviews"),
        ],
      },
    ],
    frozenAt: new Date().toISOString(),
  };

  await input.prisma.technologyImprovementPlan.create({
    data: {
      id: ACME_DEMO.tipId,
      clientId: input.clientId,
      assessmentId: input.assessmentId,
      status: "generated",
      currentStep: "complete",
      version: 1,
      title: "Acme Foundation 2026 Technology Improvement Plan",
      wizardState,
      executiveSummary: wizardState.executiveSummary,
      generatedAt: addDays(new Date(), -7),
      createdByUserId: input.adminUserId,
    },
  });
}

async function seedActivityTimeline(input: {
  prisma: PrismaClient;
  clientId: string;
  clientUserId: string;
  adminUserId: string;
  baselineAssessmentId: string;
  currentAssessmentId: string;
}) {
  const now = new Date();
  const events = [
    {
      occurredAt: addMonths(now, -8),
      category: "ACCOUNT" as const,
      eventType: "account_created",
      title: "Acme Foundation account created",
      description: "Demo nonprofit client workspace provisioned for technology review.",
    },
    {
      occurredAt: addMonths(now, -7),
      category: "ACCOUNT" as const,
      eventType: "account_activated",
      title: "Client portal activated",
      description: "Sarah Mitchell completed account activation.",
      userId: input.clientUserId,
    },
    {
      occurredAt: addMonths(now, -6),
      category: "ASSESSMENT" as const,
      eventType: "assessment_completed",
      title: "Baseline assessment completed",
      description: "Acme Foundation Baseline Assessment finalized.",
      sourceRecordId: input.baselineAssessmentId,
    },
    {
      occurredAt: addMonths(now, -5),
      category: "PROJECT" as const,
      eventType: "recommendation_accepted",
      title: "Technology roadmap approved",
      description: "Executive team accepted the strategic roadmap recommendation.",
    },
    {
      occurredAt: addMonths(now, -4),
      category: "PROJECT" as const,
      eventType: "project_created",
      title: "Microsoft 365 Security Baseline project started",
      description: "Security baseline implementation kicked off.",
      sourceRecordId: ACME_DEMO.projectM365Id,
    },
    {
      occurredAt: addMonths(now, -2),
      category: "PROJECT" as const,
      eventType: "project_completed",
      title: "Microsoft 365 Security Baseline completed",
      description: "MFA and admin controls baseline delivered.",
      sourceRecordId: ACME_DEMO.projectM365Id,
    },
    {
      occurredAt: addDays(now, -21),
      category: "ASSESSMENT" as const,
      eventType: "assessment_completed",
      title: "Current assessment completed",
      description: "Acme Foundation Technology Maturity Assessment finalized.",
      sourceRecordId: input.currentAssessmentId,
    },
    {
      occurredAt: addDays(now, -14),
      category: "ROADMAP" as const,
      eventType: "roadmap_published",
      title: "Technology improvement roadmap published",
      description: "Acme Foundation 2026 Technology Improvement Plan published for client review.",
      sourceRecordId: ACME_DEMO.tipId,
    },
    {
      occurredAt: addDays(now, -3),
      category: "PROJECT" as const,
      eventType: "project_updated",
      title: "Endpoint Management Deployment updated",
      description: "Pilot deployment expanded to additional shared workstations.",
      sourceRecordId: ACME_DEMO.projectEndpointId,
    },
  ];

  for (const event of events) {
    await input.prisma.organizationActivityEvent.create({
      data: {
        clientId: input.clientId,
        userId: event.userId ?? null,
        category: event.category,
        eventType: event.eventType,
        title: event.title,
        description: event.description,
        occurredAt: event.occurredAt,
        source: "DEMO_SEED",
        sourceRecordType: event.sourceRecordId ? "demo" : null,
        sourceRecordId: event.sourceRecordId ?? null,
        visibility: "CLIENT_VISIBLE",
        actorUserId: input.adminUserId,
        metadataJson: { demoSeed: true, marker: ACME_DEMO.notesMarker },
      },
    });
  }
}

async function seedCommunicationRecords(input: {
  prisma: PrismaClient;
  clientId: string;
  clientUserId: string;
  adminUserId: string;
  demoEmail: string;
  currentAssessmentId: string;
}) {
  const now = new Date();
  const messages = [
    {
      templateKey: "account-activation",
      subject: "Welcome to StackScore — Activate your Acme Foundation account",
      sentAt: addMonths(now, -7),
    },
    {
      templateKey: "assessment-completed",
      subject: "Your Technology Maturity Assessment is complete",
      sentAt: addDays(now, -21),
      assessmentId: input.currentAssessmentId,
    },
    {
      templateKey: "roadmap-ready",
      subject: "Your Technology Improvement Roadmap is ready",
      sentAt: addDays(now, -14),
    },
    {
      templateKey: "project-created",
      subject: "New project started: Endpoint Management Deployment",
      sentAt: addMonths(now, -1),
      projectId: ACME_DEMO.projectEndpointId,
    },
  ];

  for (const message of messages) {
    await input.prisma.communicationMessage.create({
      data: {
        templateKey: message.templateKey,
        subject: message.subject,
        recipientEmail: input.demoEmail,
        recipientName: ACME_DEMO.primaryContactName,
        senderEmail: "onboarding@bobkatit.com",
        clientId: input.clientId,
        userId: input.clientUserId,
        assessmentId: message.assessmentId ?? null,
        projectId: message.projectId ?? null,
        status: "DELIVERED",
        sentAt: message.sentAt,
        deliveredAt: message.sentAt,
        isTest: true,
        createdByUserId: input.adminUserId,
        metadataJson: {
          demoSeed: true,
          marker: ACME_DEMO.notesMarker,
          note: "Seeded application record — not a live provider delivery event.",
        },
      },
    });
  }
}

async function seedClientTechnologies(input: { prisma: PrismaClient; clientId: string }) {
  const slugs = ["ubiquiti-unifi", "ninjaone", "uptime-kuma"];
  const technologies = await input.prisma.technology.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, name: true },
  });

  for (const technology of technologies) {
    await input.prisma.clientTechnology.create({
      data: {
        clientId: input.clientId,
        technologyId: technology.id,
        displayName: technology.name,
        businessPurpose:
          technology.slug === "ubiquiti-unifi"
            ? "Office network, guest Wi-Fi, and Houston satellite location connectivity."
            : technology.slug === "ninjaone"
              ? "Planned centralized endpoint management platform."
              : "Basic infrastructure availability monitoring for gateways and critical services.",
        deploymentStatus: technology.slug === "ninjaone" ? "planned" : "active",
        alignmentStatus: technology.slug === "ninjaone" ? "not_standard" : "approved",
        healthStatus: technology.slug === "ninjaone" ? "at_risk" : "healthy",
        lifecycleStatus: "current",
        managedBy: "bobkat_it",
        quantity: technology.slug === "ubiquiti-unifi" ? 2 : 18,
        quantityUnit: technology.slug === "ubiquiti-unifi" ? "sites" : "devices",
        ownerName: ACME_DEMO.primaryContactName,
        technicalOwnerName: "BobKat IT",
      },
    });
  }
}

export async function seedAcmeFoundationDemo(prisma: PrismaClient): Promise<{
  clientId: string;
  demoEmail: string;
  baselineAssessmentId: string;
  currentAssessmentId: string;
}> {
  await clearAcmeFoundationDemo(prisma);

  const demoEmail = resolveDemoClientEmail().toLowerCase();
  const demoPassword = resolveDemoClientPassword();
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const admin = await prisma.user.findUnique({
    where: { email: "admin@bobkatit.com" },
    select: { id: true },
  });
  const technician = await prisma.user.findUnique({
    where: { email: "technician@bobkatit.com" },
    select: { id: true },
  });

  if (!admin || !technician) {
    throw new Error(
      "Admin and technician users must exist. Run npm run db:seed before seed:demo-client.",
    );
  }

  const { questionsByCode, questionsByPillar, categoryIdByPillar } = await loadQuestionMaps(prisma);

  const client = await prisma.client.create({
    data: {
      id: ACME_DEMO.clientId,
      companyName: ACME_DEMO.companyName,
      primaryContactName: ACME_DEMO.primaryContactName,
      primaryContactEmail: demoEmail,
      primaryContactPhone: "(713) 555-0148",
      primaryContactTitle: ACME_DEMO.primaryContactTitle,
      industry: ACME_DEMO.industry,
      employeeCount: 18,
      numberOfLocations: 2,
      deviceCount: 22,
      primaryBusinessGoal: "improve_cybersecurity",
      highestTechnologyPriority: "Protect donor data and stabilize day-to-day operations",
      technologyVision:
        "Acme Foundation is a growing nonprofit organization that relies heavily on Microsoft 365, cloud collaboration, donor information, shared workstations, and a small office network. Its technology environment is functional but lacks consistent management, monitoring, documentation, and lifecycle planning.",
      itSupportModel: "msp",
      environmentType: "hybrid",
      locationCity: ACME_DEMO.locationCity,
      locationState: ACME_DEMO.locationState,
      status: "active",
      notes: `${ACME_DEMO.notesMarker} — Development-only demo client for customer portal review.`,
      technologyProfile: { create: {} },
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      id: ACME_DEMO.clientUserId,
      name: ACME_DEMO.primaryContactName,
      email: demoEmail,
      passwordHash,
      role: "client",
      clientId: client.id,
      isActive: true,
      invitedAt: addMonths(new Date(), -8),
      onboardingCompletedAt: addMonths(new Date(), -7),
    },
  });

  const baselineCompletedAt = addMonths(new Date(), -6);
  const baselinePlan = buildAnswerPlan({
    pillarTargets: ACME_BASELINE_PILLAR_TARGETS,
    questionsByPillar,
    overrides: ACME_BASELINE_ANSWER_OVERRIDES,
  });

  await prisma.assessment.create({
    data: {
      id: ACME_DEMO.baselineAssessmentId,
      clientId: client.id,
      assessorUserId: technician.id,
      assessmentName: "Acme Foundation Baseline Assessment",
      assessmentType: "initial",
      assessmentDate: baselineCompletedAt,
      status: "draft",
      scoringEngineVersion: "v2",
    },
  });

  await applyAnswerPlan(prisma, ACME_DEMO.baselineAssessmentId, baselinePlan, questionsByCode);
  await completeAssessmentV2(ACME_DEMO.baselineAssessmentId, admin.id);
  await backdateAssessment(prisma, ACME_DEMO.baselineAssessmentId, baselineCompletedAt);

  const currentCompletedAt = addDays(new Date(), -21);
  const currentPlan = buildAnswerPlan({
    pillarTargets: ACME_CURRENT_PILLAR_TARGETS,
    questionsByPillar,
    overrides: ACME_CURRENT_ANSWER_OVERRIDES,
  });

  await prisma.assessment.create({
    data: {
      id: ACME_DEMO.currentAssessmentId,
      clientId: client.id,
      assessorUserId: technician.id,
      assessmentName: "Acme Foundation Technology Maturity Assessment",
      assessmentType: "annual",
      assessmentDate: currentCompletedAt,
      status: "draft",
      scoringEngineVersion: "v2",
      sourceAssessmentId: ACME_DEMO.baselineAssessmentId,
    },
  });

  await applyAnswerPlan(prisma, ACME_DEMO.currentAssessmentId, currentPlan, questionsByCode);
  await completeAssessmentV2(ACME_DEMO.currentAssessmentId, admin.id);
  await backdateAssessment(prisma, ACME_DEMO.currentAssessmentId, currentCompletedAt);

  const recommendationIds = await seedCuratedRecommendations({
    prisma,
    clientId: client.id,
    assessmentId: ACME_DEMO.currentAssessmentId,
    adminUserId: admin.id,
    categoryIdByPillar,
  });

  await seedProjects({
    prisma,
    clientId: client.id,
    technicianId: technician.id,
    categoryIdByPillar,
    recommendationIds,
  });

  await seedImprovementPlan({
    prisma,
    clientId: client.id,
    assessmentId: ACME_DEMO.currentAssessmentId,
    adminUserId: admin.id,
    recommendationIds,
  });

  await seedActivityTimeline({
    prisma,
    clientId: client.id,
    clientUserId: clientUser.id,
    adminUserId: admin.id,
    baselineAssessmentId: ACME_DEMO.baselineAssessmentId,
    currentAssessmentId: ACME_DEMO.currentAssessmentId,
  });

  await seedCommunicationRecords({
    prisma,
    clientId: client.id,
    clientUserId: clientUser.id,
    adminUserId: admin.id,
    demoEmail,
    currentAssessmentId: ACME_DEMO.currentAssessmentId,
  });

  await seedClientTechnologies({ prisma, clientId: client.id });

  await prisma.technologyProfile.update({
    where: { clientId: client.id },
    data: {
      currentAssessmentId: ACME_DEMO.currentAssessmentId,
      lastAssessedAt: currentCompletedAt,
      nextRecommendedAssessmentAt: addMonths(currentCompletedAt, 6),
      trendDirection: "improving",
    },
  });

  return {
    clientId: client.id,
    demoEmail,
    baselineAssessmentId: ACME_DEMO.baselineAssessmentId,
    currentAssessmentId: ACME_DEMO.currentAssessmentId,
  };
}
