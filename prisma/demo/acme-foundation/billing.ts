import type { PrismaClient } from "@/generated/prisma/client";
import { ACME_DEMO } from "./constants";

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
      phone: "(214) 555-0184",
      title: ACME_DEMO.primaryContactTitle,
      rolesJson: ["primary", "billing", "executive"],
      userId: input.clientUserId,
      isActive: true,
    },
  });

  await input.prisma.clientContact.create({
    data: {
      clientId: input.clientId,
      name: "Elena Martinez",
      email: "finance@pinnacleengineering.demo",
      phone: "(214) 555-0196",
      title: "Finance Manager",
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
      title: "Pinnacle Engineering 2026 Technology Improvement Plan",
      fileUrl: `/api/v1/clients/${input.clientId}/tip/${ACME_DEMO.tipId}/pdf`,
      uploadedByUserId: input.adminUserId,
      createdAt: new Date("2026-04-08"),
    },
  });

  await input.prisma.document.create({
    data: {
      id: ACME_DEMO.documentQbrId,
      clientId: input.clientId,
      qbrId: ACME_DEMO.qbrId,
      documentType: "quarterly_business_review",
      title: "Business Review",
      fileUrl: `/clients/${input.clientId}/quarterly-review/${ACME_DEMO.qbrId}`,
      uploadedByUserId: input.adminUserId,
      createdAt: new Date("2026-06-05"),
    },
  });

  await input.prisma.document.create({
    data: {
      id: ACME_DEMO.documentProjectId,
      clientId: input.clientId,
      projectId: ACME_DEMO.projectM365Id,
      documentType: "report",
      title: "Microsoft 365 Security Baseline — Progress Summary",
      fileUrl: `/clients/${input.clientId}/projects/${ACME_DEMO.projectM365Id}/completion-report`,
      uploadedByUserId: input.adminUserId,
      createdAt: new Date("2026-06-18"),
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
      createdAt: new Date("2026-06-22"),
    },
  });
}

export async function seedAcmeQbr(input: {
  prisma: PrismaClient;
  clientId: string;
  adminUserId: string;
}) {
  await input.prisma.quarterlyBusinessReview.create({
    data: {
      id: ACME_DEMO.qbrId,
      clientId: input.clientId,
      reviewPeriodStart: new Date("2026-04-01"),
      reviewPeriodEnd: new Date("2026-06-30"),
      title: "Business Review",
      status: "generated",
      executiveSummary:
        "Pinnacle Engineering improved overall technology maturity this quarter. Microsoft 365 Security Baseline work is underway, Endpoint Management Rollout is in progress, and Backup & Disaster Recovery Modernization is approved for the next phase.",
      generatedAt: new Date("2026-06-05"),
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
        "Internal: NinjaOne pilot expanded to 46 devices. Remaining field laptops scheduled for August rollout.",
      createdAt: new Date("2026-07-10"),
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
        "Client-visible: Assessment results show meaningful improvement in identity and collaboration. Immediate focus remains endpoint security, backups, and documentation.",
      createdAt: new Date("2026-06-22"),
    },
  });

  await input.prisma.note.create({
    data: {
      clientId: input.clientId,
      userId: input.adminUserId,
      noteType: "strategy_session",
      title: "Q3 2026 Strategy Session",
      visibility: "client_visible",
      content:
        "Prepare Q3 2026 business review covering endpoint security, immutable backup strategy, and Technology Improvement Plan execution.",
      scheduledAt: new Date("2026-07-28"),
      createdAt: new Date("2026-07-02"),
    },
  });
}

export async function seedAcmeBilling(input: {
  prisma: PrismaClient;
  clientId: string;
  adminUserId: string;
  demoEmail: string;
}) {
  await input.prisma.clientBillingProfile.create({
    data: {
      clientId: input.clientId,
      billingCompanyName: ACME_DEMO.companyName,
      billingEmail: input.demoEmail,
      billingPhone: "(214) 555-0184",
      addressLine1: "2200 Commerce Street",
      addressLine2: "Suite 900",
      city: ACME_DEMO.locationCity,
      state: ACME_DEMO.locationState,
      postalCode: "75201",
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
      label: "Endpoint Management Rollout — 50% deposit",
      amountCents: 2100000,
      percentage: 50,
      tipId: ACME_DEMO.tipId,
      projectId: ACME_DEMO.projectEndpointId,
      requestedAt: new Date("2026-05-01"),
      paidAt: new Date("2026-05-12"),
    },
  });

  await input.prisma.project.update({
    where: { id: ACME_DEMO.projectEndpointId },
    data: {
      requiredDepositId: ACME_DEMO.depositEndpointId,
      estimatedCost: 42000,
    },
  });

  await input.prisma.project.update({
    where: { id: ACME_DEMO.projectBackupId },
    data: { estimatedCost: 68000 },
  });

  await input.prisma.project.update({
    where: { id: ACME_DEMO.projectNetworkId },
    data: { estimatedCost: 18500 },
  });

  const depositAwaiting = await input.prisma.billingDeposit.create({
    data: {
      clientId: input.clientId,
      depositType: "fixed",
      status: "invoice_sent",
      label: "Backup & Disaster Recovery Modernization — project kickoff deposit",
      amountCents: 1700000,
      tipId: ACME_DEMO.tipId,
      projectId: ACME_DEMO.projectBackupId,
      requestedAt: new Date("2026-06-18"),
    },
  });

  await input.prisma.recurringService.create({
    data: {
      id: ACME_DEMO.recurringManagedItId,
      clientId: input.clientId,
      serviceName: "Managed IT Services",
      description: "Proactive monitoring, help desk, and vendor coordination for Pinnacle Engineering.",
      quantity: 84,
      unitPriceCents: 1500,
      billingFrequency: "monthly",
      startDate: new Date("2025-11-01"),
      nextBillingDate: new Date("2026-08-01"),
      renewalDate: new Date("2026-11-01"),
      minimumTermMonths: 12,
      autoRenew: true,
      paymentMethodStatus: "card_on_file",
      relatedTechnology: "Microsoft 365 Business Premium, Ubiquiti UniFi, NinjaOne RMM",
      status: "active",
      lastInvoiceDate: new Date("2026-07-01"),
      internalCostCents: 840000,
      internalMarginPercent: 33,
    },
  });

  await input.prisma.recurringService.create({
    data: {
      id: ACME_DEMO.recurringM365Id,
      clientId: input.clientId,
      serviceName: "Microsoft 365 Management",
      description: "Tenant administration, license optimization, and security policy maintenance.",
      quantity: 84,
      unitPriceCents: 900,
      billingFrequency: "monthly",
      startDate: new Date("2026-02-01"),
      nextBillingDate: new Date("2026-08-01"),
      renewalDate: new Date("2027-02-01"),
      autoRenew: true,
      status: "active",
      lastInvoiceDate: new Date("2026-07-01"),
      internalCostCents: 470000,
      internalMarginPercent: 38,
    },
  });

  await input.prisma.recurringService.create({
    data: {
      id: ACME_DEMO.recurringBackupId,
      clientId: input.clientId,
      serviceName: "Backup and Recovery Monitoring",
      description: "Synology and cloud backup monitoring with monthly recovery verification (pending activation).",
      quantity: 1,
      unitPriceCents: 85000,
      billingFrequency: "monthly",
      startDate: new Date("2026-09-01"),
      nextBillingDate: new Date("2026-09-01"),
      renewalDate: new Date("2027-09-01"),
      autoRenew: true,
      status: "pending_activation",
      internalCostCents: 38000,
      internalMarginPercent: 55,
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoicePaidId,
      clientId: input.clientId,
      invoiceNumber: "INV-PIN-2026-001",
      status: "paid",
      sourceType: "recurring_service",
      subtotalCents: 201600,
      totalCents: 201600,
      amountPaidCents: 201600,
      balanceDueCents: 0,
      issueDate: new Date("2026-07-01"),
      dueDate: new Date("2026-07-31"),
      paidAt: new Date("2026-07-08"),
      paymentTermsDays: 30,
      clientNotes: "Thank you for your continued partnership with BobKat IT.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      billToPhone: "(214) 555-0184",
      billingContactId: ACME_DEMO.billingContactId,
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Managed IT Services — July 2026",
            quantity: 84,
            unitPriceCents: 1500,
            amountCents: 126000,
            category: "managed_services",
            lineKind: "recurring",
            recurringServiceId: ACME_DEMO.recurringManagedItId,
          },
          {
            sortOrder: 1,
            description: "Microsoft 365 Management — July 2026",
            quantity: 84,
            unitPriceCents: 900,
            amountCents: 75600,
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
          subject: "Invoice INV-PIN-2026-001 from BobKat IT",
          sentAt: new Date("2026-07-01"),
          deliveredAt: new Date("2026-07-02"),
        },
      },
    },
  });

  await input.prisma.billingPayment.create({
    data: {
      id: ACME_DEMO.paymentStripeId,
      clientId: input.clientId,
      amountCents: 201600,
      paymentDate: new Date("2026-07-08"),
      method: "card",
      status: "succeeded",
      processor: "stripe",
      transactionReference: "pi_demo_pinnacle_jul2026",
      stripePaymentIntentId: "pi_demo_pinnacle_jul2026",
      applications: {
        create: {
          invoiceId: ACME_DEMO.invoicePaidId,
          appliedCents: 201600,
        },
      },
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoiceSentId,
      clientId: input.clientId,
      invoiceNumber: "INV-PIN-2026-002",
      status: "sent",
      sourceType: "milestone",
      subtotalCents: 2100000,
      totalCents: 2100000,
      amountPaidCents: 0,
      balanceDueCents: 2100000,
      issueDate: new Date("2026-07-05"),
      dueDate: new Date("2026-08-04"),
      paymentTermsDays: 30,
      clientNotes: "Milestone invoice for Endpoint Management Rollout — Phase 2 rollout.",
      internalNotes: "Internal: aligns with 50% deposit already collected; balance due at milestone.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      billingContactId: ACME_DEMO.billingContactId,
      projectId: ACME_DEMO.projectEndpointId,
      tipId: ACME_DEMO.tipId,
      depositId: ACME_DEMO.depositEndpointId,
      onlinePaymentEnabled: true,
      stripePaymentLinkUrl: "https://checkout.stripe.com/demo-pinnacle-invoice-002",
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Endpoint Management Rollout — Phase 2 milestone",
            quantity: 1,
            unitPriceCents: 2100000,
            amountCents: 2100000,
            category: "professional_services",
            projectId: ACME_DEMO.projectEndpointId,
            internalCostCents: 1050000,
          },
        ],
      },
      deliveries: {
        create: {
          channel: "email",
          status: "sent",
          recipientEmail: input.demoEmail,
          subject: "Invoice INV-PIN-2026-002 from BobKat IT",
          sentAt: new Date("2026-07-05"),
        },
      },
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoicePartialId,
      clientId: input.clientId,
      invoiceNumber: "INV-PIN-2026-003",
      status: "partially_paid",
      sourceType: "deposit_request",
      subtotalCents: 1700000,
      totalCents: 1700000,
      amountPaidCents: 850000,
      balanceDueCents: 850000,
      issueDate: new Date("2026-06-20"),
      dueDate: new Date("2026-07-20"),
      paymentTermsDays: 30,
      clientNotes: "Deposit invoice for Backup & Disaster Recovery Modernization project.",
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
            description: "Backup & Disaster Recovery Modernization — project kickoff deposit",
            quantity: 1,
            unitPriceCents: 1700000,
            amountCents: 1700000,
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
      amountCents: 850000,
      paymentDate: new Date("2026-07-02"),
      method: "check",
      status: "succeeded",
      processor: "manual",
      transactionReference: "CHK-10482",
      recordedByUserId: input.adminUserId,
      notes: "Partial deposit received by mail.",
      applications: {
        create: {
          invoiceId: ACME_DEMO.invoicePartialId,
          appliedCents: 850000,
        },
      },
    },
  });

  await input.prisma.invoice.create({
    data: {
      id: ACME_DEMO.invoiceOverdueId,
      clientId: input.clientId,
      invoiceNumber: "INV-PIN-2025-018",
      status: "overdue",
      sourceType: "manual",
      subtotalCents: 1500000,
      totalCents: 1500000,
      amountPaidCents: 0,
      balanceDueCents: 1500000,
      issueDate: new Date("2026-05-01"),
      dueDate: new Date("2026-05-31"),
      paymentTermsDays: 30,
      clientNotes: "Technology Maturity Assessment and executive reporting package.",
      billToName: ACME_DEMO.companyName,
      billToEmail: input.demoEmail,
      createdByUserId: input.adminUserId,
      lineItems: {
        create: [
          {
            sortOrder: 0,
            description: "Technology Maturity Assessment — executive report and Technology Improvement Plan workshop",
            quantity: 1,
            unitPriceCents: 1500000,
            amountCents: 1500000,
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
      invoiceNumber: "INV-PIN-2026-004",
      status: "draft",
      sourceType: "technology_improvement_plan",
      subtotalCents: 12850000,
      totalCents: 12850000,
      amountPaidCents: 0,
      balanceDueCents: 12850000,
      issueDate: new Date("2026-07-12"),
      dueDate: new Date("2026-08-11"),
      paymentTermsDays: 30,
      internalNotes: "Draft Technology Improvement Plan invoice — verify line items before sending.",
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
            unitPriceCents: 4200000,
            amountCents: 4200000,
            category: "professional_services",
            internalCostCents: 2400000,
          },
          {
            sortOrder: 1,
            description: "Technology & Hardware — equipment and infrastructure",
            quantity: 1,
            unitPriceCents: 6800000,
            amountCents: 6800000,
            category: "technology_hardware",
            internalCostCents: 5200000,
          },
          {
            sortOrder: 2,
            description: "Managed Services — ongoing operational support",
            quantity: 1,
            unitPriceCents: 1020000,
            amountCents: 1020000,
            category: "managed_services",
          },
          {
            sortOrder: 3,
            description: "Program delivery & project management",
            quantity: 1,
            unitPriceCents: 830000,
            amountCents: 830000,
            category: "professional_services",
          },
        ],
      },
    },
  });

  const auditEvents = [
    { action: "invoice_created" as const, invoiceId: ACME_DEMO.invoiceDraftId },
    { action: "invoice_sent" as const, invoiceId: ACME_DEMO.invoiceSentId },
    {
      action: "payment_succeeded" as const,
      invoiceId: ACME_DEMO.invoicePaidId,
      paymentId: ACME_DEMO.paymentStripeId,
    },
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
        createdAt: new Date("2026-07-05"),
      },
    });
  }

  await input.prisma.organizationActivityEvent.create({
    data: {
      clientId: input.clientId,
      category: "BILLING",
      eventType: "invoice_sent",
      title: "Invoice INV-PIN-2026-002 sent",
      description: "Milestone invoice emailed to billing contact.",
      occurredAt: new Date("2026-07-05"),
      source: "DEMO_SEED",
      visibility: "CLIENT_VISIBLE",
      actorUserId: input.adminUserId,
      metadataJson: { demoSeed: true, invoiceId: ACME_DEMO.invoiceSentId },
    },
  });
}
