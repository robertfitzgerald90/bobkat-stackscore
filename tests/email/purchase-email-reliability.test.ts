import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;

const { resendSend, constructEvent, fulfillVcioCheckoutSession, recordStripePayment, prismaState } =
  vi.hoisted(() => ({
    resendSend: vi.fn(),
    constructEvent: vi.fn(),
    fulfillVcioCheckoutSession: vi.fn(async () => undefined),
    recordStripePayment: vi.fn(async () => ({ id: "pay_1" })),
    prismaState: {
      tables: {
        client: [] as Row[],
        user: [] as Row[],
        assessment: [] as Row[],
        assessmentPurchase: [] as Row[],
        accountActivationToken: [] as Row[],
        communicationMessage: [] as Row[],
        communicationEvent: [] as Row[],
        organizationActivityEvent: [] as Row[],
        stripeWebhookEvent: [] as Row[],
        invoice: [] as Row[],
        billingDeposit: [] as Row[],
        communicationTemplateVersion: [] as Row[],
        communicationWorkflowSettings: [] as Row[],
        communicationBrandSettings: [] as Row[],
      },
    },
  }));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: (...args: unknown[]) => resendSend(...args),
    };
  },
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripe: () => ({
    webhooks: { constructEvent },
    subscriptions: {
      retrieve: async (id: string) => ({
        id,
        metadata: {},
        items: { data: [{ price: { id: "price_other" } }] },
      }),
    },
  }),
}));

vi.mock("@/lib/vcio/subscriptions", () => ({
  fulfillVcioCheckoutSession,
  syncVcioSubscriptionFromStripe: vi.fn(async () => undefined),
}));

vi.mock("@/lib/vcio/invoices", () => ({
  markVcioInvoiceActionRequired: vi.fn(),
  markVcioInvoicePaymentFailed: vi.fn(),
  markVcioInvoiceVoided: vi.fn(),
  markVcioPaymentAttemptRefundedFromCharge: vi.fn(),
  syncVcioInvoiceFromStripe: vi.fn(),
}));

vi.mock("@/lib/billing/payment-service", () => ({
  recordStripePayment,
}));

vi.mock("@/lib/billing/audit", () => ({
  recordBillingAudit: vi.fn(async () => undefined),
}));

function matches(row: Row | undefined, where: Record<string, unknown> | undefined): boolean {
  if (!row || !where) return Boolean(row);
  if (Array.isArray(where.OR)) {
    return where.OR.some((clause) => matches(row, clause as Record<string, unknown>));
  }
  if (Array.isArray(where.AND)) {
    return where.AND.every((clause) => matches(row, clause as Record<string, unknown>));
  }
  return Object.entries(where).every(([key, expected]) => {
    if (expected === null) return row[key] == null;
    if (expected && typeof expected === "object" && !Array.isArray(expected) && !(expected instanceof Date)) {
      const filter = expected as { in?: unknown[]; startsWith?: string };
      if (filter.in) return filter.in.includes(row[key]);
      if (typeof filter.startsWith === "string") {
        return String(row[key] ?? "").startsWith(filter.startsWith);
      }
      return false;
    }
    return row[key] === expected;
  });
}

function present(name: string, row: Row | null): Row | null {
  if (!row) return null;
  const copy = { ...row };
  if (name === "assessment") {
    const client = prismaState.tables.client.find((item) => item.id === row.clientId);
    copy.client = client
      ? {
          ...client,
          users: prismaState.tables.user.filter((user) => user.clientId === client.id).slice(0, 1),
        }
      : null;
  }
  if (name === "assessmentPurchase") {
    copy.user = prismaState.tables.user.find((user) => user.id === row.userId) ?? null;
  }
  return copy;
}

function model(name: keyof typeof prismaState.tables) {
  const rows = () => prismaState.tables[name];
  return {
    findUnique: async ({ where }: { where: Record<string, unknown> }) =>
      present(name, rows().find((row) => matches(row, where)) ?? null),
    findFirst: async ({ where }: { where?: Record<string, unknown> } = {}) =>
      present(name, rows().find((row) => matches(row, where)) ?? null),
    findMany: async ({ where }: { where?: Record<string, unknown> } = {}) =>
      rows()
        .filter((row) => matches(row, where))
        .map((row) => present(name, row)),
    create: async ({ data }: { data: Row }) => {
      const row: Row = {
        id: typeof data.id === "string" ? data.id : `${name}-${rows().length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      rows().push(row);
      return present(name, row);
    },
    update: async ({ where, data }: { where: Record<string, unknown>; data: Row }) => {
      const row = rows().find((item) => matches(item, where));
      if (!row) throw new Error(`Missing ${name}`);
      Object.assign(row, data, { updatedAt: new Date() });
      return present(name, row);
    },
    updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Row }) => {
      const found = rows().filter((item) => matches(item, where));
      for (const row of found) Object.assign(row, data);
      return { count: found.length };
    },
  };
}

vi.mock("@/lib/db", () => {
  const prisma = {
    client: model("client"),
    user: model("user"),
    assessment: model("assessment"),
    assessmentPurchase: model("assessmentPurchase"),
    accountActivationToken: model("accountActivationToken"),
    communicationMessage: model("communicationMessage"),
    communicationEvent: model("communicationEvent"),
    organizationActivityEvent: model("organizationActivityEvent"),
    stripeWebhookEvent: model("stripeWebhookEvent"),
    invoice: model("invoice"),
    billingDeposit: model("billingDeposit"),
    communicationTemplateVersion: model("communicationTemplateVersion"),
    communicationWorkflowSettings: model("communicationWorkflowSettings"),
    communicationBrandSettings: model("communicationBrandSettings"),
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma),
  };
  return { prisma };
});

import { sendEmail } from "@/lib/email/send";
import { recordAndSendCommunication } from "@/lib/communications/tracking/record-outbound";
import { POST } from "@/app/api/webhooks/stripe/route";

const RECIPIENT = "purchaser.secret@example.com";
const ACTIVATION_TOKEN = "act_test_token_9f3c";
const BODY_MARKER = "EMAIL_BODY_MARKER_secret";
const ACTIVATION_URL = `https://stackscore.test/activate-account?token=${ACTIVATION_TOKEN}`;

const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};

function captureLogs() {
  const lines: string[] = [];
  const record = (...args: unknown[]) => {
    lines.push(
      args
        .map((value) => {
          if (typeof value === "string") return value;
          if (value instanceof Error) return `${value.name}: ${value.message}`;
          try {
            return JSON.stringify(value);
          } catch {
            return String(value);
          }
        })
        .join(" "),
    );
  };
  vi.spyOn(console, "info").mockImplementation(record);
  vi.spyOn(console, "warn").mockImplementation(record);
  vi.spyOn(console, "error").mockImplementation(record);
  return lines;
}

function resetTables() {
  for (const rows of Object.values(prismaState.tables)) rows.length = 0;
}

function webhookRequest() {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=test" },
    body: "{}",
  });
}

function checkoutEvent(input: {
  id: string;
  sessionId: string;
  productType: string;
  email?: string;
  type?: string;
}) {
  return {
    id: input.id,
    type: input.type ?? "checkout.session.completed",
    created: 1_700_000_000,
    data: {
      object: {
        id: input.sessionId,
        object: "checkout.session",
        payment_status: "paid",
        mode: input.productType === "stackscore_vcio" ? "subscription" : "payment",
        customer_details: { email: input.email ?? RECIPIENT, name: "Pat Lee" },
        customer_email: input.email ?? RECIPIENT,
        metadata: {
          productType: input.productType,
          ...(input.productType === "stackscore_invoice"
            ? { invoiceId: "inv_1", clientId: "client_1" }
            : {}),
        },
        amount_total: 5000,
        currency: "usd",
        payment_intent: "pi_1",
        customer: "cus_1",
      },
    },
  };
}

beforeEach(() => {
  resetTables();
  resendSend.mockReset();
  constructEvent.mockReset();
  fulfillVcioCheckoutSession.mockClear();
  recordStripePayment.mockClear();
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.EMAIL_FROM = "StackScore <onboarding@bobkatit.com>";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

afterEach(() => {
  vi.restoreAllMocks();
  if (originalEnv.RESEND_API_KEY === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
  if (originalEnv.EMAIL_FROM === undefined) delete process.env.EMAIL_FROM;
  else process.env.EMAIL_FROM = originalEnv.EMAIL_FROM;
  if (originalEnv.STRIPE_WEBHOOK_SECRET === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = originalEnv.STRIPE_WEBHOOK_SECRET;
});

describe("purchase email logging", () => {
  it("does not log activation tokens, email bodies, or full recipient addresses", async () => {
    resendSend.mockResolvedValue({ data: { id: "re_msg_1" }, error: null });
    const logs = captureLogs();

    await sendEmail({
      to: RECIPIENT,
      subject: "Activate your StackScore account",
      html: `<p>${BODY_MARKER}</p><a href="${ACTIVATION_URL}">Activate</a>`,
      text: `${BODY_MARKER} ${ACTIVATION_URL}`,
    });

    const emitted = logs.join("\n");
    expect(emitted).toContain("[purchase-trace]");
    expect(emitted).toContain("re_msg_1");
    expect(emitted).not.toContain(ACTIVATION_TOKEN);
    expect(emitted).not.toContain(ACTIVATION_URL);
    expect(emitted).not.toContain(BODY_MARKER);
    expect(emitted).not.toContain(RECIPIENT);
    expect(emitted).not.toContain("<p>");
  });
});

describe("missing Resend configuration", () => {
  it("does not record SENT or DELIVERED and does not call Resend", async () => {
    delete process.env.RESEND_API_KEY;
    resendSend.mockResolvedValue({ data: { id: "re_should_not_send" }, error: null });

    let result: Awaited<ReturnType<typeof recordAndSendCommunication>> | undefined;
    try {
      result = await recordAndSendCommunication({
        to: RECIPIENT,
        subject: "Activate your StackScore account",
        html: "<p>activation body</p>",
        text: "activation body",
        templateKey: "EMAIL-001",
        eventKey: "ACCOUNT_ACTIVATION_CREATED",
        idempotencyKey: "account-activation:user-1:assessment-1",
      });
    } catch {
      result = undefined;
    }

    expect(resendSend).not.toHaveBeenCalled();
    const stored = prismaState.tables.communicationMessage[0];
    expect(stored).toBeTruthy();
    expect(stored?.status).toBe("FAILED");
    expect(stored?.status).not.toBe("SENT");
    expect(stored?.status).not.toBe("DELIVERED");
    if (result) {
      expect(result.delivered).toBe(false);
      expect(result.status).toBe("FAILED");
      expect(result.status).not.toBe("SENT");
      expect(result.status).not.toBe("DELIVERED");
    }
  });
});

describe("purchase email retry and webhook routing", () => {
  it("retries a failed purchase email without duplicating the purchase or a successful send", async () => {
    resendSend
      .mockRejectedValueOnce(new Error("Resend unavailable"))
      .mockResolvedValue({ data: { id: "re_msg_retry" }, error: null });
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "evt_assess_1",
        sessionId: "cs_assess_1",
        productType: "technology_assessment",
      }),
    );

    const first = await POST(webhookRequest());
    expect(first.status).toBe(200);
    expect(prismaState.tables.assessmentPurchase).toHaveLength(1);
    expect(prismaState.tables.assessment).toHaveLength(1);
    expect(prismaState.tables.communicationMessage).toHaveLength(1);
    expect(prismaState.tables.communicationMessage[0]?.status).toBe("FAILED");
    expect(prismaState.tables.communicationMessage[0]?.templateKey).toBe("EMAIL-001");
    expect(resendSend).toHaveBeenCalledTimes(1);

    const second = await POST(webhookRequest());
    expect(second.status).toBe(200);
    expect(prismaState.tables.assessmentPurchase).toHaveLength(1);
    expect(prismaState.tables.assessment).toHaveLength(1);
    expect(prismaState.tables.client).toHaveLength(1);
    expect(prismaState.tables.communicationMessage).toHaveLength(1);
    expect(prismaState.tables.communicationMessage[0]?.status).toBe("SENT");
    expect(prismaState.tables.communicationMessage[0]?.status).not.toBe("DELIVERED");
    expect(resendSend).toHaveBeenCalledTimes(2);

    const third = await POST(webhookRequest());
    expect(third.status).toBe(200);
    expect(prismaState.tables.assessmentPurchase).toHaveLength(1);
    expect(prismaState.tables.assessment).toHaveLength(1);
    expect(prismaState.tables.communicationMessage).toHaveLength(1);
    expect(resendSend).toHaveBeenCalledTimes(2);
  });

  it("does not send an activation email for staff-email manual review", async () => {
    prismaState.tables.user.push({
      id: "user-staff",
      email: "staff.admin@example.com",
      role: "admin",
      clientId: null,
      isActive: true,
      name: "Staff Admin",
    });
    resendSend.mockResolvedValue({ data: { id: "re_should_not_send" }, error: null });
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "evt_staff_1",
        sessionId: "cs_staff_1",
        productType: "technology_assessment",
        email: "staff.admin@example.com",
      }),
    );

    const response = await POST(webhookRequest());
    expect(response.status).toBe(200);
    expect(prismaState.tables.assessmentPurchase).toHaveLength(1);
    expect(prismaState.tables.assessmentPurchase[0]?.status).toBe("manual_review");
    expect(prismaState.tables.assessment).toHaveLength(0);
    expect(resendSend).not.toHaveBeenCalled();
  });

  it("sends the assessment-ready email to an existing active client", async () => {
    prismaState.tables.client.push({
      id: "client-existing",
      companyName: "Acme",
      status: "active",
    });
    prismaState.tables.user.push({
      id: "user-active",
      email: "active.client@example.com",
      role: "client",
      clientId: "client-existing",
      isActive: true,
      name: "Active Client",
    });
    resendSend.mockResolvedValue({ data: { id: "re_ready" }, error: null });
    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "evt_ready_1",
        sessionId: "cs_ready_1",
        productType: "technology_assessment",
        email: "active.client@example.com",
      }),
    );

    const response = await POST(webhookRequest());
    expect(response.status).toBe(200);
    expect(prismaState.tables.assessmentPurchase).toHaveLength(1);
    expect(prismaState.tables.assessment).toHaveLength(1);
    expect(prismaState.tables.communicationMessage).toHaveLength(1);
    expect(prismaState.tables.communicationMessage[0]?.templateKey).toBe("LEGACY-ASSESSMENT-READY");
    expect(prismaState.tables.communicationMessage[0]?.status).toBe("SENT");
    expect(resendSend).toHaveBeenCalledTimes(1);
  });

  it("keeps vCIO checkout, invoice payment, and subscription events off assessment fulfillment", async () => {
    prismaState.tables.invoice.push({
      id: "inv_1",
      clientId: "client_1",
      stripePaymentIntentId: null,
    });
    resendSend.mockResolvedValue({ data: { id: "re_should_not_send" }, error: null });

    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "evt_vcio_1",
        sessionId: "cs_vcio_1",
        productType: "stackscore_vcio",
        email: "vcio.buyer@example.com",
      }),
    );
    expect((await POST(webhookRequest())).status).toBe(200);

    constructEvent.mockReturnValue(
      checkoutEvent({
        id: "evt_invoice_1",
        sessionId: "cs_invoice_1",
        productType: "stackscore_invoice",
        email: "billing.contact@example.com",
      }),
    );
    expect((await POST(webhookRequest())).status).toBe(200);

    constructEvent.mockReturnValue({
      id: "evt_sub_1",
      type: "customer.subscription.updated",
      created: 1_700_000_000,
      data: {
        object: {
          id: "sub_1",
          object: "subscription",
          metadata: {},
          items: { data: [{ price: { id: "price_other" } }] },
        },
      },
    });
    expect((await POST(webhookRequest())).status).toBe(200);

    expect(fulfillVcioCheckoutSession).toHaveBeenCalledTimes(1);
    expect(recordStripePayment).toHaveBeenCalledTimes(1);
    expect(prismaState.tables.assessmentPurchase).toHaveLength(0);
    expect(prismaState.tables.assessment).toHaveLength(0);
    expect(resendSend).not.toHaveBeenCalled();
  });
});
