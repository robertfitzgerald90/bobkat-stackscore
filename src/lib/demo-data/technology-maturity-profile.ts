import type { TechnologyMaturityProfileProps } from "@/components/technology-maturity/technology-maturity-profile";

const PINNACLE_ORGANIZATION_SUMMARY =
  "Pinnacle Engineering is a growing civil and structural engineering firm with 84 employees across two offices. The organization relies on Microsoft 365 Business Premium, hybrid Entra ID, Ubiquiti networking, NinjaOne RMM, Synology backup, and Azure-hosted line-of-business applications.";

/** Static demo data for public marketing previews — never loaded from the database. */
export const technologyMaturityProfileDemoData: TechnologyMaturityProfileProps = {
  score: 53,
  statusLabel: "Critical",
  classificationBadges: [
    { label: "Improve Cybersecurity", icon: "target", variant: "secondary" },
    { label: "Foundational", variant: "outline" },
    { label: "Improving", icon: "trend", trendDirection: "improving" },
  ],
  organizationSummary: PINNACLE_ORGANIZATION_SUMMARY,
  criticalExposureCount: 3,
  showCriticalExposure: true,
  lastAssessedDate: "2026-06-21T00:00:00.000Z",
  pointsSincePreviousAssessment: 16,
  nextAssessmentDate: "2026-12-15T00:00:00.000Z",
  hasAssessment: true,
  readOnly: true,
};
