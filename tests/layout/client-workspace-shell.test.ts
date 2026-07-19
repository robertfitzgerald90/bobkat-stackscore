import { describe, expect, it } from "vitest";
import {
  isClientWorkspaceRoute,
  isStaffClientWorkspaceRoute,
} from "@/lib/navigation/client-workspace-route";

describe("client workspace route detection", () => {
  it("matches staff client workspace routes", () => {
    expect(isClientWorkspaceRoute("/clients/acme/technology-profile")).toBe(true);
    expect(isClientWorkspaceRoute("/clients/acme/vcio")).toBe(true);
    expect(isStaffClientWorkspaceRoute("/clients/acme/roadmap", "admin")).toBe(true);
    expect(isStaffClientWorkspaceRoute("/clients/acme/roadmap", "technician")).toBe(true);
  });

  it("excludes non-client routes and customer sessions", () => {
    expect(isClientWorkspaceRoute("/clients")).toBe(false);
    expect(isClientWorkspaceRoute("/clients/new")).toBe(false);
    expect(isClientWorkspaceRoute("/dashboard")).toBe(false);
    expect(isStaffClientWorkspaceRoute("/clients/acme/technology-profile", "client")).toBe(false);
  });
});

describe("client workspace sticky chrome tokens", () => {
  it("uses an opaque sidebar shell without negative margins or alpha backgrounds", async () => {
    const { STICKY_CLIENT_WORKSPACE_SHELL_CLASS } = await import("@/lib/ui/sticky-chrome");

    expect(STICKY_CLIENT_WORKSPACE_SHELL_CLASS).toContain("sticky top-0");
    expect(STICKY_CLIENT_WORKSPACE_SHELL_CLASS).toContain("z-50");
    expect(STICKY_CLIENT_WORKSPACE_SHELL_CLASS).toContain("bg-sidebar");
    expect(STICKY_CLIENT_WORKSPACE_SHELL_CLASS).toContain("isolate");
    expect(STICKY_CLIENT_WORKSPACE_SHELL_CLASS).not.toContain("-mx-");
    expect(STICKY_CLIENT_WORKSPACE_SHELL_CLASS).not.toContain("bg-background/");
  });
});
