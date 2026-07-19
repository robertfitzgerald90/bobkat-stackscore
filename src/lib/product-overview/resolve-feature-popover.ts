import {
  getCollaborationParticipantById,
  getEcosystemNodeById,
  getExecutiveWidgetById,
  getStrategicInitiativeById,
} from "@/lib/product-overview/demo-partnership";
import { formatDemoCurrency } from "@/lib/product-overview/demo-dashboard";
import {
  getProfileConnectionByPillarId,
  getProfileConnectionByRecommendationId,
  getProfilePillarById,
  getProfileProjectById,
  getProfileRecommendationById,
  getProfileReportPreviewById,
  getProfileRoadmapInitiativeById,
} from "@/lib/product-overview/demo-profiles/lookups";
import type { DemoProfileBundle } from "@/lib/product-overview/demo-profiles/types";
import { demoFeatureKey } from "@/lib/product-overview/feature-popover-types";
import type { FeaturePopoverModel } from "@/lib/product-overview/feature-popover-types";
import type { DemoDetailPanel } from "@/lib/product-overview/types";

function relatedFromConnection(connection?: {
  pillarId?: string;
  recommendationId?: string;
  roadmapInitiativeId?: string;
  projectId?: string;
}): FeaturePopoverModel["relatedActions"] {
  const actions: NonNullable<FeaturePopoverModel["relatedActions"]> = [];
  if (connection?.pillarId) {
    actions.push({
      label: "Pillar",
      panel: { type: "assessmentPillar", pillarId: connection.pillarId },
      featureKey: demoFeatureKey("pillar", connection.pillarId),
    });
  }
  if (connection?.recommendationId) {
    actions.push({
      label: "Recommendation",
      panel: { type: "recommendation", recommendationId: connection.recommendationId },
      featureKey: demoFeatureKey("recommendation", connection.recommendationId),
    });
  }
  if (connection?.roadmapInitiativeId) {
    actions.push({
      label: "Living Execution Plan",
      panel: { type: "roadmapInitiative", initiativeId: connection.roadmapInitiativeId },
      featureKey: demoFeatureKey("roadmapInitiative", connection.roadmapInitiativeId),
    });
  }
  if (connection?.projectId) {
    actions.push({
      label: "Project",
      panel: { type: "projectExecution", projectId: connection.projectId },
      featureKey: demoFeatureKey("project", connection.projectId),
    });
  }
  actions.push({
    label: "Business Review",
    panel: { type: "executiveReview" },
    featureKey: demoFeatureKey("executiveReview"),
  });
  return actions;
}

export function resolveFeaturePopoverModel(
  panel: NonNullable<DemoDetailPanel>,
  demoProfile: DemoProfileBundle,
): FeaturePopoverModel | null {
  const dashboard = demoProfile.dashboard;

  switch (panel.type) {
    case "pillar":
    case "assessmentPillar": {
      const pillar = getProfilePillarById(demoProfile, panel.pillarId);
      if (!pillar) return null;
      const connection = getProfileConnectionByPillarId(demoProfile, panel.pillarId);
      const isAssessment = panel.type === "assessmentPillar";
      return {
        title: pillar.name,
        badge: `${pillar.priorityLevel} priority`,
        subtitle: pillar.maturityLabel,
        description: isAssessment
          ? pillar.keyFinding
          : pillar.summary,
        whyItMatters: pillar.primaryRisk,
        businessValue: isAssessment
          ? pillar.expectedBusinessOutcome
          : pillar.businessImpact,
        metrics: [
          { label: "Current", value: String(pillar.score) },
          { label: "Target", value: String(pillar.targetScore) },
        ],
        highlights: isAssessment
          ? [pillar.recommendedImprovement]
          : [pillar.exampleRecommendation],
        relatedFeatures: ["Living Execution Plan", "Recommendations", "Executive Reports"],
        relatedActions: relatedFromConnection({
          pillarId: pillar.id,
          recommendationId: connection?.recommendationId,
          roadmapInitiativeId: connection?.roadmapInitiativeId,
        }),
      };
    }
    case "recommendation": {
      const recommendation = getProfileRecommendationById(demoProfile, panel.recommendationId);
      if (!recommendation) return null;
      const connection = getProfileConnectionByRecommendationId(
        demoProfile,
        panel.recommendationId,
      );
      return {
        title: recommendation.title,
        badge: `${recommendation.priority} · ${recommendation.status}`,
        subtitle: `${recommendation.effort} effort · ${recommendation.estimatedTimeline}`,
        description: recommendation.whyItMatters,
        whyItMatters: recommendation.riskIfIgnored,
        businessValue: recommendation.expectedOutcome,
        metrics: [
          { label: "Investment", value: recommendation.estimatedCost },
          { label: "Pillar", value: recommendation.pillarName },
        ],
        highlights:
          recommendation.dependencies.length > 0
            ? recommendation.dependencies.slice(0, 3)
            : undefined,
        relatedFeatures: ["Living Execution Plan", "Projects", "Budget"],
        relatedActions: relatedFromConnection({
          pillarId: connection?.pillarId ?? recommendation.pillarId,
          recommendationId: recommendation.id,
          roadmapInitiativeId:
            connection?.roadmapInitiativeId ?? recommendation.relatedRoadmapInitiativeId,
        }),
      };
    }
    case "roadmapInitiative": {
      const initiative = getProfileRoadmapInitiativeById(demoProfile, panel.initiativeId);
      if (!initiative) return null;
      return {
        title: initiative.title,
        badge: `${initiative.priority} · ${initiative.quarter}`,
        subtitle: initiative.status,
        description: initiative.description,
        whyItMatters: `Budget: ${initiative.budget}`,
        businessValue: initiative.expectedBusinessOutcome,
        metrics: [{ label: "Completion", value: `${initiative.completionPercent}%` }],
        relatedFeatures: ["Recommendations", "Projects", "Budget"],
        relatedActions: relatedFromConnection({
          pillarId: initiative.relatedPillarId,
          recommendationId: initiative.relatedRecommendationId,
          roadmapInitiativeId: initiative.id,
        }),
      };
    }
    case "project":
    case "projectExecution":
    case "nextAction": {
      const projectId =
        panel.type === "nextAction"
          ? dashboard.nextAction.relatedProjectId
          : panel.projectId;
      const project = getProfileProjectById(demoProfile, projectId);
      if (!project) return null;
      const isExecution = panel.type === "projectExecution";
      return {
        title: project.title,
        badge: `${project.priority} · ${project.status}`,
        subtitle: `${project.progress}% complete · ${project.owner}`,
        description:
          panel.type === "nextAction"
            ? dashboard.nextAction.body
            : project.description,
        whyItMatters: project.businessObjective,
        businessValue: project.businessOutcome,
        metrics: [
          { label: "Budget", value: project.budgetRange },
          { label: "Target", value: project.targetCompletion },
        ],
        highlights: isExecution
          ? project.milestones.slice(0, 3)
          : project.milestones.slice(0, 2),
        relatedFeatures: ["Living Execution Plan", "Recommendations", "Business Reviews"],
        relatedActions: relatedFromConnection({
          pillarId: project.pillarId,
          recommendationId: project.relatedRecommendationId,
          roadmapInitiativeId: project.relatedRoadmapInitiativeId,
          projectId: project.id,
        }),
      };
    }
    case "roadmap": {
      return {
        title: "Living Execution Plan",
        badge: "Strategic plan",
        description:
          "Quarter-based implementation plan that sequences security, infrastructure, and continuity work.",
        whyItMatters:
          "Gives leadership a clear sequence of initiatives so investment and delivery stay aligned.",
        businessValue:
          "Turns assessment findings into an executable plan with measurable StackScore progress.",
        highlights: dashboard.roadmapQuarters.flatMap((quarter) =>
          quarter.items.slice(0, 1).map((item) => `${quarter.quarter}: ${item}`),
        ),
        relatedFeatures: ["Recommendations", "Projects", "Budget"],
        relatedActions: [
          { label: "Business Review", panel: { type: "executiveReview" }, featureKey: demoFeatureKey("executiveReview") },
        ],
      };
    }
    case "qbr": {
      const review = dashboard.quarterlyReview;
      return {
        title: "Executive Business Review",
        badge: review.status,
        subtitle: review.nextReviewDate,
        description: review.executiveSummary[0] ?? "Flexible strategic technology review.",
        whyItMatters:
          "Keeps executives aligned on score movement, risks, and upcoming priorities.",
        businessValue: `Score change +${review.scoreChange} · Budget variance ${review.budgetVariance}`,
        highlights: review.executiveSummary.slice(0, 3),
        relatedFeatures: ["Living Execution Plan", "Budget", "Reports"],
      };
    }
    case "executiveReview": {
      const review = demoProfile.executiveReview;
      const qbr = dashboard.quarterlyReview;
      return {
        title: "Executive Business Review",
        badge: "Leadership brief",
        subtitle: qbr.nextReviewDate,
        description: review.executiveSummary[0] ?? "Executive review of technology progress.",
        whyItMatters: review.openRisks[0]
          ? `Open risk: ${review.openRisks[0]}`
          : "Surfaces open risks and upcoming priorities for decision makers.",
        businessValue: review.executiveRecommendations[0] ?? review.roadmapProgress[0] ?? "",
        highlights: [
          ...review.completedInitiatives.slice(0, 2),
          ...review.topPrioritiesNextQuarter.slice(0, 2),
        ],
        metrics: review.scoreTrend.slice(-2).map((point) => ({
          label: point.quarter,
          value: String(point.score),
        })),
        relatedFeatures: ["Living Execution Plan", "Projects", "Budget"],
      };
    }
    case "report": {
      const preview = getProfileReportPreviewById(demoProfile, panel.reportId);
      if (!preview) return null;
      const firstSection = preview.sections[0];
      return {
        title: preview.title,
        badge: "Executive report",
        subtitle: `Generated ${preview.generatedDate}`,
        description: preview.subtitle,
        whyItMatters:
          firstSection?.body ??
          firstSection?.bullets?.[0] ??
          "Documents technology strategy for executive stakeholders.",
        businessValue:
          "Creates a shareable record of maturity, priorities, and recommended investment.",
        metrics: preview.metrics?.slice(0, 4).map((metric) => ({
          label: metric.label,
          value: metric.value,
        })),
        highlights: firstSection?.bullets?.slice(0, 3),
        relatedFeatures: ["Assessment", "Living Execution Plan", "Business Reviews"],
      };
    }
    case "executiveWidget": {
      const widget = getExecutiveWidgetById(panel.widgetId);
      if (!widget) return null;
      return {
        title: widget.label,
        badge: "Executive insight",
        description: widget.value,
        whyItMatters: widget.whyExecutivesCare,
        businessValue: widget.businessImplications,
        highlights: [widget.suggestedAction],
        relatedFeatures: ["Dashboard", "Living Execution Plan", "Budget"],
      };
    }
    case "strategicInitiative": {
      const initiative = getStrategicInitiativeById(panel.initiativeId);
      if (!initiative) return null;
      return {
        title: initiative.title,
        badge: initiative.priority,
        subtitle: initiative.timeframe,
        description: initiative.summary,
        whyItMatters: "Connects long-range planning to the living execution plan.",
        businessValue: initiative.businessOutcome,
        relatedFeatures: ["Living Execution Plan", "Budget", "Business Reviews"],
      };
    }
    case "collaborationParticipant": {
      const participant = getCollaborationParticipantById(panel.participantId);
      if (!participant) return null;
      return {
        title: participant.label,
        badge: participant.role,
        description: participant.description,
        whyItMatters: "Keeps stakeholders aligned on priorities, progress, and decisions.",
        businessValue: "Reduces miscommunication across IT, finance, and leadership.",
        highlights: participant.connections,
        relatedFeatures: ["Projects", "Reports", "Business Reviews"],
      };
    }
    case "ecosystemNode": {
      const node = getEcosystemNodeById(panel.nodeId);
      if (!node) return null;
      return {
        title: node.label,
        badge: "Platform capability",
        description: node.description,
        whyItMatters: "Shows how StackScore capabilities reinforce one another.",
        businessValue: node.businessValue,
        relatedFeatures: ["Dashboard", "Living Execution Plan", "Reports"],
      };
    }
    case "budget": {
      const budget = dashboard.budget;
      return {
        title: "Technology Budget",
        badge: "Annual plan",
        description:
          "Tracks planned, approved, committed, and remaining technology investment across the organization.",
        whyItMatters:
          "Gives leadership visibility into future technology spending and helps prioritize investments.",
        businessValue:
          "Improves budgeting accuracy and supports strategic planning across the roadmap.",
        metrics: [
          { label: "Planned", value: formatDemoCurrency(budget.planned) },
          { label: "Approved", value: formatDemoCurrency(budget.approved) },
          { label: "Committed", value: formatDemoCurrency(budget.committed) },
          { label: "Remaining", value: formatDemoCurrency(budget.remaining) },
        ],
        relatedFeatures: ["Living Execution Plan", "Recommendations", "Executive Reports"],
        relatedActions: [
          {
            label: "Living Execution Plan",
            panel: { type: "roadmap" },
            featureKey: demoFeatureKey("roadmap"),
          },
          {
            label: "Business Review",
            panel: { type: "executiveReview" },
            featureKey: demoFeatureKey("executiveReview"),
          },
        ],
      };
    }
    default:
      return null;
  }
}
