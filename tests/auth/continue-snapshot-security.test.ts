import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { CONTINUE_SNAPSHOT_PUBLIC_MESSAGE } from "@/lib/communications/outreach/continue-snapshot-messages";

const prismaMock = vi.hoisted(() => ({
  technologySnapshotLead: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
  },
  assessment: {
    findFirst: vi.fn(),
  },
  prospect: {
    findUnique: vi.fn(),
  },
  campaignRecipient: {
    findFirst: vi.fn(),
  },
  accountActivationToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}));

const provisionMock = vi.hoisted(() => ({
  provisionInviteWorkspace: vi.fn(),
}));

const contactsMock = vi.hoisted(() => ({
  ensurePrimaryContactFromClient: vi.fn(),
}));

const campaignMock = vi.hoisted(() => ({
  recordCampaignEvent: vi.fn(),
}));

const outboundMock = vi.hoisted(() => ({
  recordAndSendCommunication: vi.fn(),
}));

const emailTemplatesMock = vi.hoisted(() => ({
  buildActivationEmail: vi.fn(),
  buildAssessmentReadyEmail: vi.fn(),
  buildActivationUrls: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/communications/outreach/provisioning", () => provisionMock);
vi.mock("@/lib/communications/contacts/service", () => contactsMock);
vi.mock("@/lib/communications/outreach/campaign-sync", () => campaignMock);
vi.mock("@/lib/communications/tracking/record-outbound", () => outboundMock);
vi.mock("@/lib/email/templates/assessment-purchase", () => emailTemplatesMock);

import {
  continueSnapshotToFullAssessment,
  issueFreshActivationToken,
} from "@/lib/communications/outreach/convert-snapshot-to-assessment";
import { POST as continueAssessmentPost } from "@/app/api/v1/public/technology-snapshot/[leadId]/continue-assessment/route";

const LEAD_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const CLIENT_ID = "33333333-3333-4333-8333-333333333333";
const ASSESSMENT_ID = "44444444-4444-4444-8444-444444444444";
const ADMIN_ID = "55555555-5555-4555-8555-555555555555";

function baseLead(overrides: Record<string, unknown> = {}) {
  return {
    id: LEAD_ID,
    email: "prospect@example.com",
    contactName: "Alex Prospect",
    companyName: "Example Co",
    phone: null,
    industry: null,
    prospectId: null,
    prospect: null,
    status: "completed",
    ...overrides,
  };
}

describe("SS-SEC-002 continue-assessment security (TM-C01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    emailTemplatesMock.buildActivationEmail.mockResolvedValue({
      subject: "Activate",
      html: "<p>activate</p>",
      text: "activate",
    });
    emailTemplatesMock.buildAssessmentReadyEmail.mockResolvedValue({
      subject: "Ready",
      html: "<p>ready</p>",
      text: "ready",
    });
    emailTemplatesMock.buildActivationUrls.mockImplementation((rawToken: string) => ({
      activationUrl: `https://app.example/activate-account?token=${encodeURIComponent(rawToken)}`,
      loginUrl: "https://app.example/login",
      startUrl: "https://app.example/assessment/start",
    }));
    outboundMock.recordAndSendCommunication.mockResolvedValue({
      messageId: "msg-1",
      delivered: true,
      provider: "console",
      status: "SENT",
    });
    contactsMock.ensurePrimaryContactFromClient.mockResolvedValue(undefined);
    campaignMock.recordCampaignEvent.mockResolvedValue(undefined);
    prismaMock.technologySnapshotLead.update.mockResolvedValue({});
    prismaMock.accountActivationToken.create.mockResolvedValue({});
    prismaMock.user.findFirst.mockResolvedValue({ id: ADMIN_ID });
  });

  it("TM-C01-a: provisioned path API response has no activation token or private ids", async () => {
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.user.findUnique.mockResolvedValue(null);
    provisionMock.provisionInviteWorkspace.mockResolvedValue({
      prospectId: "prospect-1",
      clientId: CLIENT_ID,
      userId: USER_ID,
      assessmentId: ASSESSMENT_ID,
      activationToken: "should-never-appear-in-response",
      isNewProspect: true,
    });

    const result = await continueSnapshotToFullAssessment(LEAD_ID);
    const serialized = JSON.stringify(result);

    expect(result).toEqual({
      ok: true,
      message: CONTINUE_SNAPSHOT_PUBLIC_MESSAGE,
    });
    expect(serialized).not.toMatch(/activate-account/i);
    expect(serialized).not.toMatch(/token=/i);
    expect(serialized).not.toContain(CLIENT_ID);
    expect(serialized).not.toContain(ASSESSMENT_ID);
    expect(serialized).not.toContain("should-never-appear-in-response");
    expect(result).not.toHaveProperty("activationUrl");
    expect(result).not.toHaveProperty("assessmentId");
    expect(result).not.toHaveProperty("clientId");
    expect(result).not.toHaveProperty("mode");

    expect(outboundMock.recordAndSendCommunication).toHaveBeenCalledTimes(1);
    const sendArg = outboundMock.recordAndSendCommunication.mock.calls[0]![0];
    expect(sendArg.to).toBe("prospect@example.com");
    expect(sendArg.templateKey).toBe("EMAIL-001");
    expect(sendArg.html).toContain("activate");
    expect(emailTemplatesMock.buildActivationUrls).toHaveBeenCalled();
    const emailedToken = emailTemplatesMock.buildActivationUrls.mock.calls[0]![0] as string;
    expect(emailedToken).toBeTruthy();
    expect(emailedToken).not.toBe("should-never-appear-in-response");
  });

  it("TM-C01-b: activation link is delivered only via email (inbox possession)", async () => {
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.user.findUnique.mockResolvedValue(null);
    provisionMock.provisionInviteWorkspace.mockResolvedValue({
      prospectId: "prospect-1",
      clientId: CLIENT_ID,
      userId: USER_ID,
      assessmentId: ASSESSMENT_ID,
      activationToken: "unused-provision-token",
      isNewProspect: true,
    });

    const publicResult = await continueSnapshotToFullAssessment(LEAD_ID);

    expect(prismaMock.accountActivationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: USER_ID,
          tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      }),
    );

    const rawToken = emailTemplatesMock.buildActivationUrls.mock.calls[0]![0] as string;
    const expectedHash = createHash("sha256").update(rawToken).digest("hex");
    expect(prismaMock.accountActivationToken.create.mock.calls[0]![0].data.tokenHash).toBe(
      expectedHash,
    );

    // Unauthenticated caller never receives the raw token — only the mailbox does.
    expect(JSON.stringify(publicResult)).not.toContain(rawToken);
    expect(outboundMock.recordAndSendCommunication.mock.calls[0]![0].to).toBe(
      "prospect@example.com",
    );
  });

  it("TM-C01-c: existing account response is generic and does not expose assessmentId", async () => {
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      isActive: true,
      clientId: CLIENT_ID,
    });
    prismaMock.assessment.findFirst.mockResolvedValue({ id: ASSESSMENT_ID });

    const result = await continueSnapshotToFullAssessment(LEAD_ID);
    const serialized = JSON.stringify(result);

    expect(result).toEqual({
      ok: true,
      message: CONTINUE_SNAPSHOT_PUBLIC_MESSAGE,
    });
    expect(serialized).not.toContain(ASSESSMENT_ID);
    expect(serialized).not.toContain(CLIENT_ID);
    expect(result).not.toHaveProperty("loginUrl");
    expect(result).not.toHaveProperty("assessmentId");
    expect(result).not.toHaveProperty("mode");

    expect(outboundMock.recordAndSendCommunication).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "prospect@example.com",
        templateKey: "LEGACY-ASSESSMENT-READY",
      }),
    );
    expect(provisionMock.provisionInviteWorkspace).not.toHaveBeenCalled();
  });

  it("new and existing account paths return identical public messages (anti-enumeration)", async () => {
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.user.findUnique.mockResolvedValue(null);
    provisionMock.provisionInviteWorkspace.mockResolvedValue({
      prospectId: "prospect-1",
      clientId: CLIENT_ID,
      userId: USER_ID,
      assessmentId: ASSESSMENT_ID,
      activationToken: "x",
      isNewProspect: true,
    });
    const provisioned = await continueSnapshotToFullAssessment(LEAD_ID);

    vi.clearAllMocks();
    outboundMock.recordAndSendCommunication.mockResolvedValue({
      messageId: "msg-2",
      delivered: true,
      provider: "console",
      status: "SENT",
    });
    emailTemplatesMock.buildAssessmentReadyEmail.mockResolvedValue({
      subject: "Ready",
      html: "<p>ready</p>",
      text: "ready",
    });
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.technologySnapshotLead.update.mockResolvedValue({});
    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      isActive: true,
      clientId: CLIENT_ID,
    });
    prismaMock.assessment.findFirst.mockResolvedValue({ id: ASSESSMENT_ID });
    const existing = await continueSnapshotToFullAssessment(LEAD_ID);

    expect(provisioned).toEqual(existing);
  });

  it("email delivery failure does not expose activation token", async () => {
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.user.findUnique.mockResolvedValue(null);
    provisionMock.provisionInviteWorkspace.mockResolvedValue({
      prospectId: "prospect-1",
      clientId: CLIENT_ID,
      userId: USER_ID,
      assessmentId: ASSESSMENT_ID,
      activationToken: "secret-token-value",
      isNewProspect: true,
    });
    outboundMock.recordAndSendCommunication.mockRejectedValue(new Error("Resend down"));

    let caught: unknown;
    try {
      await continueSnapshotToFullAssessment(LEAD_ID);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    const message = (caught as Error).message;
    expect(message).toMatch(/Unable to send continuation email/);
    expect(message).not.toContain("secret-token-value");
    expect(message).not.toMatch(/activate-account/i);
    expect(message).not.toContain(ASSESSMENT_ID);
  });

  it("route handler never returns sensitive fields", async () => {
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.user.findUnique.mockResolvedValue(null);
    provisionMock.provisionInviteWorkspace.mockResolvedValue({
      prospectId: "prospect-1",
      clientId: CLIENT_ID,
      userId: USER_ID,
      assessmentId: ASSESSMENT_ID,
      activationToken: "route-secret",
      isNewProspect: true,
    });

    const response = await continueAssessmentPost(new Request("http://localhost"), {
      params: Promise.resolve({ leadId: LEAD_ID }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      message: CONTINUE_SNAPSHOT_PUBLIC_MESSAGE,
    });
    expect(JSON.stringify(body)).not.toContain("route-secret");
    expect(body).not.toHaveProperty("activationUrl");
  });

  it("issueFreshActivationToken stores only the hash", async () => {
    const issued = await issueFreshActivationToken(USER_ID);
    expect(issued.rawToken).toBeTruthy();
    expect(issued.tokenHash).toBe(createHash("sha256").update(issued.rawToken).digest("hex"));
    expect(prismaMock.accountActivationToken.create).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        tokenHash: issued.tokenHash,
        expiresAt: expect.any(Date),
      },
    });
  });

  it("buildActivationUrls uses environment app URL (via template helper)", async () => {
    prismaMock.technologySnapshotLead.findUnique.mockResolvedValue(baseLead());
    prismaMock.user.findUnique.mockResolvedValue(null);
    provisionMock.provisionInviteWorkspace.mockResolvedValue({
      prospectId: "prospect-1",
      clientId: CLIENT_ID,
      userId: USER_ID,
      assessmentId: ASSESSMENT_ID,
      activationToken: "x",
      isNewProspect: true,
    });

    await continueSnapshotToFullAssessment(LEAD_ID);
    expect(emailTemplatesMock.buildActivationUrls).toHaveBeenCalled();
  });
});
