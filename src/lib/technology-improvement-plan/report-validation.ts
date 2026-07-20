import type { TipReportData } from "@/lib/pdf/types";
import {
  areTipTextsIdentical,
  isHighTipTextOverlap,
  normalizeTipText,
} from "@/lib/reports/tip-text-normalize";
import { resolveInitiativeFields } from "@/lib/reports/tip-initiative-content";
import { computeInitiativeRiskLevel } from "@/lib/reports/tip-priority-scoring";
import { buildTopBusinessRisks, buildTopOpportunities } from "@/lib/reports/tip-risks-opportunities";
import {
  describeCategoryBusinessImpact,
  describeCategoryCurrentState,
} from "@/lib/reports/tip-category-content";

export type TipContentValidationIssue = {
  level: "error" | "warning";
  code: string;
  message: string;
  context?: string;
};

function logTipValidation(issue: TipContentValidationIssue): void {
  if (process.env.NODE_ENV === "development") {
    const prefix = issue.level === "error" ? "ERROR" : "WARN";
    console.warn(`[tip-validation:${prefix}] ${issue.code}: ${issue.message}${issue.context ? ` (${issue.context})` : ""}`);
  }
}

export function validateTipReportContent(data: TipReportData): TipContentValidationIssue[] {
  const issues: TipContentValidationIssue[] = [];

  for (const risk of data.topBusinessRisks) {
    for (const opportunity of data.topOpportunities) {
      if (areTipTextsIdentical(risk, opportunity)) {
        issues.push({
          level: "error",
          code: "duplicate_risk_opportunity",
          message: "Top business risk matches top opportunity text",
          context: normalizeTipText(risk).slice(0, 80),
        });
      } else if (isHighTipTextOverlap(risk, opportunity)) {
        issues.push({
          level: "warning",
          code: "similar_risk_opportunity",
          message: "Top business risk is highly similar to an opportunity",
          context: normalizeTipText(opportunity).slice(0, 80),
        });
      }
    }
  }

  for (const initiative of data.strategicInitiatives) {
    if (!initiative.businessObjective.trim() || !initiative.whyItMatters.trim()) {
      issues.push({
        level: "error",
        code: "empty_initiative_field",
        message: "Initiative is missing objective or why-it-matters content",
        context: initiative.id,
      });
    }

    if (
      areTipTextsIdentical(initiative.businessObjective, initiative.whyItMatters) ||
      isHighTipTextOverlap(initiative.businessObjective, initiative.whyItMatters)
    ) {
      issues.push({
        level: "error",
        code: "duplicate_initiative_fields",
        message: "Business Objective and Why It Matters are duplicate or near-duplicate",
        context: initiative.id,
      });
    }
  }

  const impactCounts = new Map<string, number>();
  for (const finding of data.categoryFindings) {
    const key = normalizeTipText(finding.businessImpact);
    impactCounts.set(key, (impactCounts.get(key) ?? 0) + 1);
    if (!finding.businessImpact.trim() || !finding.currentState.trim()) {
      issues.push({
        level: "error",
        code: "empty_finding_field",
        message: "Category finding is missing required content",
        context: finding.categoryName,
      });
    }
  }

  for (const [impact, count] of impactCounts.entries()) {
    if (impact && count > 2) {
      issues.push({
        level: "warning",
        code: "repeated_business_impact",
        message: "Same Business Impact reused across multiple categories",
        context: `${count} categories`,
      });
    }
  }

  const priorities = new Set(data.strategicInitiatives.map((item) => item.priority));
  if (data.strategicInitiatives.length >= 3 && priorities.size === 1) {
    issues.push({
      level: "warning",
      code: "uniform_initiative_priority",
      message: "All roadmap initiatives share the same priority tier",
      context: Array.from(priorities).join(", "),
    });
  }

  for (const initiative of data.strategicInitiatives) {
    if (
      initiative.riskLevel === "Critical" &&
      (initiative.priority === "Moderate" || initiative.priority === "Planned") &&
      !initiative.priorityRationale
    ) {
      issues.push({
        level: "warning",
        code: "missing_priority_rationale",
        message: "Critical-risk initiative lacks priority rationale for lower urgency",
        context: initiative.id,
      });
    }
  }

  if (!data.investmentSummary) {
    issues.push({
      level: "error",
      code: "missing_investment_summary",
      message: "Investment summary is missing",
    });
  } else if (!data.investmentSummary.strategicItConsulting.optionalNote.trim()) {
    issues.push({
      level: "warning",
      code: "missing_consulting_note",
      message: "Strategic IT Consulting optional note is missing",
    });
  }

  return issues;
}

export function applyTipReportContentFixes(data: TipReportData): TipReportData {
  const categorySummaries = data.categorySummaries;
  const recById = new Map(data.recommendations.map((rec) => [rec.id, rec]));

  let topBusinessRisks = [...data.topBusinessRisks];
  let topOpportunities = [...data.topOpportunities];

  topOpportunities = buildTopOpportunities(
    data.recommendations,
    data.technologyRoadmap,
    categorySummaries,
  );
  topBusinessRisks = buildTopBusinessRisks(data.recommendations);

  const strategicInitiatives = data.strategicInitiatives.map((initiative) => {
    const rec = recById.get(initiative.id);
    if (!rec) return initiative;

    const riskLevel = initiative.riskLevel ?? computeInitiativeRiskLevel(rec);
    const fields = resolveInitiativeFields(rec, riskLevel);

    if (
      areTipTextsIdentical(fields.businessObjective, fields.whyItMatters) ||
      areTipTextsIdentical(initiative.businessObjective, initiative.whyItMatters)
    ) {
      return {
        ...initiative,
        businessObjective: fields.businessObjective,
        whyItMatters: fields.whyItMatters,
        expectedBenefits: fields.expectedBenefits,
        riskLevel,
      };
    }

    return initiative;
  });

  const categoryFindings = data.categoryFindings.map((finding) => {
    const categoryRecs = data.recommendations.filter(
      (rec) => rec.categoryName === finding.categoryName,
    );
    const summary = categorySummaries.find((row) => row.name === finding.categoryName);
    if (!summary) return finding;

    const context = {
      categoryName: finding.categoryName,
      score: summary.score,
      ratingLabel: summary.ratingLabel,
      riskLevel: finding.riskLevel,
      hasRecommendations: summary.hasRecommendations,
      recommendations: categoryRecs,
    };

    return {
      ...finding,
      currentState: finding.currentState.trim()
        ? finding.currentState
        : describeCategoryCurrentState(context),
      businessImpact: finding.businessImpact.trim()
        ? finding.businessImpact
        : describeCategoryBusinessImpact(context),
    };
  });

  return {
    ...data,
    topBusinessRisks,
    topOpportunities,
    strategicInitiatives,
    categoryFindings,
  };
}

export function finalizeTipReportData(data: TipReportData): TipReportData {
  const issues = validateTipReportContent(data);
  for (const issue of issues) {
    logTipValidation(issue);
  }

  const hasErrors = issues.some((issue) => issue.level === "error");
  if (hasErrors || issues.length > 0) {
    return applyTipReportContentFixes(data);
  }

  return data;
}
