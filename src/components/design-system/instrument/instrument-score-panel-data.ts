/**
 * Static, fictional fixture for the Phase 1 "Instrument" score panel preview.
 * No real client, employee, or production data.
 */

export type InstrumentSeverity = "measured" | "caution" | "critical";

export type InstrumentPillarReading = {
  id: string;
  name: string;
  score: number;
  severity: InstrumentSeverity;
  answered: number;
  total: number;
};

export type InstrumentRiskReading = {
  id: string;
  label: string;
  score: number;
  severity: InstrumentSeverity;
};

export const instrumentScorePanelFixture = {
  overallScore: 71,
  overallLabel: "Stable",
  overallSeverity: "measured" as InstrumentSeverity,
  projectedScore: 88,
  answeredCount: 42,
  totalCount: 48,
  criticalFindingsCount: 2,
  openRecommendationsCount: 9,
  pillars: [
    { id: "security", name: "Cybersecurity", score: 64, severity: "caution", answered: 8, total: 8 },
    { id: "backup", name: "Backup & Recovery", score: 52, severity: "critical", answered: 6, total: 6 },
    { id: "infrastructure", name: "Infrastructure", score: 79, severity: "measured", answered: 7, total: 7 },
    { id: "endpoint", name: "Endpoint Management", score: 88, severity: "measured", answered: 6, total: 6 },
    { id: "documentation", name: "Documentation", score: 58, severity: "caution", answered: 5, total: 6 },
    { id: "strategic", name: "Strategic Alignment", score: 81, severity: "measured", answered: 5, total: 5 },
  ] satisfies InstrumentPillarReading[],
  topRisks: [
    { id: "backup", label: "Backup & Recovery", score: 52, severity: "critical" },
    { id: "documentation", label: "Documentation", score: 58, severity: "caution" },
  ] satisfies InstrumentRiskReading[],
};
