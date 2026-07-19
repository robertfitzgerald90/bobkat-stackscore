import { describe, expect, it } from "vitest";
import {
  buildDemoFinancialProfile,
  buildTechnologyLifecycleDemoItems,
  scaleDemoCompanyProfile,
} from "@/lib/demo-data/demo-financial-profile";

describe("demo financial profile", () => {
  it("uses realistic Northstar baseline operating expenses", () => {
    const profile = buildDemoFinancialProfile();
    expect(profile.company.licensedUserCount).toBe(50);
    expect(profile.company.managedDeviceCount).toBe(60);
    expect(profile.operating.managedEndpointAnnualCents).toBe(1_080_000);
    expect(profile.operating.m365AnnualCents).toBe(1_320_000);
    expect(profile.operating.uptimeKumaHostingAnnualCents).toBe(60_000);
    expect(profile.annualPlan.plannedCents).toBeGreaterThan(profile.operating.totalOperatingAnnualCents);
  });

  it("builds lifecycle cards without inflated annual subscriptions", () => {
    const items = buildTechnologyLifecycleDemoItems();
    const unifi = items.find((item) => item.name === "Ubiquiti UniFi");
    const uptime = items.find((item) => item.name === "Uptime Kuma");
    const managed = items.find((item) => item.name === "Managed Endpoint Service");

    expect(unifi?.costLines?.some((line) => line.label === "Replacement value")).toBe(true);
    expect(unifi?.costLines?.find((line) => line.label === "Annual software licensing")?.amountCents).toBe(0);
    expect(uptime?.costLines?.find((line) => line.label === "Software license")?.amountCents).toBe(0);
    expect(managed?.provider).toBe("Bobkat IT");
    expect(managed?.platformLabel).toBe("NinjaOne");
    expect(managed?.costLines?.find((line) => line.label === "Annual service")?.amountCents).toBe(1_080_000);
  });

  it("scales predictably for 25, 60, and 100 device scenarios", () => {
    const scenarios = [
      { devices: 25, users: 20 },
      { devices: 60, users: 50 },
      { devices: 100, users: 75 },
    ];

    const annualManaged = scenarios.map(({ devices, users }) => {
      const profile = buildDemoFinancialProfile(
        scaleDemoCompanyProfile({ managedDeviceCount: devices, licensedUserCount: users }),
      );
      return profile.operating.managedEndpointAnnualCents;
    });

    expect(annualManaged[0]).toBe(450_000);
    expect(annualManaged[1]).toBe(1_080_000);
    expect(annualManaged[2]).toBe(1_800_000);
    expect(annualManaged[2]).toBeLessThan(2_000_000);
  });
});
