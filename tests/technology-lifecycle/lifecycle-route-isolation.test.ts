import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("lifecycle budget tenant isolation (route contract)", () => {
  it("scopes lifecycle API and page to the authenticated client workspace", () => {
    const api = readFileSync(
      resolve(process.cwd(), "src/app/api/v1/clients/[id]/lifecycle/route.ts"),
      "utf8",
    );
    const page = readFileSync(
      resolve(process.cwd(), "src/app/(dashboard)/clients/[id]/lifecycle/page.tsx"),
      "utf8",
    );

    expect(api).toContain("requireClientWorkspaceAccess");
    expect(api).toContain("getTechnologyLifecycleDashboard(clientId");
    expect(page).toContain("isCustomerMode");
    expect(page).toContain("clientUser?.clientId !== id");
    expect(page).toContain("getTechnologyLifecycleDashboard(id");
  });

  it("labels preliminary estimates separately from verified budget rows", () => {
    const ui = readFileSync(
      resolve(process.cwd(), "src/components/technology-lifecycle/lifecycle-dashboard.tsx"),
      "utf8",
    );
    expect(ui).toContain("Preliminary estimates only");
    expect(ui).toContain("Implementation costs require scoping");
    expect(ui).toContain("Approved investment");
    expect(ui).toContain("Contracted monthly services");
    expect(ui).toContain("Proposed one-time (estimate)");
    expect(ui).not.toMatch(/label=\"Planned Investment\"/);
  });
});
