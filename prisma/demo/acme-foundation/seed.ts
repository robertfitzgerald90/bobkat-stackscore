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
  type AcmeDemoRecKey,
  resolveDemoClientEmail,
  resolveDemoClientPassword,
} from "./constants";
import { clearAcmeFoundationDemo } from "./cleanup";
import { ACME_CURATED_RECOMMENDATIONS } from "./recommendations";
import {
  seedAcmeBilling,
  seedAcmeContacts,
  seedAcmeDocuments,
  seedAcmeNotes,
  seedAcmeQbr,
} from "./billing";
import {
  ACME_BASELINE_ANSWER_OVERRIDES,
  ACME_BASELINE_PILLAR_TARGETS,
  ACME_CURRENT_ANSWER_OVERRIDES,
  ACME_CURRENT_PILLAR_TARGETS,
  buildAnswerPlan,
} from "./responses";
import { getPinnacleSeedTechnologyBudgets } from "@/lib/demo-data/demo-financial-profile";

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

const COMPLETED_RECOMMENDATION_DATES: Partial<Record<AcmeDemoRecKey, string>> = {
  "technology-documentation": "2026-03-18",
  "incident-response": "2026-03-25",
  "quarterly-reviews": "2026-04-01",
  "technology-roadmap": "2026-04-08",
  "wireless-segmentation": "2026-05-20",
};

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
        latestTriggerReason: "Pinnacle Engineering demo seed",
        title: spec.title,
        description,
        businessImpact: spec.businessImpact,
        suggestedService: spec.suggestedService,
        priority: spec.priority,
        status: spec.status,
        estimatedImpactPoints: spec.estimatedImpactPoints,
        createdByUserId: input.adminUserId,
        completedAt:
          spec.status === "completed"
            ? new Date(COMPLETED_RECOMMENDATION_DATES[spec.key] ?? "2026-04-01")
            : null,
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
  const m365RecId = input.recommendationIds.get("m365-security-baseline");
  const endpointRecId = input.recommendationIds.get("endpoint-management");
  const backupRecId = input.recommendationIds.get("immutable-backup");
  const networkRecId = input.recommendationIds.get("infrastructure-monitoring");

  if (m365RecId) {
    await input.prisma.project.create({
      data: {
        id: ACME_DEMO.projectM365Id,
        clientId: input.clientId,
        recommendationId: m365RecId,
        assignedUserId: input.technicianId,
        title: "Microsoft 365 Security Baseline",
        description: [
          "Scope: Microsoft 365 Business Premium security review, hybrid Entra ID controls, MFA enforcement, and baseline conditional access policies for Pinnacle Engineering office and field staff.",
          "Objectives: Reduce account takeover risk, standardize authentication, and improve visibility into admin roles across both office locations.",
          "Milestones: Tenant review completed · MFA rollout in progress · Conditional access rollout in progress · Admin role review pending",
          "Progress: Approximately 70% complete.",
          "Business outcomes: Improved security posture for project collaboration, Azure-hosted applications, and client communications.",
        ].join("\n\n"),
        status: "in_progress",
        priority: "critical",
        categoryId: input.categoryIdByPillar.get("productivity_collaboration")!,
        estimatedImpactPoints: 5,
        startDate: new Date("2026-02-03"),
        targetCompletionDate: new Date("2026-08-15"),
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
        title: "Endpoint Management Rollout",
        description: [
          "Scope: Deploy NinjaOne RMM across Dallas headquarters and satellite office workstations, engineering laptops, and shared devices.",
          "Progress: Approximately 55% complete.",
          "Milestones: Discovery completed · Policies designed · Pilot devices deployed · Full rollout pending · Reporting pending",
          "Objectives: Provide patch visibility, device inventory, and remote support readiness for an 84-person engineering team.",
          "Expected business benefit: Fewer unmanaged endpoints and faster remediation when vulnerabilities are announced.",
        ].join("\n\n"),
        status: "in_progress",
        priority: "critical",
        categoryId: input.categoryIdByPillar.get("endpoint_management")!,
        estimatedImpactPoints: 6,
        startDate: new Date("2026-05-12"),
        targetCompletionDate: new Date("2026-09-30"),
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
        title: "Backup & Disaster Recovery Modernization",
        description: [
          "Scope: Modernize Synology and cloud backup coverage for Microsoft 365, project files, and Azure-hosted line-of-business applications with immutable retention.",
          "Expected timeline: Kickoff scheduled for August 2026 with completion targeted within 90 days.",
          "Expected business benefit: Reliable recovery for active project files, structural models, and client records.",
          "Related recommendations: Establish immutable backup strategy.",
        ].join("\n\n"),
        status: "approved",
        priority: "critical",
        categoryId: input.categoryIdByPillar.get("data_protection_recovery")!,
        estimatedImpactPoints: 6,
        targetCompletionDate: new Date("2026-11-15"),
      },
    });
  }

  if (networkRecId) {
    await input.prisma.project.create({
      data: {
        id: ACME_DEMO.projectNetworkId,
        clientId: input.clientId,
        recommendationId: networkRecId,
        assignedUserId: input.technicianId,
        title: "Network Monitoring Deployment",
        description: [
          "Scope: Deploy infrastructure availability monitoring for Ubiquiti UniFi gateways, switches, access points, Synology backup targets, and critical Azure services.",
          "Expected timeline: Scheduled to begin August 2026 following monitoring target approval.",
          "Expected business benefit: Earlier detection of outages affecting project delivery and remote collaboration.",
          "Related recommendations: Deploy infrastructure availability monitoring.",
        ].join("\n\n"),
        status: "scheduled",
        priority: "critical",
        categoryId: input.categoryIdByPillar.get("security_operations")!,
        estimatedImpactPoints: 5,
        startDate: new Date("2026-08-01"),
        targetCompletionDate: new Date("2026-10-15"),
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
      "Pinnacle Engineering is making measurable progress across identity, collaboration, and network fundamentals. The 2026 Technology Improvement Plan prioritizes endpoint management, immutable backup protection, and operational visibility while sequencing governance improvements across both office locations.",
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
          rec("immutable-backup"),
          rec("m365-security-baseline"),
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
          rec("immutable-backup"),
          rec("endpoint-management"),
          rec("quarterly-reviews"),
        ],
      },
    ],
    frozenAt: new Date("2026-04-08T16:00:00.000Z").toISOString(),
  };

  await input.prisma.technologyImprovementPlan.create({
    data: {
      id: ACME_DEMO.tipId,
      clientId: input.clientId,
      assessmentId: input.assessmentId,
      status: "approved",
      currentStep: "complete",
      version: 1,
      title: "Pinnacle Engineering 2026 Technology Improvement Plan",
      wizardState,
      executiveSummary: wizardState.executiveSummary,
      generatedAt: new Date("2026-04-05"),
      publishedAt: new Date("2026-04-06"),
      approvedAt: new Date("2026-04-08"),
      approvedByUserId: input.adminUserId,
      approvedByContactId: ACME_DEMO.billingContactId,
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
  const events = [
    {
      occurredAt: new Date("2025-10-01"),
      category: "ACCOUNT" as const,
      eventType: "account_created",
      title: "Pinnacle Engineering account created",
      description: "Demo client workspace provisioned for technology review.",
    },
    {
      occurredAt: new Date("2025-10-15"),
      category: "ACCOUNT" as const,
      eventType: "account_activated",
      title: "Client portal activated",
      description: "James Whitfield completed account activation.",
      userId: input.clientUserId,
    },
    {
      occurredAt: new Date("2025-11-03"),
      category: "BILLING" as const,
      eventType: "vcio_subscription_created",
      title: "StackScore vCIO subscription activated",
      description: "Monthly vCIO advisory subscription started.",
    },
    {
      occurredAt: new Date("2026-01-12"),
      category: "ASSESSMENT" as const,
      eventType: "assessment_completed",
      title: "Baseline assessment completed",
      description: "Pinnacle Engineering Baseline Assessment finalized.",
      sourceRecordId: input.baselineAssessmentId,
    },
    {
      occurredAt: new Date("2026-02-03"),
      category: "PROJECT" as const,
      eventType: "project_created",
      title: "Microsoft 365 Security Baseline project started",
      description: "Security baseline implementation kicked off.",
      sourceRecordId: ACME_DEMO.projectM365Id,
    },
    {
      occurredAt: new Date("2026-04-08"),
      category: "ROADMAP" as const,
      eventType: "roadmap_published",
      title: "Technology Improvement Plan published",
      description: "Pinnacle Engineering 2026 Technology Improvement Plan published for client review.",
      sourceRecordId: ACME_DEMO.tipId,
    },
    {
      occurredAt: new Date("2026-05-12"),
      category: "PROJECT" as const,
      eventType: "project_created",
      title: "Endpoint Management Rollout started",
      description: "NinjaOne RMM deployment kicked off.",
      sourceRecordId: ACME_DEMO.projectEndpointId,
    },
    {
      occurredAt: new Date("2026-06-05"),
      category: "ROADMAP" as const,
      eventType: "qbr_generated",
      title: "Business Review generated",
      description: "Executive review materials prepared for leadership.",
      sourceRecordId: ACME_DEMO.qbrId,
    },
    {
      occurredAt: new Date("2026-06-21"),
      category: "ASSESSMENT" as const,
      eventType: "assessment_completed",
      title: "Current assessment completed",
      description: "Pinnacle Engineering Technology Maturity Assessment finalized.",
      sourceRecordId: input.currentAssessmentId,
    },
    {
      occurredAt: new Date("2026-07-01"),
      category: "PROJECT" as const,
      eventType: "project_updated",
      title: "Network Monitoring Deployment scheduled",
      description: "Monitoring rollout scheduled for August 2026.",
      sourceRecordId: ACME_DEMO.projectNetworkId,
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
  const messages = [
    {
      templateKey: "account-activation",
      subject: "Welcome to StackScore — Activate your Pinnacle Engineering account",
      sentAt: new Date("2025-10-10"),
    },
    {
      templateKey: "vcio-welcome",
      subject: "Welcome to Bobkat IT Strategic IT Consulting",
      sentAt: new Date("2025-11-04"),
    },
    {
      templateKey: "assessment-completed",
      subject: "Your Technology Maturity Assessment is complete",
      sentAt: new Date("2026-06-22"),
      assessmentId: input.currentAssessmentId,
    },
    {
      templateKey: "roadmap-ready",
      subject: "Your Technology Improvement Plan is ready",
      sentAt: new Date("2026-04-09"),
    },
    {
      templateKey: "project-created",
      subject: "New project started: Endpoint Management Rollout",
      sentAt: new Date("2026-05-13"),
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
  const slugs = ["ubiquiti-unifi", "ninjaone", "uptime-kuma", "stackscore"];
  const technologies = await input.prisma.technology.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, name: true },
  });

  const pinnacleBudgets = getPinnacleSeedTechnologyBudgets();

  for (const technology of technologies) {
    const allocation =
      pinnacleBudgets.allocations[technology.slug as keyof typeof pinnacleBudgets.allocations];
    await input.prisma.clientTechnology.create({
      data: {
        clientId: input.clientId,
        technologyId: technology.id,
        displayName:
          technology.slug === "stackscore"
            ? "Microsoft 365 Business Premium"
            : technology.slug === "ninjaone"
              ? "Managed Endpoint Service"
              : technology.name,
        businessPurpose:
          technology.slug === "ubiquiti-unifi"
            ? "Primary office network, guest Wi-Fi, and connectivity across Pinnacle Engineering locations."
            : technology.slug === "ninjaone"
              ? "Bobkat IT managed endpoint service for engineering workstations and field laptops."
              : technology.slug === "uptime-kuma"
                ? "Open-source infrastructure availability monitoring with optional Bobkat IT hosting and management."
                : "Microsoft 365 Business Premium collaboration platform for licensed users.",
        deploymentStatus:
          technology.slug === "ninjaone"
            ? "implementing"
            : technology.slug === "uptime-kuma"
              ? "planned"
              : "active",
        alignmentStatus: technology.slug === "uptime-kuma" ? "not_standard" : "approved",
        healthStatus: technology.slug === "ninjaone" ? "at_risk" : "healthy",
        lifecycleStatus: "current",
        managedBy: "bobkat_it",
        quantity: allocation.quantity,
        quantityUnit: allocation.quantityUnit,
        ownerName: ACME_DEMO.primaryContactName,
        technicalOwnerName: "BobKat IT",
        budgetAmountCents: allocation.budgetAmountCents,
        budgetPeriod: allocation.budgetPeriod,
        budgetNotes: allocation.budgetNotes,
        renewalDate: allocation.renewalDate,
        plannedReplacementDate:
          technology.slug === "ubiquiti-unifi" ? allocation.renewalDate : null,
      },
    });
  }
}

async function seedVcioData(input: {
  prisma: PrismaClient;
  clientId: string;
  adminUserId: string;
  demoEmail: string;
}) {
  await input.prisma.recurringService.create({
    data: {
      id: ACME_DEMO.recurringVcioId,
      clientId: input.clientId,
      serviceName: "StackScore vCIO",
      description: "Ongoing technology advisory, business reviews, living execution plan management, and executive reporting.",
      quantity: 1,
      unitPriceCents: 30000,
      billingFrequency: "monthly",
      startDate: new Date("2025-11-03"),
      nextBillingDate: new Date("2026-08-03"),
      renewalDate: new Date("2026-11-03"),
      minimumTermMonths: 1,
      autoRenew: true,
      paymentMethodStatus: "card_on_file",
      relatedTechnology: "StackScore vCIO",
      status: "active",
      lastInvoiceDate: new Date("2026-07-03"),
      internalCostCents: 12000,
      internalMarginPercent: 60,
    },
  });

  await input.prisma.subscription.create({
    data: {
      id: ACME_DEMO.subscriptionId,
      clientId: input.clientId,
      recurringServiceId: ACME_DEMO.recurringVcioId,
      provider: "stripe",
      providerCustomerId: "cus_demo_pinnacle_engineering",
      providerSubscriptionId: "sub_demo_pinnacle_vcio_2025",
      providerPriceId: "price_demo_stackscore_vcio",
      providerProductId: "prod_demo_stackscore_vcio",
      serviceType: "stackscore_vcio",
      billingInterval: "month",
      amountCents: 30000,
      currency: "usd",
      status: "active",
      rawStatus: "active",
      currentPeriodStart: new Date("2026-07-03"),
      currentPeriodEnd: new Date("2026-08-03"),
      cancelAtPeriodEnd: false,
      lastPaymentAt: new Date("2026-07-03"),
    },
  });

  await input.prisma.vcioOnboarding.create({
    data: {
      id: ACME_DEMO.vcioOnboardingId,
      clientId: input.clientId,
      subscriptionId: ACME_DEMO.subscriptionId,
      status: "completed",
      customerType: "assessment_customer",
      currentStep: "complete",
      completionPercentage: 100,
      initializationSource: "demo_seed",
      initializedAt: new Date("2025-11-04"),
      welcomeEmailStatus: "sent",
      welcomeEmailRecipient: input.demoEmail,
      welcomeEmailSentAt: new Date("2025-11-04"),
      baselineRequired: false,
      businessInfoJson: {
        companyName: ACME_DEMO.companyName,
        industry: ACME_DEMO.industry,
        employeeCount: 84,
        numberOfLocations: 2,
      },
      environmentJson: {
        platform: "Microsoft 365 Business Premium",
        identity: "Hybrid Entra ID",
        network: "Ubiquiti UniFi",
        endpointManagement: "NinjaOne RMM",
        backup: "Synology Backup",
        applications: "Azure-hosted line-of-business applications",
      },
      planningJson: {
        annualTechnologyBudgetCents: ACME_DEMO.annualTechnologyBudgetCents,
        remainingTechnologyBudgetCents: ACME_DEMO.remainingTechnologyBudgetCents,
      },
      strategySessionScheduledAt: new Date("2026-07-28"),
      completedAt: new Date("2025-11-18"),
    },
  });

  await input.prisma.vcioQuarterlyReview.create({
    data: {
      id: ACME_DEMO.vcioQ3ReviewId,
      clientId: input.clientId,
      subscriptionId: ACME_DEMO.subscriptionId,
      reviewPeriodStart: new Date("2026-07-01"),
      reviewPeriodEnd: new Date("2026-09-30"),
      reviewDate: new Date("2026-07-28"),
      status: "scheduled",
      executiveSummary:
        "Technology Health: Improving. Immediate Focus: Endpoint security, backups, documentation. Projected maturity improvement: +36 points.",
      scoreMovementJson: {
        currentStackScore: 56,
        projectedStackScore: 92,
        baselineStackScore: 39,
        trendDirection: "improving",
      },
      budgetSummaryJson: {
        annualBudgetCents: ACME_DEMO.annualTechnologyBudgetCents,
        spentCents:
          ACME_DEMO.annualTechnologyBudgetCents - ACME_DEMO.remainingTechnologyBudgetCents,
        remainingCents: ACME_DEMO.remainingTechnologyBudgetCents,
        currency: "USD",
      },
      nextQuarterPrioritiesJson: [
        "Implement centralized endpoint management",
        "Deploy infrastructure availability monitoring",
        "Establish immutable backup strategy",
        "Standardize Microsoft 365 security baseline",
        "Formalize vendor lifecycle documentation",
      ],
      plannedInvestmentsJson: [
        { title: "Endpoint Management Rollout", amountCents: 4200000 },
        { title: "Backup & Disaster Recovery Modernization", amountCents: 6800000 },
        { title: "Network Monitoring Deployment", amountCents: 1850000 },
      ],
      nextReviewDate: new Date("2026-10-15"),
      linkedRoadmapId: ACME_DEMO.tipId,
      createdByUserId: input.adminUserId,
    },
  });
}

export async function seedAcmeFoundationDemo(prisma: PrismaClient): Promise<{
  clientId: string;
  companyName: string;
  demoEmail: string;
  baselineAssessmentId: string;
  currentAssessmentId: string;
  tipId: string;
  qbrId: string;
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
      primaryContactPhone: "(214) 555-0184",
      primaryContactTitle: ACME_DEMO.primaryContactTitle,
      industry: ACME_DEMO.industry,
      employeeCount: 84,
      numberOfLocations: 2,
      deviceCount: 92,
      primaryBusinessGoal: "improve_cybersecurity",
      highestTechnologyPriority:
        "Protect project delivery systems, field devices, and Azure-hosted engineering applications",
      technologyVision:
        "Pinnacle Engineering is a growing civil and structural engineering firm with 84 employees across two offices. The organization relies on Microsoft 365 Business Premium, hybrid Entra ID, Ubiquiti networking, NinjaOne RMM, Synology backup, and Azure-hosted line-of-business applications. The environment is functional but needs stronger endpoint management, monitoring, immutable backup protection, and documented lifecycle governance.",
      itSupportModel: "msp",
      environmentType: "hybrid",
      locationCity: ACME_DEMO.locationCity,
      locationState: ACME_DEMO.locationState,
      status: "active",
      notes: `${ACME_DEMO.notesMarker} — Development-only demo client for screenshot and portal review.`,
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
      invitedAt: new Date("2025-10-01"),
      onboardingCompletedAt: new Date("2025-10-15"),
    },
  });

  await seedAcmeContacts({
    prisma,
    clientId: client.id,
    clientUserId: clientUser.id,
    demoEmail,
  });

  const baselineCompletedAt = new Date("2026-01-12");
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
      assessmentName: "Pinnacle Engineering Baseline Assessment",
      assessmentType: "initial",
      assessmentDate: baselineCompletedAt,
      status: "draft",
      scoringEngineVersion: "v2",
    },
  });

  await applyAnswerPlan(prisma, ACME_DEMO.baselineAssessmentId, baselinePlan, questionsByCode);
  await completeAssessmentV2(ACME_DEMO.baselineAssessmentId, admin.id);
  await backdateAssessment(prisma, ACME_DEMO.baselineAssessmentId, baselineCompletedAt);

  const currentCompletedAt = new Date("2026-06-21");
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
      assessmentName: "Pinnacle Engineering Technology Maturity Assessment",
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

  await seedAcmeQbr({
    prisma,
    clientId: client.id,
    adminUserId: admin.id,
  });

  await seedAcmeDocuments({
    prisma,
    clientId: client.id,
    adminUserId: admin.id,
    currentAssessmentId: ACME_DEMO.currentAssessmentId,
  });

  await seedAcmeNotes({
    prisma,
    clientId: client.id,
    adminUserId: admin.id,
    currentAssessmentId: ACME_DEMO.currentAssessmentId,
  });

  await seedAcmeBilling({
    prisma,
    clientId: client.id,
    adminUserId: admin.id,
    demoEmail,
  });

  await seedVcioData({
    prisma,
    clientId: client.id,
    adminUserId: admin.id,
    demoEmail,
  });

  await prisma.technologyProfile.update({
    where: { clientId: client.id },
    data: {
      currentAssessmentId: ACME_DEMO.currentAssessmentId,
      lastAssessedAt: currentCompletedAt,
      nextRecommendedAssessmentAt: new Date("2027-06-21"),
      trendDirection: "improving",
    },
  });

  return {
    clientId: client.id,
    companyName: ACME_DEMO.companyName,
    demoEmail,
    baselineAssessmentId: ACME_DEMO.baselineAssessmentId,
    currentAssessmentId: ACME_DEMO.currentAssessmentId,
    tipId: ACME_DEMO.tipId,
    qbrId: ACME_DEMO.qbrId,
  };
}
