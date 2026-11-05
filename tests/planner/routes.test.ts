import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: {
    id: "u1",
    name: "User",
    email: "user@example.com",
    role: "client",
    clientId: "client-a",
  } as {
    id: string;
    name: string;
    email: string;
    role: "client" | "admin";
    clientId: string | null;
  } | null,
  client: { findUnique: vi.fn() },
  recommendation: { findFirst: vi.fn() },
  task: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
}));
vi.mock("@/lib/db", () => ({
  prisma: {
    client: mocks.client,
    plannerTask: mocks.task,
    assessmentRecommendation: mocks.recommendation,
  },
}));
vi.mock("@/lib/api/access", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/access")>()),
  getSessionUserWithClient: vi.fn(async () => mocks.user),
}));
import { GET, POST } from "@/app/api/v1/clients/[id]/planner/route";
import {
  PATCH,
  DELETE,
} from "@/app/api/v1/clients/[id]/planner/[taskId]/route";
const context = (id = "client-a") => ({
  params: Promise.resolve({ id, taskId: "task-1" }),
});
const request = (method: string, body: unknown) =>
  new Request("https://stackscore.test/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = {
    id: "u1",
    name: "User",
    email: "user@example.com",
    role: "client",
    clientId: "client-a",
  };
  mocks.client.findUnique.mockResolvedValue({ id: "client-a" });
  mocks.task.findMany.mockResolvedValue([]);
  mocks.recommendation.findFirst.mockResolvedValue(null);
  mocks.task.create.mockImplementation(async ({ data }) => ({
    id: "task-1",
    ...data,
  }));
  mocks.task.updateMany.mockResolvedValue({ count: 1 });
  mocks.task.deleteMany.mockResolvedValue({ count: 1 });
});
describe("planner API authorization and saving", () => {
  it("requires authentication for every operation", async () => {
    mocks.user = null;
    for (const response of [
      await GET(request("GET", undefined), context()),
      await POST(request("POST", { title: "Task" }), context()),
      await PATCH(request("PATCH", { status: "complete" }), context()),
      await DELETE(request("DELETE", undefined), context()),
    ])
      expect(response.status).toBe(401);
    expect(mocks.task.create).not.toHaveBeenCalled();
  });
  it("rejects foreign client workspaces before reading or changing data", async () => {
    expect(
      (await GET(request("GET", undefined), context("client-b"))).status,
    ).toBe(403);
    expect(
      (await POST(request("POST", { title: "Task" }), context("client-b")))
        .status,
    ).toBe(403);
    expect(
      (
        await PATCH(
          request("PATCH", { status: "complete" }),
          context("client-b"),
        )
      ).status,
    ).toBe(403);
    expect(
      (await DELETE(request("DELETE", undefined), context("client-b"))).status,
    ).toBe(403);
    expect(mocks.task.findMany).not.toHaveBeenCalled();
    expect(mocks.task.updateMany).not.toHaveBeenCalled();
    expect(mocks.task.deleteMany).not.toHaveBeenCalled();
  });
  it("creates in the authenticated workspace, lists saved fields, and scopes updates and deletes to that workspace", async () => {
    const response = await POST(
      request("POST", {
        title: "Restore test",
        pillarCode: "data_protection_recovery",
      }),
      context(),
    );
    expect(response.status).toBe(201);
    const { task } = await response.json();
    expect(task.clientId).toBe("client-a");
    mocks.task.findMany.mockResolvedValue([task]);
    expect(
      (await (await GET(request("GET", undefined), context())).json()).tasks[0]
        .title,
    ).toBe("Restore test");
    await PATCH(request("PATCH", { status: "complete" }), context());
    expect(mocks.task.updateMany).toHaveBeenCalledWith({
      where: { id: "task-1", clientId: "client-a" },
      data: { status: "complete" },
    });
    await DELETE(request("DELETE", undefined), context());
    expect(mocks.task.deleteMany).toHaveBeenCalledWith({
      where: { id: "task-1", clientId: "client-a" },
    });
  });
  it("handles malformed bodies and foreign task IDs without mutation", async () => {
    const malformed = new Request("https://stackscore.test", {
      method: "POST",
      body: "{",
    });
    expect((await POST(malformed, context())).status).toBe(400);
    expect(
      (
        await POST(
          request("POST", { title: "Task", clientId: "client-b" }),
          context(),
        )
      ).status,
    ).toBe(400);
    expect(
      (await PATCH(request("PATCH", { status: "bad" }), context())).status,
    ).toBe(400);
    expect(mocks.task.create).not.toHaveBeenCalled();
    mocks.task.updateMany.mockResolvedValue({ count: 0 });
    mocks.task.deleteMany.mockResolvedValue({ count: 0 });
    expect(
      (await PATCH(request("PATCH", { title: "Changed" }), context())).status,
    ).toBe(404);
    expect((await DELETE(request("DELETE", undefined), context())).status).toBe(
      404,
    );
  });
  it("allows staff to help a client and returns 404 for a missing workspace", async () => {
    mocks.user!.role = "admin";
    expect(
      (
        await POST(
          request("POST", { title: "Staff action" }),
          context("client-b"),
        )
      ).status,
    ).toBe(201);
    mocks.client.findUnique.mockResolvedValue(null);
    expect(
      (await GET(request("GET", undefined), context("missing"))).status,
    ).toBe(404);
  });
  it("links recommendations only within the workspace and reuses an existing task", async () => {
    const sourceRecommendationId = "00000000-0000-4000-8000-000000000001";
    const payload = {
      title: "Test recovery",
      sourceRecommendationId,
      status: "in_progress",
    };
    expect((await POST(request("POST", payload), context())).status).toBe(404);
    expect(mocks.recommendation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: sourceRecommendationId, clientId: "client-a" },
      }),
    );
    expect(mocks.task.upsert).not.toHaveBeenCalled();
    mocks.recommendation.findFirst.mockResolvedValue({
      id: sourceRecommendationId,
      title: "Test recovery",
      recommendationTemplate: { code: "REC-PUBLISHED" },
    });
    mocks.task.upsert.mockResolvedValue({
      id: "existing-task",
      status: "blocked",
    });
    const response = await POST(request("POST", payload), context());
    expect(response.status).toBe(201);
    expect((await response.json()).task.id).toBe("existing-task");
    expect(mocks.task.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          clientId_sourceRecommendationId: {
            clientId: "client-a",
            sourceRecommendationId,
          },
        },
        update: {},
      }),
    );
    expect(mocks.task.create).not.toHaveBeenCalled();
    mocks.recommendation.findFirst.mockResolvedValue({
      title: "Improve unpublished stub",
      recommendationTemplate: { code: "REC-TEST-STUB-X" },
    });
    expect((await POST(request("POST", payload), context())).status).toBe(404);
  });
});
