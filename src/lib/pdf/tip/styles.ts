import { StyleSheet } from "@react-pdf/renderer";
import { COLORS } from "@/lib/pdf/shared/colors";
import { REPORT_RADIUS, REPORT_SPACING, REPORT_TYPOGRAPHY } from "@/lib/pdf/shared/tokens";
import type { ExecutivePriorityLevel, ExecutiveRiskLevel } from "@/lib/pdf/types";

export const tipPdfStyles = StyleSheet.create({
  blockLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 4,
  },
  bodyText: {
    fontSize: REPORT_TYPOGRAPHY.body,
    lineHeight: 1.7,
    color: COLORS.slate,
    marginBottom: 10,
  },
  callout: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.navy,
    borderRadius: REPORT_RADIUS.md,
    backgroundColor: COLORS.surface,
    padding: REPORT_SPACING.cardPadding,
    marginBottom: REPORT_SPACING.block,
  },
  calloutTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 6,
  },
  scopeBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: REPORT_RADIUS.md,
    backgroundColor: COLORS.surface,
    padding: 12,
    marginBottom: REPORT_SPACING.block,
  },
  scopeText: {
    fontSize: REPORT_TYPOGRAPHY.bodySmall,
    lineHeight: 1.65,
    color: COLORS.muted,
  },
  executiveHero: {
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: REPORT_RADIUS.lg,
    backgroundColor: COLORS.surface,
    padding: REPORT_SPACING.cardPadding,
    marginBottom: REPORT_SPACING.block,
  },
  executiveMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  executiveMetaItem: {
    minWidth: "30%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: REPORT_RADIUS.sm,
    backgroundColor: COLORS.white,
    padding: 10,
  },
  executiveMetaLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  executiveMetaValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  checklistRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  checklistMark: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.success,
    width: 12,
    lineHeight: 1.5,
  },
  checklistText: {
    flex: 1,
    fontSize: REPORT_TYPOGRAPHY.body,
    lineHeight: 1.6,
    color: COLORS.slate,
  },
  findingCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: REPORT_RADIUS.lg,
    backgroundColor: COLORS.white,
    padding: REPORT_SPACING.cardPadding,
    marginBottom: REPORT_SPACING.block,
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  findingTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    lineHeight: 1.35,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: REPORT_RADIUS.sm,
    borderWidth: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  fieldLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 4,
    marginTop: 4,
  },
  fieldBody: {
    fontSize: REPORT_TYPOGRAPHY.body,
    lineHeight: 1.65,
    color: COLORS.slate,
    marginBottom: 6,
  },
  initiativeCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: REPORT_RADIUS.lg,
    backgroundColor: COLORS.white,
    padding: REPORT_SPACING.cardPadding,
    marginBottom: REPORT_SPACING.block,
  },
  initiativeTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 8,
    lineHeight: 1.35,
  },
  valueMetricCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: REPORT_RADIUS.md,
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 8,
  },
  valueMetricLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 8,
  },
  valueMetricCompare: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  valueMetricValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
  },
  valueMetricCaption: {
    fontSize: 8,
    color: COLORS.muted,
  },
  investmentHero: {
    backgroundColor: COLORS.navy,
    borderRadius: REPORT_RADIUS.lg,
    padding: REPORT_SPACING.cardPadding,
    marginTop: 12,
    marginBottom: REPORT_SPACING.block,
  },
  investmentHeroLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  investmentHeroValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  nextStepCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: REPORT_RADIUS.lg,
    backgroundColor: COLORS.white,
    padding: REPORT_SPACING.cardPadding,
    marginBottom: 12,
  },
  nextStepTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.navy,
    marginBottom: 6,
  },
  nextStepBody: {
    fontSize: REPORT_TYPOGRAPHY.body,
    lineHeight: 1.65,
    color: COLORS.slate,
  },
});

export const RISK_BADGE_STYLES: Record<
  ExecutiveRiskLevel,
  { bg: string; text: string; border: string }
> = {
  Low: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  Moderate: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  High: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  Critical: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
};

export const PRIORITY_BADGE_STYLES: Record<
  ExecutivePriorityLevel,
  { bg: string; text: string; border: string }
> = {
  Low: { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
  Medium: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  High: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
};
