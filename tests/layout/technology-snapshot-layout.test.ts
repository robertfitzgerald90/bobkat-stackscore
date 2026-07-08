import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("technology snapshot public layout", () => {
  it("whitelists the public route in auth config", () => {
    const authConfig = readFileSync(
      resolve(process.cwd(), "src/lib/auth/auth.config.ts"),
      "utf8",
    );

    expect(authConfig).toContain('pathname.startsWith("/technology-snapshot")');
    expect(authConfig).toContain('pathname.startsWith("/api/v1/public/technology-snapshot")');
  });

  it("uses mobile-safe layout classes in the wizard", () => {
    const wizard = readFileSync(
      resolve(process.cwd(), "src/components/technology-snapshot/technology-snapshot-wizard.tsx"),
      "utf8",
    );

    expect(wizard).toContain("min-w-0");
    expect(wizard).toContain("max-w-2xl");
    expect(wizard).toContain("whitespace-normal");
    expect(wizard).toContain("w-full sm:w-auto");
  });

  it("restricts snapshot leads page to admins", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/app/(dashboard)/snapshot-leads/page.tsx"),
      "utf8",
    );

    expect(page).toContain('role !== "admin"');
    expect(page).toContain('redirect("/dashboard")');
  });
});
