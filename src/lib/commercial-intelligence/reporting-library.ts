import type { ReportLibraryItem } from "./types";

/**
 * Central catalog of executive reports.
 * Each item maps to an existing engine rather than embedding report logic here.
 */
export function getReportLibrary(clientId: string): ReportLibraryItem[] {
  return [
    {
      key: "technology_roadmap",
      title: "Living Execution Plan",
      description: "Phased implementation plan with separated investment profiles.",
      engine: "Technology Roadmap Engine",
      hrefTemplate: `/clients/${clientId}/roadmap`,
      available: true,
    },
    {
      key: "quarterly_business_review",
      title: "Business Review",
      description: "Flexible strategic review fed by living execution plan progress and score history.",
      engine: "Reporting Engine / QBR",
      hrefTemplate: `/clients/${clientId}/quarterly-reviews`,
      available: true,
    },
    {
      key: "technology_health",
      title: "Technology Health Report",
      description: "Lifecycle health, risk bands, and maturity pillars.",
      engine: "Lifecycle Engine",
      hrefTemplate: `/clients/${clientId}/lifecycle`,
      available: true,
    },
    {
      key: "technology_budget",
      title: "Technology Budget Report",
      description: "Completed, planned, deferred, and 3-year investment outlook.",
      engine: "Lifecycle Engine",
      hrefTemplate: `/clients/${clientId}/lifecycle`,
      available: true,
    },
    {
      key: "technology_lifecycle",
      title: "Technology Lifecycle Report",
      description: "Refresh planning, renewals, and continuous maturity tracking.",
      engine: "Lifecycle Engine",
      hrefTemplate: `/clients/${clientId}/lifecycle`,
      available: true,
    },
    {
      key: "managed_services_summary",
      title: "Managed Services Summary",
      description: "Active recurring services aligned to roadmap objectives.",
      engine: "Lifecycle Engine / Billing",
      hrefTemplate: `/clients/${clientId}/billing`,
      available: true,
    },
    {
      key: "strategic_consulting",
      title: "Strategic Consulting Report",
      description: "vCIO engagement status, reviews, and planning outcomes.",
      engine: "vCIO / QBR",
      hrefTemplate: `/clients/${clientId}/vcio`,
      available: true,
    },
    {
      key: "executive_board",
      title: "Executive Board Report",
      description: "Board-ready maturity, risk, and investment summary.",
      engine: "Reporting Engine",
      hrefTemplate: `/clients/${clientId}/executive-reports`,
      available: true,
    },
    {
      key: "annual_technology",
      title: "Annual Technology Report",
      description: "Year-over-year reassessment comparison and roadmap outcomes.",
      engine: "Assessment / Lifecycle Engines",
      hrefTemplate: `/clients/${clientId}/assessments/history`,
      available: true,
    },
    {
      key: "phase_proposal",
      title: "Phase Implementation Proposal",
      description: "Phase-scoped commercial proposal with version history.",
      engine: "Proposal Engine",
      hrefTemplate: `/clients/${clientId}/roadmap`,
      available: true,
    },
  ];
}
