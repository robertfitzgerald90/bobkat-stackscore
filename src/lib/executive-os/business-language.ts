import type { TechnologyPillarCode } from "@/lib/technology-maturity/pillars";

/** Executive-facing labels — technology translated into business outcomes. */
export const EXECUTIVE_KPI_LABELS: Record<TechnologyPillarCode, string> = {
  identity_access: "Identity Protection",
  endpoint_management: "Operational Readiness",
  network_connectivity: "Technology Reliability",
  data_protection_recovery: "Business Continuity",
  productivity_collaboration: "Employee Productivity",
  security_operations: "Security Posture",
  documentation_knowledge: "Documentation Health",
  technology_strategy: "Growth Readiness",
};

export function executiveKpiLabel(pillarCode: TechnologyPillarCode, fallback?: string): string {
  return EXECUTIVE_KPI_LABELS[pillarCode] ?? fallback ?? "Technology Health";
}

export function executiveRiskLabel(score: number | null): string {
  if (score === null) return "Not assessed";
  if (score >= 85) return "Low";
  if (score >= 70) return "Moderate";
  if (score >= 55) return "Elevated";
  return "High";
}

export function confidenceFromScore(score: number | null): "High" | "Medium" | "Low" {
  if (score === null) return "Low";
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export const EXECUTIVE_OS_TAGLINE = "Technology Intelligence for Growing Businesses";
