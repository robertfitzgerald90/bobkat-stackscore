export const SCORE_HISTORY_CATEGORY_FIELDS = [
  { code: "security", label: "Security", field: "securityScore" },
  { code: "backup", label: "Backup & Recovery", field: "backupScore" },
  { code: "infrastructure", label: "Infrastructure", field: "infrastructureScore" },
  { code: "endpoint", label: "Endpoint Management", field: "endpointScore" },
  { code: "documentation", label: "Documentation", field: "documentationScore" },
  { code: "bcdr", label: "BC/DR", field: "bcdrScore" },
  { code: "strategic", label: "Strategic Alignment", field: "strategicScore" },
] as const;

export type ScoreHistoryCategoryField =
  (typeof SCORE_HISTORY_CATEGORY_FIELDS)[number]["field"];

export function getCategoryLabel(code: string): string {
  return SCORE_HISTORY_CATEGORY_FIELDS.find((category) => category.code === code)?.label ?? code;
}
