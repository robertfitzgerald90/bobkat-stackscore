/**
 * Safely remove Stripe/onboarding test customer data from the database.
 *
 * Usage:
 *   npm run cleanup:test-data -- --email bobbytest3@bobkatit.com --dry-run
 *   npm run cleanup:test-data -- --email bobbytest3@bobkatit.com --confirm
 *   npm run cleanup:test-data -- --pattern "bobby%" --dry-run
 *   npm run cleanup:test-data -- --client-id <uuid> --dry-run
 *   npm run cleanup:test-data -- --all-test --dry-run
 *   npm run cleanup:test-data -- --all-test --include-snapshot-leads --dry-run
 *   npm run cleanup:test-data -- --all-test --include-snapshot-leads --confirm
 *
 * Requires --confirm to delete. Without --confirm, only reports counts (--dry-run is default behavior).
 */
import "dotenv/config";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const STAFF_ROLES: UserRole[] = ["admin", "technician"];

const DEFAULT_PROTECTED_EMAILS = [
  "admin@bobkatit.com",
  "technician@bobkatit.com",
  "bobby@bobkatit.com",
];

const DEFAULT_TEST_SNAPSHOT_EMAIL_PATTERNS = [
  "bobbytest%@bobkatit.com",
  "%test%@bobkatit.com",
];

type CliOptions = {
  email?: string;
  pattern?: string;
  clientId?: string;
  allTest: boolean;
  includeSnapshotLeads: boolean;
  dryRun: boolean;
  confirm: boolean;
};

type DeletionCounts = Record<string, number>;

type CleanupScope = {
  clientIds: string[];
  clientUserIds: string[];
  orphanedPurchaseIds: string[];
  snapshotLeadIds: string[];
  matchedClients: Array<{ id: string; companyName: string; primaryContactEmail: string }>;
  matchedUsers: Array<{ id: string; email: string; role: UserRole; clientId: string | null }>;
  matchedSnapshotLeads: Array<{
    id: string;
    email: string;
    contactName: string;
    companyName: string;
    status: string;
    totalScore: number;
    createdAt: Date;
  }>;
  skippedProtectedEmails: string[];
  skippedProtectedSnapshotEmails: string[];
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    allTest: false,
    includeSnapshotLeads: false,
    dryRun: false,
    confirm: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--email":
        opts.email = argv[++i];
        break;
      case "--pattern":
        opts.pattern = argv[++i];
        break;
      case "--client-id":
        opts.clientId = argv[++i];
        break;
      case "--all-test":
        opts.allTest = true;
        break;
      case "--include-snapshot-leads":
        opts.includeSnapshotLeads = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--confirm":
        opts.confirm = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function protectedEmails(): Set<string> {
  const fromEnv = (process.env.PROTECTED_USER_EMAILS ?? "")
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean);
  return new Set([...DEFAULT_PROTECTED_EMAILS.map(normalizeEmail), ...fromEnv]);
}

function protectedClientEmails(): Set<string> {
  const fromEnv = (process.env.PROTECTED_CLIENT_EMAILS ?? "")
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean);
  return new Set(fromEnv);
}

function protectedSnapshotLeadEmails(): Set<string> {
  const fromEnv = (process.env.PROTECTED_SNAPSHOT_LEAD_EMAILS ?? "")
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean);
  return new Set([...protectedEmails(), ...fromEnv]);
}

function testSnapshotEmailPatterns(): string[] {
  const fromEnv = (process.env.TEST_SNAPSHOT_EMAIL_PATTERNS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_TEST_SNAPSHOT_EMAIL_PATTERNS;
}

function emailMatchesIlike(email: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `^${escaped.replace(/%/g, ".*").replace(/_/g, ".")}$`,
    "i",
  );
  return regex.test(email);
}

function validateSelector(opts: CliOptions): void {
  const selectors = [opts.email, opts.pattern, opts.clientId, opts.allTest].filter(Boolean);
  if (selectors.length !== 1) {
    throw new Error(
      "Provide exactly one selector: --email, --pattern, --client-id, or --all-test",
    );
  }
}

function assertNotProtectedEmail(email: string, protectedSet: Set<string>): void {
  const normalized = normalizeEmail(email);
  if (protectedSet.has(normalized)) {
    throw new Error(`Refusing to target protected email: ${normalized}`);
  }
}

async function findStaffUsersLinkedToClients(clientIds: string[]) {
  if (clientIds.length === 0) return [];
  return prisma.user.findMany({
    where: {
      clientId: { in: clientIds },
      role: { in: STAFF_ROLES },
    },
    select: { id: true, email: true, role: true, clientId: true },
  });
}

async function resolveScope(opts: CliOptions): Promise<CleanupScope> {
  const protectedUserEmails = protectedEmails();
  const protectedClients = protectedClientEmails();
  const clientIds = new Set<string>();
  const clientUserIds = new Set<string>();
  const orphanedPurchaseIds = new Set<string>();
  const skippedProtectedEmails = new Set<string>();

  if (opts.email) {
    const email = normalizeEmail(opts.email);
    assertNotProtectedEmail(email, protectedUserEmails);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, clientId: true },
    });

    if (user) {
      if (STAFF_ROLES.includes(user.role)) {
        throw new Error(`Refusing to delete staff user: ${email} (${user.role})`);
      }
      clientUserIds.add(user.id);
      if (user.clientId) clientIds.add(user.clientId);
    }

    const clientsByContact = await prisma.client.findMany({
      where: { primaryContactEmail: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });
    for (const client of clientsByContact) clientIds.add(client.id);

    const purchases = await prisma.assessmentPurchase.findMany({
      where: { purchaserEmail: { equals: email, mode: "insensitive" } },
      select: { id: true, clientId: true },
    });
    for (const purchase of purchases) {
      if (purchase.clientId) clientIds.add(purchase.clientId);
      else orphanedPurchaseIds.add(purchase.id);
    }
  } else if (opts.pattern) {
    const users = await prisma.$queryRaw<
      Array<{ id: string; email: string; role: UserRole; clientId: string | null }>
    >`
      SELECT id, email, role, "clientId"
      FROM "User"
      WHERE email ILIKE ${opts.pattern}
        AND role = 'client'
    `;

    for (const user of users) {
      const email = normalizeEmail(user.email);
      if (protectedUserEmails.has(email)) {
        skippedProtectedEmails.add(email);
        continue;
      }
      clientUserIds.add(user.id);
      if (user.clientId) clientIds.add(user.clientId);
    }

    const clients = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "Client"
      WHERE "primaryContactEmail" ILIKE ${opts.pattern}
    `;
    for (const client of clients) {
      clientIds.add(client.id);
    }

    const purchases = await prisma.$queryRaw<Array<{ id: string; clientId: string | null }>>`
      SELECT id, "clientId"
      FROM "AssessmentPurchase"
      WHERE "purchaserEmail" ILIKE ${opts.pattern}
    `;
    for (const purchase of purchases) {
      if (purchase.clientId) clientIds.add(purchase.clientId);
      else orphanedPurchaseIds.add(purchase.id);
    }
  } else if (opts.clientId) {
    clientIds.add(opts.clientId);
  } else if (opts.allTest) {
    const clients = await prisma.client.findMany({
      select: { id: true, primaryContactEmail: true },
    });
    for (const client of clients) {
      const email = normalizeEmail(client.primaryContactEmail);
      if (protectedClients.has(email)) {
        skippedProtectedEmails.add(email);
        continue;
      }
      clientIds.add(client.id);
    }
  }

  const resolvedClientIds = [...clientIds];
  const staffOnClients = await findStaffUsersLinkedToClients(resolvedClientIds);
  if (staffOnClients.length > 0) {
    const details = staffOnClients.map((user) => `${user.email} (${user.role})`).join(", ");
    throw new Error(`Refusing to delete clients linked to staff users: ${details}`);
  }

  const matchedClients = resolvedClientIds.length
    ? await prisma.client.findMany({
        where: { id: { in: resolvedClientIds } },
        select: { id: true, companyName: true, primaryContactEmail: true },
        orderBy: { companyName: "asc" },
      })
    : [];

  const matchedUsers = resolvedClientIds.length
    ? await prisma.user.findMany({
        where: {
          OR: [
            { clientId: { in: resolvedClientIds }, role: "client" },
            { id: { in: [...clientUserIds] }, role: "client" },
          ],
        },
        select: { id: true, email: true, role: true, clientId: true },
        orderBy: { email: "asc" },
      })
    : await prisma.user.findMany({
        where: { id: { in: [...clientUserIds] }, role: "client" },
        select: { id: true, email: true, role: true, clientId: true },
        orderBy: { email: "asc" },
      });

  for (const user of matchedUsers) {
    clientUserIds.add(user.id);
    if (protectedUserEmails.has(normalizeEmail(user.email))) {
      throw new Error(`Refusing to delete protected client user: ${user.email}`);
    }
  }

  return {
    clientIds: resolvedClientIds,
    clientUserIds: [...clientUserIds],
    orphanedPurchaseIds: [...orphanedPurchaseIds],
    snapshotLeadIds: [],
    matchedClients,
    matchedUsers,
    matchedSnapshotLeads: [],
    skippedProtectedEmails: [...skippedProtectedEmails],
    skippedProtectedSnapshotEmails: [],
  };
}

const snapshotLeadSelect = {
  id: true,
  email: true,
  contactName: true,
  companyName: true,
  status: true,
  totalScore: true,
  createdAt: true,
} as const;

async function resolveSnapshotLeads(
  opts: CliOptions,
  scope: Omit<
    CleanupScope,
    "snapshotLeadIds" | "matchedSnapshotLeads" | "skippedProtectedSnapshotEmails"
  >,
): Promise<Pick<CleanupScope, "snapshotLeadIds" | "matchedSnapshotLeads" | "skippedProtectedSnapshotEmails">> {
  if (!opts.includeSnapshotLeads) {
    return {
      snapshotLeadIds: [],
      matchedSnapshotLeads: [],
      skippedProtectedSnapshotEmails: [],
    };
  }

  const protectedSnapshotEmails = protectedSnapshotLeadEmails();
  const snapshotLeadIds = new Set<string>();
  const skippedProtectedSnapshotEmails = new Set<string>();

  const includeLead = (email: string, id: string) => {
    const normalized = normalizeEmail(email);
    if (protectedSnapshotEmails.has(normalized)) {
      skippedProtectedSnapshotEmails.add(normalized);
      return;
    }
    snapshotLeadIds.add(id);
  };

  if (opts.email) {
    const email = normalizeEmail(opts.email);
    assertNotProtectedEmail(email, protectedSnapshotEmails);

    const leads = await prisma.technologySnapshotLead.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      select: snapshotLeadSelect,
    });
    for (const lead of leads) includeLead(lead.email, lead.id);
  } else if (opts.pattern) {
    const leads = await prisma.$queryRaw<
      Array<{
        id: string;
        email: string;
        contactName: string;
        companyName: string;
        status: string;
        totalScore: number;
        createdAt: Date;
      }>
    >`
      SELECT id, email, "contactName", "companyName", status, "totalScore", "createdAt"
      FROM "TechnologySnapshotLead"
      WHERE email ILIKE ${opts.pattern}
    `;
    for (const lead of leads) includeLead(lead.email, lead.id);
  } else if (opts.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: opts.clientId },
      select: { primaryContactEmail: true },
    });
    if (client) {
      const email = normalizeEmail(client.primaryContactEmail);
      const leads = await prisma.technologySnapshotLead.findMany({
        where: { email: { equals: email, mode: "insensitive" } },
        select: snapshotLeadSelect,
      });
      for (const lead of leads) includeLead(lead.email, lead.id);
    }
  } else if (opts.allTest) {
    // Mirror test-customer emails from the client scope, then apply explicit test patterns.
    // Does NOT blanket-delete every snapshot lead — see printSnapshotSelectionRules().
    const testEmails = new Set<string>();
    for (const client of scope.matchedClients) {
      testEmails.add(normalizeEmail(client.primaryContactEmail));
    }
    for (const user of scope.matchedUsers) {
      testEmails.add(normalizeEmail(user.email));
    }

    const patterns = testSnapshotEmailPatterns();
    const leads = await prisma.technologySnapshotLead.findMany({
      select: snapshotLeadSelect,
    });

    for (const lead of leads) {
      const normalized = normalizeEmail(lead.email);
      if (protectedSnapshotEmails.has(normalized)) {
        skippedProtectedSnapshotEmails.add(normalized);
        continue;
      }
      if (testEmails.has(normalized)) {
        snapshotLeadIds.add(lead.id);
        continue;
      }
      if (patterns.some((pattern) => emailMatchesIlike(normalized, pattern))) {
        snapshotLeadIds.add(lead.id);
      }
    }
  }

  const matchedSnapshotLeads =
    snapshotLeadIds.size > 0
      ? await prisma.technologySnapshotLead.findMany({
          where: { id: { in: [...snapshotLeadIds] } },
          select: snapshotLeadSelect,
          orderBy: [{ createdAt: "desc" }, { email: "asc" }],
        })
      : [];

  return {
    snapshotLeadIds: [...snapshotLeadIds],
    matchedSnapshotLeads,
    skippedProtectedSnapshotEmails: [...skippedProtectedSnapshotEmails],
  };
}

async function countDeletions(scope: CleanupScope): Promise<DeletionCounts> {
  const { clientIds, clientUserIds, orphanedPurchaseIds, snapshotLeadIds } = scope;
  const assessmentIds =
    clientIds.length > 0
      ? (
          await prisma.assessment.findMany({
            where: { clientId: { in: clientIds } },
            select: { id: true },
          })
        ).map((row) => row.id)
      : [];

  const counts: DeletionCounts = {
    AccountActivationToken: clientUserIds.length
      ? await prisma.accountActivationToken.count({ where: { userId: { in: clientUserIds } } })
      : 0,
    AssessmentPurchase:
      (clientIds.length
        ? await prisma.assessmentPurchase.count({
            where: {
              OR: [
                { clientId: { in: clientIds } },
                ...(clientUserIds.length ? [{ userId: { in: clientUserIds } }] : []),
              ],
            },
          })
        : 0) + orphanedPurchaseIds.length,
    RecommendationAssessmentTrigger: clientIds.length
      ? await prisma.recommendationAssessmentTrigger.count({
          where: {
            OR: [
              { recommendation: { clientId: { in: clientIds } } },
              { assessment: { clientId: { in: clientIds } } },
            ],
          },
        })
      : 0,
    Note: clientIds.length
      ? await prisma.note.count({ where: { clientId: { in: clientIds } } })
      : 0,
    Document: clientIds.length
      ? await prisma.document.count({ where: { clientId: { in: clientIds } } })
      : 0,
    Project: clientIds.length
      ? await prisma.project.count({ where: { clientId: { in: clientIds } } })
      : 0,
    AssessmentRecommendation: clientIds.length
      ? await prisma.assessmentRecommendation.count({ where: { clientId: { in: clientIds } } })
      : 0,
    TechnologyImprovementPlan: clientIds.length
      ? await prisma.technologyImprovementPlan.count({ where: { clientId: { in: clientIds } } })
      : 0,
    QuarterlyBusinessReview: clientIds.length
      ? await prisma.quarterlyBusinessReview.count({ where: { clientId: { in: clientIds } } })
      : 0,
    AssessmentResponse: assessmentIds.length
      ? await prisma.assessmentResponse.count({ where: { assessmentId: { in: assessmentIds } } })
      : 0,
    AssessmentCategoryScore: assessmentIds.length
      ? await prisma.assessmentCategoryScore.count({ where: { assessmentId: { in: assessmentIds } } })
      : 0,
    ClientScoreHistory: clientIds.length
      ? await prisma.clientScoreHistory.count({ where: { clientId: { in: clientIds } } })
      : 0,
    TechnologyProfileSnapshot: clientIds.length
      ? await prisma.technologyProfileSnapshot.count({ where: { clientId: { in: clientIds } } })
      : 0,
    Assessment: assessmentIds.length,
    TechnologyProfile: clientIds.length
      ? await prisma.technologyProfile.count({ where: { clientId: { in: clientIds } } })
      : 0,
    User_client: clientUserIds.length,
    Client: clientIds.length,
    TechnologySnapshotLead: snapshotLeadIds.length,
  };

  return counts;
}

function incrementCount(counts: DeletionCounts, key: string, value: number): void {
  counts[key] = (counts[key] ?? 0) + value;
}

async function deleteScopedData(scope: CleanupScope): Promise<DeletionCounts> {
  const { clientIds, clientUserIds, orphanedPurchaseIds, snapshotLeadIds } = scope;
  const counts: DeletionCounts = {};

  await prisma.$transaction(async (tx) => {
    if (
      clientIds.length === 0 &&
      orphanedPurchaseIds.length === 0 &&
      snapshotLeadIds.length === 0
    ) {
      return;
    }

    const assessmentIds =
      clientIds.length > 0
        ? (
            await tx.assessment.findMany({
              where: { clientId: { in: clientIds } },
              select: { id: true },
            })
          ).map((row) => row.id)
        : [];

    if (clientUserIds.length > 0) {
      const result = await tx.accountActivationToken.deleteMany({
        where: { userId: { in: clientUserIds } },
      });
      incrementCount(counts, "AccountActivationToken", result.count);
    }

    if (clientIds.length > 0) {
      const triggerResult = await tx.recommendationAssessmentTrigger.deleteMany({
        where: {
          OR: [
            { recommendation: { clientId: { in: clientIds } } },
            { assessment: { clientId: { in: clientIds } } },
          ],
        },
      });
      incrementCount(counts, "RecommendationAssessmentTrigger", triggerResult.count);

      const noteResult = await tx.note.deleteMany({ where: { clientId: { in: clientIds } } });
      incrementCount(counts, "Note", noteResult.count);

      const documentResult = await tx.document.deleteMany({ where: { clientId: { in: clientIds } } });
      incrementCount(counts, "Document", documentResult.count);

      const projectResult = await tx.project.deleteMany({ where: { clientId: { in: clientIds } } });
      incrementCount(counts, "Project", projectResult.count);

      const recommendationResult = await tx.assessmentRecommendation.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      incrementCount(counts, "AssessmentRecommendation", recommendationResult.count);

      const tipResult = await tx.technologyImprovementPlan.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      incrementCount(counts, "TechnologyImprovementPlan", tipResult.count);

      const qbrResult = await tx.quarterlyBusinessReview.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      incrementCount(counts, "QuarterlyBusinessReview", qbrResult.count);

      if (assessmentIds.length > 0) {
        const responseResult = await tx.assessmentResponse.deleteMany({
          where: { assessmentId: { in: assessmentIds } },
        });
        incrementCount(counts, "AssessmentResponse", responseResult.count);

        const categoryScoreResult = await tx.assessmentCategoryScore.deleteMany({
          where: { assessmentId: { in: assessmentIds } },
        });
        incrementCount(counts, "AssessmentCategoryScore", categoryScoreResult.count);
      }

      const scoreHistoryResult = await tx.clientScoreHistory.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      incrementCount(counts, "ClientScoreHistory", scoreHistoryResult.count);

      const snapshotResult = await tx.technologyProfileSnapshot.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      incrementCount(counts, "TechnologyProfileSnapshot", snapshotResult.count);
    }

    const purchaseResult = await tx.assessmentPurchase.deleteMany({
      where: {
        OR: [
          ...(clientIds.length ? [{ clientId: { in: clientIds } }] : []),
          ...(clientUserIds.length ? [{ userId: { in: clientUserIds } }] : []),
          ...(orphanedPurchaseIds.length ? [{ id: { in: orphanedPurchaseIds } }] : []),
        ],
      },
    });
    incrementCount(counts, "AssessmentPurchase", purchaseResult.count);

    if (clientIds.length > 0) {
      await tx.technologyProfile.updateMany({
        where: { clientId: { in: clientIds } },
        data: { currentAssessmentId: null },
      });

      if (assessmentIds.length > 0) {
        await tx.assessment.updateMany({
          where: { id: { in: assessmentIds } },
          data: { sourceAssessmentId: null },
        });

        const assessmentResult = await tx.assessment.deleteMany({
          where: { id: { in: assessmentIds } },
        });
        incrementCount(counts, "Assessment", assessmentResult.count);
      }

      const profileResult = await tx.technologyProfile.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      incrementCount(counts, "TechnologyProfile", profileResult.count);

      if (clientUserIds.length > 0) {
        const userResult = await tx.user.deleteMany({
          where: {
            id: { in: clientUserIds },
            role: "client",
          },
        });
        incrementCount(counts, "User_client", userResult.count);
      }

      const clientResult = await tx.client.deleteMany({ where: { id: { in: clientIds } } });
      incrementCount(counts, "Client", clientResult.count);
    }

    if (snapshotLeadIds.length > 0) {
      const snapshotLeadResult = await tx.technologySnapshotLead.deleteMany({
        where: { id: { in: snapshotLeadIds } },
      });
      incrementCount(counts, "TechnologySnapshotLead", snapshotLeadResult.count);
    }
  });

  return counts;
}

function printScope(scope: CleanupScope): void {
  console.log("\nMatched clients:");
  if (scope.matchedClients.length === 0) {
    console.log("  (none)");
  } else {
    for (const client of scope.matchedClients) {
      console.log(`  - ${client.companyName} <${client.primaryContactEmail}> [${client.id}]`);
    }
  }

  console.log("\nMatched client users:");
  if (scope.matchedUsers.length === 0) {
    console.log("  (none)");
  } else {
    for (const user of scope.matchedUsers) {
      console.log(`  - ${user.email} [${user.id}] clientId=${user.clientId ?? "null"}`);
    }
  }

  if (scope.orphanedPurchaseIds.length > 0) {
    console.log(`\nOrphaned purchases (no client): ${scope.orphanedPurchaseIds.length}`);
  }

  if (scope.skippedProtectedEmails.length > 0) {
    console.log(
      `\nSkipped protected emails: ${scope.skippedProtectedEmails.sort().join(", ")}`,
    );
  }
}

function printSnapshotScope(scope: CleanupScope, includeSnapshotLeads: boolean): void {
  if (!includeSnapshotLeads) return;

  console.log("\nMatched Technology Snapshot leads (free funnel — TechnologySnapshotLead):");
  if (scope.matchedSnapshotLeads.length === 0) {
    console.log("  (none)");
  } else {
    for (const lead of scope.matchedSnapshotLeads) {
      console.log(
        `  - ${lead.contactName} @ ${lead.companyName} <${lead.email}> score=${lead.totalScore} status=${lead.status} [${lead.id}]`,
      );
    }
    console.log(
      "    (each row includes embedded answers JSON, score/classification, and conversion status)",
    );
  }

  if (scope.skippedProtectedSnapshotEmails.length > 0) {
    console.log(
      `\nSkipped protected snapshot emails: ${scope.skippedProtectedSnapshotEmails.sort().join(", ")}`,
    );
  }
}

function printSnapshotSelectionRules(opts: CliOptions): void {
  if (!opts.includeSnapshotLeads) return;

  console.log("\nTechnology Snapshot selection rules:");
  if (opts.email) {
    console.log("  --email: snapshot leads with the same email address");
  } else if (opts.pattern) {
    console.log("  --pattern: snapshot leads whose email matches ILIKE pattern (protected emails skipped)");
  } else if (opts.clientId) {
    console.log("  --client-id: snapshot leads whose email matches the client primaryContactEmail");
  } else if (opts.allTest) {
    console.log("  --all-test: snapshot leads are test data ONLY when:");
    console.log("    1. email matches a test client/user selected for deletion, OR");
    console.log("    2. email matches TEST_SNAPSHOT_EMAIL_PATTERNS (ILIKE)");
    console.log(`       defaults: ${DEFAULT_TEST_SNAPSHOT_EMAIL_PATTERNS.join(", ")}`);
    console.log("    Protected emails (never deleted): PROTECTED_USER_EMAILS + PROTECTED_SNAPSHOT_LEAD_EMAILS");
    console.log("    Legitimate production leads outside those patterns are preserved.");
  }
}

function printCounts(title: string, counts: DeletionCounts): void {
  console.log(`\n${title}`);
  const order = [
    "AccountActivationToken",
    "AssessmentPurchase",
    "RecommendationAssessmentTrigger",
    "Note",
    "Document",
    "Project",
    "AssessmentRecommendation",
    "TechnologyImprovementPlan",
    "QuarterlyBusinessReview",
    "AssessmentResponse",
    "AssessmentCategoryScore",
    "ClientScoreHistory",
    "TechnologyProfileSnapshot",
    "Assessment",
    "TechnologyProfile",
    "User_client",
    "Client",
    "TechnologySnapshotLead",
  ];

  let total = 0;
  for (const key of order) {
    const value = counts[key] ?? 0;
    if (value > 0) {
      console.log(`  ${key}: ${value}`);
      total += value;
    }
  }
  console.log(`  TOTAL ROWS: ${total}`);
}

function printProtectedSummary(): void {
  console.log("\nProtected system records (never deleted by this script):");
  console.log("  Users with role admin or technician");
  console.log(`  Default protected emails: ${DEFAULT_PROTECTED_EMAILS.join(", ")}`);
  console.log("  Optional env PROTECTED_USER_EMAILS, PROTECTED_CLIENT_EMAILS");
  console.log("  Optional env PROTECTED_SNAPSHOT_LEAD_EMAILS, TEST_SNAPSHOT_EMAIL_PATTERNS");
  console.log("  AssessmentCategory, AssessmentQuestion, AnswerOption");
  console.log("  RecommendationTemplate");
  console.log("  TechnologyProfileSnapshot (paid client profiles — not free snapshot leads)");
  console.log("  Service catalog, technology catalog, playbooks (JSON files, not in DB)");
  console.log("  Prisma migrations / schema");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  validateSelector(opts);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const clientScope = await resolveScope(opts);
  const snapshotScope = await resolveSnapshotLeads(opts, clientScope);
  const scope: CleanupScope = { ...clientScope, ...snapshotScope };
  const counts = await countDeletions(scope);

  console.log("StackScore test-data cleanup");
  console.log(`Mode: ${opts.confirm ? "DELETE" : "DRY RUN"}`);
  if (opts.includeSnapshotLeads) {
    console.log("Snapshot leads: included");
  }
  printScope(scope);
  printSnapshotScope(scope, opts.includeSnapshotLeads);
  printSnapshotSelectionRules(opts);
  printCounts("Rows that would be deleted:", counts);
  printProtectedSummary();

  const totalRows = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (totalRows === 0) {
    console.log("\nNothing matched the selector. No changes made.");
    return;
  }

  if (!opts.confirm) {
    console.log("\nDry run complete. Re-run with --confirm to delete.");
    return;
  }

  if (opts.dryRun) {
    console.log("\nBoth --dry-run and --confirm were passed; refusing to delete.");
    return;
  }

  if (process.env.REQUIRE_PRODUCTION_CLEANUP_ACK === "true" && !process.env.ALLOW_PRODUCTION_CLEANUP) {
    throw new Error(
      "Set ALLOW_PRODUCTION_CLEANUP=true to confirm production cleanup (REQUIRE_PRODUCTION_CLEANUP_ACK is enabled).",
    );
  }

  console.log("\nDeleting...");
  const deleted = await deleteScopedData(scope);
  printCounts("Deleted rows:", deleted);
  if (opts.includeSnapshotLeads && (deleted.TechnologySnapshotLead ?? 0) > 0) {
    console.log(
      `\nTechnology Snapshot summary: removed ${deleted.TechnologySnapshotLead} lead row(s) ` +
        "(contact info, questionnaire answers, computed scores, and conversion status).",
    );
  }
  console.log("\nCleanup complete.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
