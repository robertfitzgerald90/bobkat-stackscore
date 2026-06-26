import { describe, expect, it } from "vitest";
import {
  getComplianceFieldGroup,
  parseComplianceDetails,
  sanitizeComplianceDetails,
  shouldShowComplianceDetails,
} from "@/lib/business-profile/compliance";
import { parseBusinessProfileUpdate } from "@/lib/business-profile/validate";

describe("business profile compliance", () => {
  it("hides compliance details when framework is none", () => {
    expect(shouldShowComplianceDetails("none")).toBe(false);
    expect(getComplianceFieldGroup("none")).toBeNull();
    expect(sanitizeComplianceDetails("none", { notes: "keep" })).toBeNull();
  });

  it("shows CMMC/NIST fields for cmmc and nist_800_171", () => {
    expect(getComplianceFieldGroup("cmmc")).toBe("cmmc_nist");
    expect(getComplianceFieldGroup("nist_800_171")).toBe("cmmc_nist");

    const details = sanitizeComplianceDetails("cmmc", {
      currentControlsImplemented: " MFA ",
      targetCompliance: " Level 2 ",
      notes: " In progress ",
      pciCompliant: true,
    });

    expect(details).toEqual({
      currentControlsImplemented: "MFA",
      targetCompliance: "Level 2",
      notes: "In progress",
    });
  });

  it("shows ISO fields only for iso_27001", () => {
    const details = sanitizeComplianceDetails("iso_27001", {
      certified: true,
      certificationDate: "2025-06-01",
      notes: "ignored",
    });

    expect(details).toEqual({
      certified: true,
      certificationDate: "2025-06-01",
    });
  });

  it("shows HIPAA and PCI fields for their frameworks", () => {
    expect(sanitizeComplianceDetails("hipaa", { hipaaProgramImplemented: false })).toEqual({
      hipaaProgramImplemented: false,
    });
    expect(sanitizeComplianceDetails("pci_dss", { pciCompliant: true })).toEqual({
      pciCompliant: true,
    });
  });

  it("parses stored compliance JSON safely", () => {
    expect(parseComplianceDetails({ certified: true, notes: "x" })).toEqual({
      currentControlsImplemented: null,
      targetCompliance: null,
      notes: "x",
      certified: true,
      certificationDate: null,
      hipaaProgramImplemented: null,
      pciCompliant: null,
    });
    expect(parseComplianceDetails(null)).toEqual({});
  });
});

describe("business profile validation", () => {
  it("clears compliance details when framework is set to none", () => {
    const update = parseBusinessProfileUpdate({
      complianceFramework: "none",
      complianceDetails: { notes: "should drop" },
    });

    expect(update.complianceFramework).toBe("none");
    expect(update.complianceDetails).toEqual({ notes: "should drop" });
  });

  it("accepts core business profile fields", () => {
    const update = parseBusinessProfileUpdate({
      industry: "Manufacturing",
      employeeCount: 45,
      numberOfLocations: 2,
      primaryBusinessGoal: "improve_cybersecurity",
      approximateEndpointCount: 60,
      technologyVision: "Cloud-first",
    });

    expect(update).toEqual({
      industry: "Manufacturing",
      employeeCount: 45,
      numberOfLocations: 2,
      primaryBusinessGoal: "improve_cybersecurity",
      approximateEndpointCount: 60,
      technologyVision: "Cloud-first",
    });
  });

  it("rejects invalid enum values", () => {
    expect(() =>
      parseBusinessProfileUpdate({ complianceFramework: "invalid" }),
    ).toThrow(/Invalid compliance framework/);
  });
});
