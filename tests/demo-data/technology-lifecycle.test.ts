import { describe, expect, it } from "vitest";
import { technologyLifecycleDemoData } from "@/lib/demo-data/technology-lifecycle";

describe("technology lifecycle demo data", () => {
  it("includes four vendor cards with realistic cost classifications", () => {
    expect(technologyLifecycleDemoData).toHaveLength(4);
    expect(technologyLifecycleDemoData[0]?.name).toBe("Ubiquiti UniFi");
    expect(technologyLifecycleDemoData[0]?.costLines?.length).toBeGreaterThan(0);
    expect(technologyLifecycleDemoData.at(-1)?.name).toBe("Microsoft 365 Business Premium");
  });

  it("does not show inflated annual software renewals for open-source or owned hardware", () => {
    const uptime = technologyLifecycleDemoData.find((item) => item.name === "Uptime Kuma");
    const unifi = technologyLifecycleDemoData.find((item) => item.name === "Ubiquiti UniFi");

    expect(uptime?.costLines?.find((line) => line.label === "Software license")?.amountCents).toBe(0);
    expect(unifi?.costLines?.find((line) => line.label === "Annual software licensing")?.amountCents).toBe(0);
    expect(unifi?.annualBudgetCents).toBeUndefined();
  });
});
