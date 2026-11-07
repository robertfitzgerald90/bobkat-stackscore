import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  user: { id: "user", role: "admin" } as {
    id: string;
    role: "admin" | "client";
  } | null,
  userLookup: vi.fn(),
  clientLookup: vi.fn(),
  projectLookup: vi.fn(),
  detail: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({
  auth: async () => (mocks.user ? { user: mocks.user } : null),
}));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("redirect");
  },
  notFound: () => {
    throw new Error("not found");
  },
}));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: mocks.userLookup },
    client: { findUnique: mocks.clientLookup },
    project: { findFirst: mocks.projectLookup },
  },
}));
vi.mock("@/lib/customer-portal/projects-experience", () => ({
  getCustomerProjectDetail: mocks.detail,
}));
import Page from "@/app/(dashboard)/clients/[id]/projects/[projectId]/page";
import { CustomerProjectDetail } from "@/components/customer-portal/projects/customer-project-detail";
import { ProjectWorkspaceControls } from "@/components/projects/project-workspace-controls";
const params = () => ({
  params: Promise.resolve({ id: "client-a", projectId: "project-a" }),
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { id: "user", role: "admin" };
  mocks.userLookup.mockResolvedValue({ clientId: "client-a" });
  mocks.clientLookup.mockResolvedValue({
    id: "client-a",
    companyName: "Example",
  });
  mocks.detail.mockResolvedValue({
    id: "project-a",
    title: "Recovery improvement",
  });
  mocks.projectLookup.mockResolvedValue({
    status: "in_progress",
    description: "Delivery notes",
  });
});
describe("shared admin and customer project workspace", () => {
  it("gives admins the shared customer view with delivery controls", async () => {
    const result = await Page(params());
    expect(result.type).toBe(CustomerProjectDetail);
    expect(result.props.management.type).toBe(ProjectWorkspaceControls);
    expect(result.props.management.props).toMatchObject({
      clientId: "client-a",
      projectId: "project-a",
      isAdmin: true,
    });
    expect(mocks.projectLookup).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "project-a", clientId: "client-a" },
      }),
    );
  });
  it("keeps staff-only controls out of the customer view", async () => {
    mocks.user!.role = "client";
    const result = await Page(params());
    expect(result.type).toBe(CustomerProjectDetail);
    expect(result.props.management).toBeUndefined();
    expect(mocks.projectLookup).not.toHaveBeenCalled();
  });
  it("blocks another customer's workspace before reading project details", async () => {
    mocks.user!.role = "client";
    mocks.userLookup.mockResolvedValue({ clientId: "client-b" });
    await expect(Page(params())).rejects.toThrow("not found");
    expect(mocks.detail).not.toHaveBeenCalled();
  });
});
