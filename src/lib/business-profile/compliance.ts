import type { ComplianceFramework } from "@/generated/prisma/client";
import type { ComplianceDetails, ComplianceFieldGroup } from "@/lib/business-profile/types";

export function getComplianceFieldGroup(
  framework: ComplianceFramework | null | undefined,
): ComplianceFieldGroup {
  if (!framework || framework === "none" || framework === "sox" || framework === "other") {
    return null;
  }
  if (framework === "cmmc" || framework === "nist_800_171") return "cmmc_nist";
  if (framework === "iso_27001") return "iso_27001";
  if (framework === "hipaa") return "hipaa";
  if (framework === "pci_dss") return "pci_dss";
  return null;
}

export function shouldShowComplianceDetails(
  framework: ComplianceFramework | null | undefined,
): boolean {
  return getComplianceFieldGroup(framework) !== null;
}

export function parseComplianceDetails(value: unknown): ComplianceDetails {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;

  return {
    currentControlsImplemented:
      typeof record.currentControlsImplemented === "string"
        ? record.currentControlsImplemented
        : null,
    targetCompliance:
      typeof record.targetCompliance === "string" ? record.targetCompliance : null,
    notes: typeof record.notes === "string" ? record.notes : null,
    certified: typeof record.certified === "boolean" ? record.certified : null,
    certificationDate:
      typeof record.certificationDate === "string" ? record.certificationDate : null,
    hipaaProgramImplemented:
      typeof record.hipaaProgramImplemented === "boolean"
        ? record.hipaaProgramImplemented
        : null,
    pciCompliant: typeof record.pciCompliant === "boolean" ? record.pciCompliant : null,
  };
}

export function sanitizeComplianceDetails(
  framework: ComplianceFramework | null | undefined,
  details: ComplianceDetails | null | undefined,
): ComplianceDetails | null {
  const group = getComplianceFieldGroup(framework);
  if (!group) return null;

  const source = details ?? {};

  switch (group) {
    case "cmmc_nist":
      return {
        currentControlsImplemented: source.currentControlsImplemented?.trim() || null,
        targetCompliance: source.targetCompliance?.trim() || null,
        notes: source.notes?.trim() || null,
      };
    case "iso_27001":
      return {
        certified: source.certified ?? null,
        certificationDate: source.certificationDate?.trim() || null,
      };
    case "hipaa":
      return {
        hipaaProgramImplemented: source.hipaaProgramImplemented ?? null,
      };
    case "pci_dss":
      return {
        pciCompliant: source.pciCompliant ?? null,
      };
    default:
      return null;
  }
}
