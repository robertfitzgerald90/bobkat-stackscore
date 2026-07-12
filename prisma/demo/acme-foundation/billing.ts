import type { PrismaClient } from "@/generated/prisma/client";
import { ACME_DEMO } from "./constants";

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function seedAcmeContacts(input: {
  prisma: PrismaClient;
  clientId: string;
  clientUserId: string;
  demoEmail: string;
}) {
  await input.prisma.clientContact.create({
    data: {
      id: ACME_DEMO.billingContactId,
      clientId: input.clientId,
      name: ACME_DEMO.primaryContactName,
      email: input.demoEmail,
      phone: "(713) 555-0148",
      title: ACME_DEMO.primaryContactTitle,
      rolesJson: ["primary", "billing", "executive"],
      userId: input.clientUserId,
      isActive: true,
    },
  });

  await input.prisma.clientContact.create({
    data: {
      clientId: input.clientId,
      name: "David Chen",
      email: "finance@acmeinc.demo",
      phone: "(713) 555-0192",
      title: "Finance Director",
      rolesJson: ["billing"],
      isActive: true,
    },
  });
}

export async function seedAcmeDocuments(input: {
  prisma: PrismaClient;
  clientId: string;
  adminUserId: string;
  currentAssessmentId: string;
}) {
  await input.prisma.document.create({
    data: {
      id: ACME_DEMO.documentTipId,
      clientId: input.clientId,
      tipId: ACME_DEMO.tipId,
      documentType: "technology_improvement_plan",
      title: "Acme Inc. 2026 Technology Improvement Plan",
      fileUrl: `/api/v1/clients/${input.clientId}/tip/${ACME_DEMO.tipId}/pdf`,
      uploadedByUserId: input.adminUserId,
    },
  });

  await input.prisma.document.create({
    data: {
      id: ACME_DEMO.documentQbrId,
      clientId: input.clientId,
      qbrId: ACME_DEMO.qbrId,
      documentType: "quarterly_business_review",
      title: "Q1 2026 Quarterly Business Review",
      fileUrl: `/clients/${input.clientId}/quarterly-review/${ACME_DEMO.qbrId}`,
      uploadedByUserId: input.adminUserId,
    },
  });

  await input.prisma.document.create({
    data: {
      id: ACME_DEMO.documentProjectId,
      clientId: input.clientId,
      projectId: ACME_DEMO.projectM365Id,
      documentType: "report",
      title: "Microsoft 365 Security Baseline — Completion Summary",
      fileUrl: `/clients/${input.clientId}/projects/${ACME_DEMO.projectM365Id}/completion-report`,
      uploadedByUserId: input.adminUserId,
    },
  });

  await input.prisma.document.create({
    data: {
      clientId: input.clientId,
      assessmentId: input.currentAssessmentId,
      documentType: "report",
      title: "Technology Maturity Assessment Report",
      fileUrl: `/assessments/${input.currentAssessmentId}/report`,
      uploadedByUserId: input.adminUserId,
    },
  });
}

export async function seedAcmeQbr(input: {
  prisma: PrismaClient;
  clientId: string;
  adminUserId: string;
}) {
  const periodEnd = new Date();
  const periodStart = addMonths(periodEnd, -3);

  await input.prisma.quarterlyBusinessReview.create({
    data: {
      id: ACME_DEMO.qbrId,
      clientId: input.clientId,
      reviewPeriodStart: periodStart,
      reviewPeriodEnd: periodEnd,
      title: "Q1 2026 Quarterly Business Review",
      status: "generated",
      executiveSummary:
        "Acme Inc. improved overall technology maturity this quarter. Endpoint management is underway, Microsoft 365 security baseline is complete, and backup standardization is queued for the next phase.",
      generatedAt: addDays(periodEnd, -5),
      createdByUserId: input.adminUserId,
    },
  });
}

export async function seedAcmeNotes(input: {
  prisma: PrismaClient;
  clientId: string;
  adminUserId: string;
  currentAssessmentId: string;
}) {
  await input.prisma.note.create({
    data: {
      clientId: input.clientId,
      projectId: ACME_DEMO.projectEndpointId,
      userId: input.adminUserId,
      noteType: "general",
      visibility: "internal",
      content:
        "Internal: Endpoint pilot expanded to 11 devices. Remaining shared kiosks scheduled for next sprint. Margin on this project is healthy.",
    },
  });

  await input.prisma.note.create({
    data: {
      clientId: input.clientId,
      assessmentId: input.currentAssessmentId,
      userId: input.adminUserId,
      noteType: "general",
      visibility: "client_visible",
      content:
        "Client-visible: Assessment results show meaningful improvement in identity and collaboration. Next focus areas are endpoint management and backup reliability.",
    },
  });
}

export async function seedAcmeBilling(input: {
  prisma: PrismaClient;
  clientId: string;
  adminUserId: string;
  demoEmail: string;
}) {
  const now = new Date();

  await input.prisma.clientBillingProfile.create({
    data: {
      clientId: input.clientId,
      billingCompanyName: ACME_DEMO.companyName,
      billingEmail: input.demoEmail,
      billingPhone: "(713) 555-0148",
      addressLine1: "1200 Main Street",
      addressLine2: "Suite 400",
      city: ACME_DEMO.locationCity,
      state: ACME_DEMO.locationState,
      postalCode: "77002",
      country: "US",
      paymentTermsDays: 30,
      defaultBillingContactId: ACME_DEMO.billingContactId,
    },
  });

  await input.prisma.billingDeposit.create({
    data: {
      id: ACME_DEMO.depositEndpointId,
      clientId: input.clientId,
      depositType: "percentage",
      status: "paid",
      label: "Endpoint Management Deployment — 50% deposit",
      amountCents: 1850000,
      percentage: 50,
      tipId: ACME_DEMO.tipId,
      projectId: ACME_DEMO.projectEndpointId,
      requestedAt: addMonths(now, -2),
      paidAt: addMonths(now, -1),
    },
  });

  await input.prisma.project.update({
    where: { id: ACME_DEMO.projectEndpointId },
    data: {
      requiredDepositId: ACME_DEMO.depositEndpointId,
      estimatedCost: 37000,
    },
  });

  await input.prisma.project.update({
    where: { id: ACME_DEMO.projectBackupId },
    data: { estimatedCost: 24500 },
  });

  const depositAwaiting = await input.prisma.billingDeposit.create({
    data: {
      clientId: input.clientId,
      depositType: "fixed",
      status: "invoice_sent",
      label: "Backup and Recovery — project kickoff deposit",
      amountCents: 750000,
      tipId: ACME_DEMO.tipId,
      projectId: ACME_DEMO.projectBackupId,
      requestedAt: addDays(now, -10),
    },
  });

  await input.prisma.recurringService.create({
    data: {
      id: ACME_DEMO.recurringManagedItId,
      clientId: input.clientId,
      serviceName: "Managed IT Services",
      description: "Proactive monitoring, help desk, and vendor coordination for Acme Inc.",
      quantity: 18,
      unitPriceCents: 12500,
      billingFrequency: "monthly",
      startDate: addMonths(now, -6),
      nextBillingDate: addDays(now, 12),
      renewalDate: addMonths(now, 6),
      minimumTermMonths: 12,
      autoRenew: true,
      paymentMethodStatus: "card_on_file",
      relatedTechnology: "Microsoft 365, Ubiquiti UniFi",
      status: "active",
      lastInvoiceDate: addMonths(now, -1),
      internalCostCents: 140000,
      internalMarginPercent: 38,
    },
  });

  await input.prisma.recurringService.create({
    data: {
      id: ACME_DEMO.recurringM365Id,
      clientId: input.clientId,
      serviceName: "Microsoft 365 Management",
      description: "Tenant administration, license optimization, and security policy maintenance.",
      quantity: 18,
      unitPriceCents: 3500,
      billingFrequency: "monthly",
      startDate: addMonths(now, -4),
      nextBillingDate: addDays(now, 12),
      renewalDate: addMonths(now, 8),
      autoRenew: true,
      status: "active",
      lastInvoiceDate: addMonths(now, -1),
      internalCostCents: 42000,
      internalMarginPercent: 33,
    },
  });

  await input.prisma.recurringService.create({
    data: {
      id: ACME_DEMO.recurringBackupId,
      clientId: input.clientId,
      serviceName: "Backup and Recovery Monitoring",
      description: "Backup job monitoring and monthly recovery verification (pending activation).",
      quantity: 1,
      unitPriceCents: 45000,
      billingFrequency: "monthly",
      startDate: addMonths(now, 1),
      nextBillingDate: addMonths(now, 1),
      renewalDate: addMonths(now, 13),
      autoRenew: true,
      status: "pending_activation",
      internalCostCents: 22000,
      internalMarginPercent: 51,
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoicePaidId,
      clientId: input.clientId,
      invoiceNumber: "INV-ACME-2026-001",
      status: "paid",
      sourceType: "recurring_service",
      subtotalCents: 288000,
      totalCents: 288000,
      amountPaidCents: 288000,
      balanceDueCents: 0,
      issueDate: addMonths(now, -1),
      dueDate: addDays(addMonths(now, -1), 30),
      paidAt: addDays(addMonths(now, -1), 5),
      paymentTermsDays: 30,
      clientNotes: "Thank you for your continued partnership with BobKat IT.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      billToPhone: "(713) 555-0148",
      billingContactId: ACME_DEMO.billingContactId,
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Managed IT Services — February 2026",
            quantity: 18,
            unitPriceCents: 12500,
            amountCents: 225000,
            category: "managed_services",
            lineKind: "recurring",
            recurringServiceId: ACME_DEMO.recurringManagedItId,
          },
          {
            sortOrder: 1,
            description: "Microsoft 365 Management — February 2026",
            quantity: 18,
            unitPriceCents: 3500,
            amountCents: 63000,
            category: "managed_services",
            lineKind: "recurring",
            recurringServiceId: ACME_DEMO.recurringM365Id,
          },
        ],
      },
      deliveries: {
        create: {
          channel: "email",
          status: "delivered",
          recipientEmail: input.demoEmail,
          subject: "Invoice INV-ACME-2026-001 from BobKat IT",
          sentAt: addMonths(now, -1),
          deliveredAt: addDays(addMonths(now, -1), 1),
        },
      },
    },
  });

  await input.prisma.billingPayment.create({
    data: {
      id: ACME_DEMO.paymentStripeId,
      clientId: input.clientId,
      amountCents: 288000,
      paymentDate: addDays(addMonths(now, -1), 5),
      method: "card",
      status: "succeeded",
      processor: "stripe",
      transactionReference: "pi_demo_acme_feb2026",
      stripePaymentIntentId: "pi_demo_acme_feb2026",
      applications: {
        create: {
          invoiceId: ACME_DEMO.invoicePaidId,
          appliedCents: 288000,
        },
      },
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoiceSentId,
      clientId: input.clientId,
      invoiceNumber: "INV-ACME-2026-002",
      status: "sent",
      sourceType: "milestone",
      subtotalCents: 1850000,
      totalCents: 1850000,
      amountPaidCents: 0,
      balanceDueCents: 1850000,
      issueDate: addDays(now, -7),
      dueDate: addDays(now, 23),
      paymentTermsDays: 30,
      clientNotes: "Milestone invoice for Endpoint Management Deployment — Phase 2 rollout.",
      internalNotes: "Internal: aligns with 50% deposit already collected; balance due at milestone.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      billingContactId: ACME_DEMO.billingContactId,
      projectId: ACME_DEMO.projectEndpointId,
      tipId: ACME_DEMO.tipId,
      depositId: ACME_DEMO.depositEndpointId,
      onlinePaymentEnabled: true,
      stripePaymentLinkUrl: "https://checkout.stripe.com/demo-acme-invoice-002",
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Endpoint Management Deployment — Phase 2 milestone",
            quantity: 1,
            unitPriceCents: 1850000,
            amountCents: 1850000,
            category: "professional_services",
            projectId: ACME_DEMO.projectEndpointId,
            internalCostCents: 920000,
          },
        ],
      },
      deliveries: {
        create: {
          channel: "email",
          status: "sent",
          recipientEmail: input.demoEmail,
          subject: "Invoice INV-ACME-2026-002 from BobKat IT",
          sentAt: addDays(now, -7),
        },
      },
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoicePartialId,
      clientId: input.clientId,
      invoiceNumber: "INV-ACME-2026-003",
      status: "partially_paid",
      sourceType: "deposit_request",
      subtotalCents: 750000,
      totalCents: 750000,
      amountPaidCents: 250000,
      balanceDueCents: 500000,
      issueDate: addDays(now, -10),
      dueDate: addDays(now, 20),
      paymentTermsDays: 30,
      clientNotes: "Deposit invoice for Backup and Recovery Standardization project.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      billingContactId: ACME_DEMO.billingContactId,
      projectId: ACME_DEMO.projectBackupId,
      depositId: depositAwaiting.id,
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Backup and Recovery — project kickoff deposit",
            quantity: 1,
            unitPriceCents: 750000,
            amountCents: 750000,
            category: "deposit",
            projectId: ACME_DEMO.projectBackupId,
          },
        ],
      },
    },
  });

  await input.prisma.billingPayment.create({
    data: {
      id: ACME_DEMO.paymentCheckId,
      clientId: input.clientId,
      amountCents: 250000,
      paymentDate: addDays(now, -3),
      method: "check",
      status: "succeeded",
      processor: "manual",
      transactionReference: "CHK-8842",
      recordedByUserId: input.adminUserId,
      notes: "Partial deposit received by mail.",
      applications: {
        create: {
          invoiceId: ACME_DEMO.invoicePartialId,
          appliedCents: 250000,
        },
      },
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoiceOverdueId,
      clientId: input.clientId,
      invoiceNumber: "INV-ACME-2025-014",
      status: "overdue",
      sourceType: "manual",
      subtotalCents: 125000,
      totalCents: 125000,
      amountPaidCents: 0,
      balanceDueCents: 125000,
      issueDate: addDays(now, -45),
      dueDate: addDays(now, -15),
      paymentTermsDays: 30,
      clientNotes: "On-site network assessment and remediation planning session.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Network assessment and remediation planning",
            quantity: 1,
            unitPriceCents: 125000,
            amountCents: 125000,
            category: "professional_services",
          },
        ],
      },
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoiceDraftId,
      clientId: input.clientId,
      invoiceNumber: "INV-ACME-2026-004",
      status: "draft",
      sourceType: "technology_improvement_plan",
      subtotalCents: 4620000,
      totalCents: 4620000,
      amountPaidCents: 0,
      balanceDueCents: 4620000,
      issueDate: now,
      dueDate: addDays(now, 30),
      paymentTermsDays: 30,
      internalNotes: "Draft plan invoice — verify line items before sending.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      tipId: ACME_DEMO.tipId,
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Professional Services — consulting and implementation labor",
            quantity: 1,
            unitPriceCents: 1980000,
            amountCents: 1980000,
            category: "professional_services",
            internalCostCents: 1100000,
          },
          {
            sortOrder: 1,
            description: "Technology & Hardware — equipment and infrastructure",
            quantity: 1,
            unitPriceCents: 495000,
            amountCents: 495000,
            category: "technology_hardware",
            internalCostCents: 380000,
          },
          {
            sortOrder: 2,
            description: "Managed Services — ongoing operational support",
            quantity: 1,
            unitPriceCents: 792000,
            amountCents: 792000,
            category: "managed_services",
          },
          {
            sortOrder: 3,
            description: "Program delivery & project management",
            quantity: 1,
            unitPriceCents: 1353000,
            amountCents: 1353000,
            category: "professional_services",
          },
        ],
      },
    },
  });

  const auditEvents = [
    { action: "invoice_created" as const, invoiceId: ACME_DEMO.invoiceDraftId },
    { action: "invoice_sent" as const, invoiceId: ACME_DEMO.invoiceSentId },
    { action: "payment_succeeded" as const, invoiceId: ACME_DEMO.invoicePaidId, paymentId: ACME_DEMO.paymentStripeId },
    { action: "deposit_requested" as const, metadata: { depositId: ACME_DEMO.depositEndpointId } },
    { action: "recurring_service_activated" as const, metadata: { serviceId: ACME_DEMO.recurringManagedItId } },
    { action: "invoice_marked_overdue" as const, invoiceId: ACME_DEMO.invoiceOverdueId },
  ];

  for (const event of auditEvents) {
    await input.prisma.billingAuditEvent.create({
      data: {
        clientId: input.clientId,
        invoiceId: event.invoiceId,
        paymentId: event.paymentId,
        action: event.action,
        actorUserId: input.adminUserId,
        metadataJson: event.metadata ?? undefined,
      },
    });
  }

  await input.prisma.organizationActivityEvent.create({
    data: {
      clientId: input.clientId,
      category: "BILLING",
      eventType: "invoice_sent",
      title: "Invoice INV-ACME-2026-002 sent",
      description: "Milestone invoice emailed to billing contact.",
      occurredAt: addDays(now, -7),
      source: "DEMO_SEED",
      visibility: "CLIENT_VISIBLE",
      actorUserId: input.adminUserId,
      metadataJson: { demoSeed: true, invoiceId: ACME_DEMO.invoiceSentId },
    },
  });
}
