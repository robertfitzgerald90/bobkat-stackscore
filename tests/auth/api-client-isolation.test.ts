import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { isClientVisiblePhaseProposalStatus } from "@/lib/phase-proposals";

type Role = "admin" | "technician" | "client";

type SessionFixture = {
  id: string;
  name: string;
  email: string;
  role: Role;
  clientId: string | null;
};

const sessionState = vi.hoisted(() => ({
  current: null as SessionFixture | null,
}));

const prismaMock = vi.hoisted(() => ({
  client: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  assessment: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  assessmentQuestion: { count: vi.fn() },
  assessmentRecommendation: {
    findUnique: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  phaseProposal: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

vi.mock("@/lib/auth/resolve-session-user", () => ({
  resolveSessionUserFromDb: async () => sessionState.current,
  toSessionUser: (user: SessionFixture) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }),
}));

const technologyProfile = vi.hoisted(() => ({
  getTechnologyProfileDetail: vi.fn(),
}));
vi.mock("@/lib/technology-profile", () => technologyProfile);

const reassessment = vi.hoisted(() => ({
  getClientAssessmentHistory: vi.fn(),
  createReassessment: vi.fn(),
  buildImprovementSummary: vi.fn(),
}));
vi.mock("@/lib/assessments/reassessment", () => reassessment);

const businessProfile = vi.hoisted(() => ({
  getBusinessProfile: vi.fn(),
  parseBusinessProfileUpdate: vi.fn(),
  updateBusinessProfile: vi.fn(),
}));
vi.mock("@/lib/business-profile", () => businessProfile);

const recommendationQueries = vi.hoisted(() => ({
  getRecommendationsTriggeredByAssessment: vi.fn(),
}));
vi.mock("@/lib/recommendations/queries", () => recommendationQueries);

const projectService = vi.hoisted(() => ({
  completeProjectWithNotifications: vi.fn(),
}));
vi.mock("@/lib/projects/service", () => projectService);

const qbrService = vi.hoisted(() => ({
  getQuarterlyBusinessReview: vi.fn(),
  updateQuarterlyBusinessReview: vi.fn(),
}));
vi.mock("@/lib/qbr", () => qbrService);

const commercialIntelligence = vi.hoisted(() => ({
  getCustomer360Dashboard: vi.fn(),
}));
vi.mock("@/lib/commercial-intelligence", () => commercialIntelligence);

const portfolioService = vi.hoisted(() => ({
  getPortfolioSummary: vi.fn(),
}));
vi.mock("@/lib/portfolio", () => portfolioService);

const pdfGenerate = vi.hoisted(() => ({
  generateAssessmentReportPdf: vi.fn(),
  generatePhaseProposalPdf: vi.fn(),
  generateQbrReportPdf: vi.fn(),
  generateProductOverviewPdf: vi.fn(),
}));
vi.mock("@/lib/pdf/generate", () => pdfGenerate);

import { GET as listClients, POST as createClient } from "@/app/api/v1/clients/route";
import {
  DELETE as deleteClient,
  GET as getClient,
  PATCH as patchClient,
} from "@/app/api/v1/clients/[id]/route";
import { GET as dashboardSummary } from "@/app/api/v1/dashboard/summary/route";
import { GET as listProjects } from "@/app/api/v1/projects/route";
import { GET as getProject, PATCH as patchProject } from "@/app/api/v1/projects/[id]/route";
import {
  GET as listClientProjects,
  POST as createClientProject,
} from "@/app/api/v1/clients/[id]/projects/route";
import {
  GET as listClientAssessments,
  POST as createClientAssessment,
} from "@/app/api/v1/clients/[id]/assessments/route";
import { GET as assessmentHistory } from "@/app/api/v1/clients/[id]/assessments/history/route";
import { GET as technologyProfileRoute } from "@/app/api/v1/clients/[id]/technology-profile/route";
import {
  GET as getBusinessProfileRoute,
  PATCH as patchBusinessProfile,
} from "@/app/api/v1/clients/[id]/business-profile/route";
import { GET as assessmentPdf } from "@/app/api/v1/assessments/[id]/export/pdf/route";
import { GET as assessmentImprovement } from "@/app/api/v1/assessments/[id]/improvement/route";
import { GET as assessmentRecommendations } from "@/app/api/v1/assessments/[id]/recommendations/route";
import { GET as getAssessment } from "@/app/api/v1/assessments/[id]/route";
import { PATCH as patchRecommendation } from "@/app/api/v1/recommendations/[id]/route";
import { GET as getQbr } from "@/app/api/v1/clients/[id]/qbr/[qbrId]/route";
import { GET as customer360 } from "@/app/api/v1/clients/[id]/360/route";
import { GET as listPhaseProposalsRoute } from "@/app/api/v1/clients/[id]/phase-proposals/route";
import { GET as getPhaseProposalRoute } from "@/app/api/v1/clients/[id]/phase-proposals/[proposalId]/route";
import { GET as listContacts } from "@/app/api/v1/clients/[id]/contacts/route";
import { GET as portfolioSummary } from "@/app/api/v1/portfolio/summary/route";
import { POST as completeOnboarding } from "@/app/api/v1/onboarding/route";
import { getPhaseProposalDetail } from "@/lib/phase-proposals";

const admin: SessionFixture = {
  id: "admin-1",
  name: "Ada Admin",
  email: "ada@bobkat.test",
  role: "admin",
  clientId: null,
};

const technician: SessionFixture = {
  id: "tech-1",
  name: "Theo Tech",
  email: "theo@bobkat.test",
  role: "technician",
  clientId: null,
};

const ownClient: SessionFixture = {
  id: "user-own",
  name: "Casey Client",
  email: "casey@own.test",
  role: "client",
  clientId: "client-own",
};

const OWN = "client-own";
const OTHER = "client-other";

function request(path: string, method = "GET", body?: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function params<T extends Record<string, string>>(value: T) {
  return { params: Promise.resolve(value) };
}

function resetMocks() {
  sessionState.current = null;
  const models = Object.values(prismaMock);
  for (const model of models) {
    if (typeof model === "function") {
      model.mockReset();
      continue;
    }
    for (const method of Object.values(model)) {
      method.mockReset();
    }
  }
  technologyProfile.getTechnologyProfileDetail.mockReset();
  reassessment.getClientAssessmentHistory.mockReset();
  reassessment.createReassessment.mockReset();
  reassessment.buildImprovementSummary.mockReset();
  businessProfile.getBusinessProfile.mockReset();
  businessProfile.updateBusinessProfile.mockReset();
  recommendationQueries.getRecommendationsTriggeredByAssessment.mockReset();
  projectService.completeProjectWithNotifications.mockReset();
  qbrService.getQuarterlyBusinessReview.mockReset();
  commercialIntelligence.getCustomer360Dashboard.mockReset();
  portfolioService.getPortfolioSummary.mockReset();
  pdfGenerate.generateAssessmentReportPdf.mockReset();
}

beforeEach(() => {
  resetMocks();
});

function seedClientList() {
  const rows = [
    {
      id: OWN,
      companyName: "Own Co",
      primaryContactName: "Casey",
      status: "active",
      assessments: [],
      _count: { assessments: 1 },
    },
    {
      id: OTHER,
      companyName: "Other Co",
      primaryContactName: "Owen",
      status: "active",
      assessments: [],
      _count: { assessments: 2 },
    },
  ];
  prismaMock.client.findMany.mockImplementation(async (args: { where?: { id?: string } }) =>
    rows.filter((row) => !args?.where?.id || row.id === args.where.id),
  );
  prismaMock.client.count.mockImplementation(
    async (args: { where?: { id?: string } }) =>
      rows.filter((row) => !args?.where?.id || row.id === args.where.id).length,
  );
}

const ownProject = {
  id: "project-own",
  title: "Firewall",
  clientId: OWN,
  recommendationId: "11111111-1111-4111-8111-111111111111",
  priority: "high",
  estimatedImpactPoints: 4,
  status: "proposed",
  description: "Replace firewall",
  createdAt: new Date("2026-01-15T00:00:00.000Z"),
  completedAt: null,
  client: { companyName: "Own Co" },
  category: { name: "Security" },
  assignedUser: null,
  recommendation: {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Firewall",
    assessmentId: "assessment-own",
  },
};

describe("API client isolation", () => {
  it("rejects unauthenticated reads and writes before touching client data", async () => {
    const reads = [
      await listClients(request("/api/v1/clients")),
      await getClient(request(`/api/v1/clients/${OTHER}`), params({ id: OTHER })),
      await dashboardSummary(),
      await listProjects(request("/api/v1/projects")),
      await assessmentRecommendations(
        request("/api/v1/assessments/assessment-other/recommendations"),
        params({ id: "assessment-other" }),
      ),
    ];
    const writes = [
      await createClient(
        request("/api/v1/clients", "POST", { companyName: "Intruder", clientId: OTHER }),
      ),
      await patchClient(
        request(`/api/v1/clients/${OTHER}`, "PATCH", { notes: "changed" }),
        params({ id: OTHER }),
      ),
      await patchRecommendation(
        request("/api/v1/recommendations/rec-1", "PATCH", { status: "accepted" }),
        params({ id: "rec-1" }),
      ),
      await patchProject(
        request("/api/v1/projects/project-other", "PATCH", { status: "completed" }),
        params({ id: "project-other" }),
      ),
    ];

    expect(reads.every((response) => response.status === 401)).toBe(true);
    expect(writes.every((response) => response.status === 401)).toBe(true);
    expect(prismaMock.client.findMany).not.toHaveBeenCalled();
    expect(prismaMock.client.create).not.toHaveBeenCalled();
    expect(prismaMock.client.update).not.toHaveBeenCalled();
    expect(prismaMock.assessmentRecommendation.update).not.toHaveBeenCalled();
    expect(projectService.completeProjectWithNotifications).not.toHaveBeenCalled();
  });

  it("lets admin and technician read firm data and keeps client creation off the portal role", async () => {
    seedClientList();
    prismaMock.client.count.mockResolvedValue(2);
    prismaMock.assessment.count.mockResolvedValue(1);
    prismaMock.assessment.findMany.mockResolvedValue([]);
    prismaMock.client.findMany.mockResolvedValue([]);
    prismaMock.client.create.mockResolvedValue({ id: "created-client" });
    portfolioService.getPortfolioSummary.mockResolvedValue({ clients: [] });

    sessionState.current = admin;
    const adminClients = await listClients(request("/api/v1/clients"));
    const adminDashboard = await dashboardSummary();
    const adminPortfolio = await portfolioSummary();

    sessionState.current = technician;
    const technicianDashboard = await dashboardSummary();
    const technicianCreate = await createClient(
      request("/api/v1/clients", "POST", {
        companyName: "New Co",
        primaryContactName: "Nina",
        primaryContactEmail: "nina@new.test",
      }),
    );
    const technicianDelete = await deleteClient(
      request(`/api/v1/clients/${OWN}`, "DELETE", { confirmation: "DELETE" }),
      params({ id: OWN }),
    );
    const technicianPortfolio = await portfolioSummary();

    expect(adminClients.status).toBe(200);
    expect(adminDashboard.status).toBe(200);
    expect(adminPortfolio.status).toBe(200);
    expect(technicianDashboard.status).toBe(200);
    expect(technicianCreate.status).toBe(201);
    expect(prismaMock.client.create).toHaveBeenCalledTimes(1);
    expect(technicianDelete.status).toBe(403);
    expect(technicianPortfolio.status).toBe(403);
    expect(portfolioService.getPortfolioSummary).toHaveBeenCalledTimes(1);
  });

  it("returns only the signed-in client's company from the client list", async () => {
    seedClientList();
    sessionState.current = ownClient;

    const response = await listClients(request("/api/v1/clients?search=Co"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.map((row: { companyName: string }) => row.companyName)).toEqual(["Own Co"]);
    expect(prismaMock.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: OWN }) }),
    );
  });

  it("lets a client read their own record and hides consulting notes", async () => {
    sessionState.current = ownClient;
    prismaMock.client.findUnique.mockResolvedValue({
      id: OWN,
      companyName: "Own Co",
      notes: "internal consulting note",
      assessments: [{ id: "assessment-own", internalNotes: "staff only" }],
      scoreHistory: [],
      projects: [],
    });

    const response = await getClient(request(`/api/v1/clients/${OWN}`), params({ id: OWN }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.companyName).toBe("Own Co");
    expect(body.notes).toBeNull();
    expect(body.assessments[0].internalNotes).toBeNull();
  });

  it("blocks a client from reading or updating another client", async () => {
    sessionState.current = ownClient;

    const read = await getClient(request(`/api/v1/clients/${OTHER}`), params({ id: OTHER }));
    const write = await patchClient(
      request(`/api/v1/clients/${OTHER}`, "PATCH", { companyName: "Taken", notes: "stolen" }),
      params({ id: OTHER }),
    );
    const ownWrite = await patchClient(
      request(`/api/v1/clients/${OWN}`, "PATCH", { notes: "portal overwrite", clientId: OTHER }),
      params({ id: OWN }),
    );

    expect(read.status).toBe(403);
    expect(write.status).toBe(403);
    expect(ownWrite.status).toBe(403);
    expect(prismaMock.client.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.client.update).not.toHaveBeenCalled();
  });

  it("blocks a client from firm dashboards, contacts, and customer 360", async () => {
    sessionState.current = ownClient;

    const summary = await dashboardSummary();
    const contacts = await listContacts(request(`/api/v1/clients/${OWN}/contacts`), params({ id: OWN }));
    const otherContacts = await listContacts(
      request(`/api/v1/clients/${OTHER}/contacts`),
      params({ id: OTHER }),
    );
    const own360 = await customer360(request(`/api/v1/clients/${OWN}/360`), params({ id: OWN }));
    const other360 = await customer360(request(`/api/v1/clients/${OTHER}/360`), params({ id: OTHER }));

    expect(summary.status).toBe(403);
    expect(contacts.status).toBe(403);
    expect(otherContacts.status).toBe(403);
    expect(own360.status).toBe(403);
    expect(other360.status).toBe(403);
    expect(prismaMock.client.count).not.toHaveBeenCalled();
    expect(commercialIntelligence.getCustomer360Dashboard).not.toHaveBeenCalled();
  });

  it("scopes project lists to the caller and ignores a foreign clientId query", async () => {
    sessionState.current = ownClient;
    prismaMock.project.findMany.mockResolvedValue([]);

    const response = await listProjects(request(`/api/v1/projects?clientId=${OTHER}`));

    expect(response.status).toBe(200);
    expect(prismaMock.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ clientId: OWN }) }),
    );
  });

  it("lets a client read their own project and refuses another client's project", async () => {
    sessionState.current = ownClient;
    prismaMock.project.findUnique
      .mockResolvedValueOnce(ownProject)
      .mockResolvedValueOnce({ ...ownProject, id: "project-other", clientId: OTHER });

    const own = await getProject(request("/api/v1/projects/project-own"), params({ id: "project-own" }));
    const other = await getProject(
      request("/api/v1/projects/project-other"),
      params({ id: "project-other" }),
    );

    expect(own.status).toBe(200);
    expect((await own.json()).clientId).toBe(OWN);
    expect(other.status).toBe(404);
  });

  it("refuses client project and assessment writes without mutating records", async () => {
    sessionState.current = ownClient;

    const projectWrite = await patchProject(
      request("/api/v1/projects/project-own", "PATCH", { status: "completed", clientId: OTHER }),
      params({ id: "project-own" }),
    );
    const createOnOther = await createClientProject(
      request(`/api/v1/clients/${OTHER}/projects`, "POST", {
        recommendationId: "11111111-1111-4111-8111-111111111111",
        title: "Stolen",
        priority: "high",
        categoryId: "22222222-2222-4222-8222-222222222222",
        clientId: OTHER,
      }),
      params({ id: OTHER }),
    );
    const createOnOwn = await createClientProject(
      request(`/api/v1/clients/${OWN}/projects`, "POST", {
        recommendationId: "11111111-1111-4111-8111-111111111111",
        title: "Own",
        priority: "high",
        categoryId: "22222222-2222-4222-8222-222222222222",
      }),
      params({ id: OWN }),
    );
    const assessmentWrite = await createClientAssessment(
      request(`/api/v1/clients/${OTHER}/assessments`, "POST", {
        assessmentName: "Foreign",
        assessmentType: "initial",
        clientId: OTHER,
      }),
      params({ id: OTHER }),
    );
    const ownAssessmentWrite = await createClientAssessment(
      request(`/api/v1/clients/${OWN}/assessments`, "POST", {
        assessmentName: "Own",
        assessmentType: "initial",
      }),
      params({ id: OWN }),
    );

    expect(projectWrite.status).toBe(403);
    expect(createOnOther.status).toBe(403);
    expect(createOnOwn.status).toBe(403);
    expect(assessmentWrite.status).toBe(403);
    expect(ownAssessmentWrite.status).toBe(403);
    expect(projectService.completeProjectWithNotifications).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.project.create).not.toHaveBeenCalled();
    expect(prismaMock.assessment.create).not.toHaveBeenCalled();
    expect(reassessment.createReassessment).not.toHaveBeenCalled();
  });

  it("lets a technician update a recommendation and blocks a client from the same write", async () => {
    prismaMock.assessmentRecommendation.findUnique.mockResolvedValue({
      id: "rec-1",
      status: "open",
    });
    prismaMock.assessmentRecommendation.update.mockResolvedValue({
      id: "rec-1",
      status: "accepted",
      category: { id: "cat-1" },
      project: null,
    });

    sessionState.current = ownClient;
    const clientWrite = await patchRecommendation(
      request("/api/v1/recommendations/rec-1", "PATCH", {
        status: "accepted",
        title: "Changed by client",
        clientId: OTHER,
      }),
      params({ id: "rec-1" }),
    );

    sessionState.current = technician;
    const staffWrite = await patchRecommendation(
      request("/api/v1/recommendations/rec-1", "PATCH", { status: "accepted" }),
      params({ id: "rec-1" }),
    );

    expect(clientWrite.status).toBe(403);
    expect(staffWrite.status).toBe(200);
    expect(prismaMock.assessmentRecommendation.update).toHaveBeenCalledTimes(1);
  });

  it("allows a client to read their own workspace resources and blocks the other client's ids", async () => {
    sessionState.current = ownClient;
    technologyProfile.getTechnologyProfileDetail.mockResolvedValue({ clientId: OWN });
    businessProfile.getBusinessProfile.mockResolvedValue({ clientId: OWN, companyName: "Own Co" });
    reassessment.getClientAssessmentHistory.mockResolvedValue([{ id: "history-own" }]);
    prismaMock.assessment.findMany.mockResolvedValue([]);
    prismaMock.assessment.count.mockResolvedValue(0);
    prismaMock.project.findMany.mockResolvedValue([]);
    prismaMock.project.count.mockResolvedValue(0);
    qbrService.getQuarterlyBusinessReview.mockResolvedValue({ id: "qbr-own", status: "generated" });
    recommendationQueries.getRecommendationsTriggeredByAssessment.mockResolvedValue([
      { id: "rec-own", title: "Backup" },
    ]);
    prismaMock.assessment.findUnique.mockImplementation(async (args: { where: { id: string } }) => {
      if (args.where.id === "assessment-own") {
        return { id: "assessment-own", clientId: OWN, status: "completed" };
      }
      return { id: args.where.id, clientId: OTHER, status: "completed" };
    });

    const ownProfile = await technologyProfileRoute(
      request(`/api/v1/clients/${OWN}/technology-profile`),
      params({ id: OWN }),
    );
    const otherProfile = await technologyProfileRoute(
      request(`/api/v1/clients/${OTHER}/technology-profile`),
      params({ id: OTHER }),
    );
    const ownBusiness = await getBusinessProfileRoute(
      request(`/api/v1/clients/${OWN}/business-profile`),
      params({ id: OWN }),
    );
    const otherBusiness = await getBusinessProfileRoute(
      request(`/api/v1/clients/${OTHER}/business-profile`),
      params({ id: OTHER }),
    );
    const businessWrite = await patchBusinessProfile(
      request(`/api/v1/clients/${OWN}/business-profile`, "PATCH", { companyName: "Renamed" }),
      params({ id: OWN }),
    );
    const ownHistory = await assessmentHistory(
      request(`/api/v1/clients/${OWN}/assessments/history`),
      params({ id: OWN }),
    );
    const otherHistory = await assessmentHistory(
      request(`/api/v1/clients/${OTHER}/assessments/history`),
      params({ id: OTHER }),
    );
    const ownAssessments = await listClientAssessments(
      request(`/api/v1/clients/${OWN}/assessments`),
      params({ id: OWN }),
    );
    const otherAssessments = await listClientAssessments(
      request(`/api/v1/clients/${OTHER}/assessments`),
      params({ id: OTHER }),
    );
    const ownProjects = await listClientProjects(
      request(`/api/v1/clients/${OWN}/projects`),
      params({ id: OWN }),
    );
    const otherProjects = await listClientProjects(
      request(`/api/v1/clients/${OTHER}/projects`),
      params({ id: OTHER }),
    );
    const ownQbr = await getQbr(
      request(`/api/v1/clients/${OWN}/qbr/qbr-own`),
      params({ id: OWN, qbrId: "qbr-own" }),
    );
    const otherQbr = await getQbr(
      request(`/api/v1/clients/${OTHER}/qbr/qbr-other`),
      params({ id: OTHER, qbrId: "qbr-other" }),
    );
    const ownRecommendations = await assessmentRecommendations(
      request("/api/v1/assessments/assessment-own/recommendations"),
      params({ id: "assessment-own" }),
    );
    const otherRecommendations = await assessmentRecommendations(
      request("/api/v1/assessments/assessment-other/recommendations"),
      params({ id: "assessment-other" }),
    );
    const otherImprovement = await assessmentImprovement(
      request("/api/v1/assessments/assessment-other/improvement"),
      params({ id: "assessment-other" }),
    );
    const otherPdf = await assessmentPdf(
      request("/api/v1/assessments/assessment-other/export/pdf"),
      params({ id: "assessment-other" }),
    );

    expect(ownProfile.status).toBe(200);
    expect(otherProfile.status).toBe(403);
    expect(ownBusiness.status).toBe(200);
    expect(otherBusiness.status).toBe(403);
    expect(businessWrite.status).toBe(403);
    expect(ownHistory.status).toBe(200);
    expect(otherHistory.status).toBe(403);
    expect(ownAssessments.status).toBe(200);
    expect(otherAssessments.status).toBe(403);
    expect(ownProjects.status).toBe(200);
    expect(otherProjects.status).toBe(403);
    expect(ownQbr.status).toBe(200);
    expect(otherQbr.status).toBe(403);
    expect(ownRecommendations.status).toBe(200);
    expect(otherRecommendations.status).toBe(404);
    expect(otherImprovement.status).toBe(404);
    expect(otherPdf.status).toBe(404);

    expect(technologyProfile.getTechnologyProfileDetail).toHaveBeenCalledTimes(1);
    expect(technologyProfile.getTechnologyProfileDetail).toHaveBeenCalledWith(OWN, "client");
    expect(businessProfile.getBusinessProfile).toHaveBeenCalledTimes(1);
    expect(businessProfile.updateBusinessProfile).not.toHaveBeenCalled();
    expect(reassessment.getClientAssessmentHistory).toHaveBeenCalledTimes(1);
    expect(reassessment.buildImprovementSummary).not.toHaveBeenCalled();
    expect(pdfGenerate.generateAssessmentReportPdf).not.toHaveBeenCalled();
    expect(qbrService.getQuarterlyBusinessReview).toHaveBeenCalledTimes(1);
    expect(recommendationQueries.getRecommendationsTriggeredByAssessment).toHaveBeenCalledTimes(1);
    expect(prismaMock.assessment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clientId: OWN } }),
    );
    expect(prismaMock.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ clientId: OWN }) }),
    );
  });

  it("strips internal assessment notes and consulting recommendation fields for clients", async () => {
    sessionState.current = ownClient;
    prismaMock.assessment.findUnique
      .mockResolvedValueOnce({ id: "assessment-own", clientId: OWN, status: "completed" })
      .mockResolvedValueOnce({
        id: "assessment-own",
        status: "completed",
        internalNotes: "do not show",
        executiveSummary: "Shared summary",
        client: { id: OWN, companyName: "Own Co", notes: "consulting note" },
        assessor: { id: "tech-1", name: "Theo Tech", email: "theo@bobkat.test" },
        responses: [],
        categoryScores: [],
      });
    prismaMock.assessmentQuestion.count.mockResolvedValue(8);
    recommendationQueries.getRecommendationsTriggeredByAssessment.mockResolvedValue([
      {
        id: "rec-own",
        title: "Backup",
        description: "Improve backups",
        businessImpact: "Faster recovery",
        suggestedService: "Managed Backup",
        latestTriggerReason: "BKP-01: No validated restore",
        templateCode: "backup_restore_test",
        dedupeKey: "backup|restore",
        consolidationGroupId: "group-1",
        createdByUserId: "tech-1",
        priority: "high",
        status: "open",
        estimatedImpactPoints: 8,
        category: { id: "cat-1", name: "Backup", code: "backup" },
        project: null,
      },
    ]);

    const response = await getAssessment(
      request("/api/v1/assessments/assessment-own"),
      params({ id: "assessment-own" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.executiveSummary).toBe("Shared summary");
    expect(body.internalNotes).toBeNull();
    expect(body.client.notes).toBeNull();
    expect(body.client.companyName).toBe("Own Co");
    expect(body.assessor).toEqual({ id: "tech-1", name: "Theo Tech", email: null });
    expect(body.recommendations).toHaveLength(1);
    expect(body.recommendations[0].title).toBe("Backup");
    expect(body.recommendations[0].suggestedService).toBe("Managed Backup");
    expect(body.recommendations[0].businessImpact).toBe("Faster recovery");
    expect(body.recommendations[0].latestTriggerReason).toBeUndefined();
    expect(body.recommendations[0].templateCode).toBeUndefined();
    expect(body.recommendations[0].dedupeKey).toBeUndefined();
    expect(body.recommendations[0].consolidationGroupId).toBeUndefined();
    expect(body.recommendations[0].createdByUserId).toBeUndefined();
  });

  it("hides draft phase proposals from clients and rejects a nested id for another client", async () => {
    expect(isClientVisiblePhaseProposalStatus("draft")).toBe(false);
    expect(isClientVisiblePhaseProposalStatus("internal_review")).toBe(false);
    expect(isClientVisiblePhaseProposalStatus("sent")).toBe(true);

    sessionState.current = ownClient;
    prismaMock.phaseProposal.findMany.mockResolvedValue([]);
    prismaMock.phaseProposal.findFirst.mockResolvedValue({
      id: "proposal-draft",
      status: "draft",
      clientId: OWN,
    });

    const list = await listPhaseProposalsRoute(
      request(`/api/v1/clients/${OWN}/phase-proposals`),
      params({ id: OWN }),
    );
    const foreignList = await listPhaseProposalsRoute(
      request(`/api/v1/clients/${OTHER}/phase-proposals`),
      params({ id: OTHER }),
    );
    const nested = await getPhaseProposalRoute(
      request(`/api/v1/clients/${OWN}/phase-proposals/proposal-foreign`),
      params({ id: OWN, proposalId: "proposal-foreign" }),
    );
    const foreignParent = await getPhaseProposalRoute(
      request(`/api/v1/clients/${OTHER}/phase-proposals/proposal-foreign`),
      params({ id: OTHER, proposalId: "proposal-foreign" }),
    );

    expect(list.status).toBe(200);
    expect(prismaMock.phaseProposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          clientId: OWN,
          status: { notIn: ["draft", "internal_review"] },
        }),
      }),
    );
    expect(foreignList.status).toBe(403);
    expect(prismaMock.phaseProposal.findMany).toHaveBeenCalledTimes(1);
    expect(nested.status).toBe(404);
    expect(foreignParent.status).toBe(403);
    expect(await getPhaseProposalDetail(OWN, "proposal-draft", "client")).toBeNull();
  });

  it("ignores a clientId in the onboarding body and updates only the session client", async () => {
    sessionState.current = ownClient;
    prismaMock.user.findUnique.mockResolvedValue({ clientId: OWN });
    prismaMock.client.update.mockReturnValue({ queued: true });
    prismaMock.user.update.mockReturnValue({ queued: true });
    prismaMock.$transaction.mockResolvedValue([]);

    const response = await completeOnboarding(
      request("/api/v1/onboarding", "POST", {
        companyName: "Own Co",
        primaryContactName: "Casey Client",
        clientId: OTHER,
      }),
    );

    expect(response.status).toBe(200);
    expect(prismaMock.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: OWN },
        data: { companyName: "Own Co", primaryContactName: "Casey Client" },
      }),
    );
    expect(prismaMock.client.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: OTHER } }),
    );
  });
});
