import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileBarChart,
  FileText,
  Layers,
  Lightbulb,
  Map,
} from "lucide-react";

export type OfferFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type OfferTimelineStep = {
  title: string;
  description: string;
};

export type OfferShowcaseScreenshot = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type AssessmentOfferShowcaseSection = {
  id: string;
  eyebrow: string;
  heading: string;
  description: string;
  outcomes: string[];
  outcomesLabel?: string;
  image: OfferShowcaseScreenshot;
  imagePosition: "left" | "right" | "full";
  variant?: "hero" | "feature";
};

export const ASSESSMENT_OFFER_SHOWCASE_INTRO = {
  eyebrow: "Inside StackScore",
  title: "What You'll Receive",
  description:
    "From your first StackScore assessment through ongoing improvement, every deliverable is designed to help you see the current environment, understand progress, and plan technology as a business function.",
} as const;

export const ASSESSMENT_OFFER_SHOWCASE_SECTIONS: AssessmentOfferShowcaseSection[] = [
  {
    id: "client-overview",
    variant: "hero",
    eyebrow: "Client Overview",
    heading: "See Your Technology Clearly",
    description:
      "Gain an immediate understanding of your organization's technology health. Review your current StackScore, projected improvement, active projects, critical recommendations, immediate priorities, and executive technology profile from one centralized dashboard.",
    outcomes: [
      "Current and projected technology maturity",
      "Immediate-focus recommendations",
      "Active project visibility",
      "Critical risk exposure",
      "Executive technology profile",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/client-overview.png",
      width: 1969,
      height: 1027,
      alt: "StackScore client overview with technology maturity score and strategic priorities",
    },
    imagePosition: "full",
  },
  {
    id: "technology-journey",
    variant: "feature",
    eyebrow: "Measurable Progress",
    heading: "See How Technology Improves Over Time",
    description:
      "Track your organization's complete technology journey from assessment through execution. StackScore displays the initial, current, projected, and target maturity scores while preserving a chronological history of assessments, projects, reports, quarterly reviews, and technology-profile milestones.",
    outcomes: [
      "Initial, current, projected, and target scores",
      "Assessment and reassessment history",
      "Project milestones",
      "Executive reports and quarterly reviews",
      "Technology maturity profile events",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/technology-journey.png",
      width: 1973,
      height: 1261,
      alt: "StackScore technology journey showing score progression and milestone history",
    },
    imagePosition: "left",
  },
  {
    id: "vcio-dashboard",
    variant: "feature",
    eyebrow: "Ongoing Technology Leadership",
    heading: "Manage Technology Beyond the Assessment",
    description:
      "The assessment establishes the starting point. The StackScore vCIO dashboard provides an ongoing executive view of technology status, roadmap progress, quarterly review readiness, active projects, high-priority risks, upcoming renewals, technology budget, executive reports, and subscription status.",
    outcomes: [
      "Overall technology status",
      "Technology budget visibility",
      "Roadmap progress",
      "Quarterly review schedule",
      "Upcoming renewals",
      "Subscription and executive-report status",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/vcio-dashboard1.png",
      width: 1974,
      height: 941,
      alt: "StackScore vCIO client success dashboard overview",
    },
    imagePosition: "right",
  },
  {
    id: "client-success",
    variant: "feature",
    eyebrow: "Client Success",
    heading: "Keep Every Improvement Initiative Moving",
    description:
      "Stay organized between strategy sessions with a clear client-success checklist, recent account activity, active projects, completed recommendations, and quick access to the tools that matter most.",
    outcomes: [
      "Complete the client technology profile",
      "Review recent reports and account activity",
      "View the roadmap and executive reports",
      "Open active projects",
      "Manage the subscription",
      "Contact Bobkat IT",
      "Review current-quarter priorities",
      "Monitor projects in progress",
    ],
    outcomesLabel: "Capabilities",
    image: {
      src: "/images/vcio/vcio-dashboard2.png",
      width: 1971,
      height: 892,
      alt: "StackScore dashboard showing open recommendations and active projects",
    },
    imagePosition: "left",
  },
  {
    id: "executive-planning",
    variant: "feature",
    eyebrow: "Strategic Planning",
    heading: "Plan Technology Like a Business Function",
    description:
      "Capture planning notes, document decisions, track technology events, maintain vendor and lifecycle information, and prepare for quarterly strategy sessions from one connected workspace.",
    outcomes: [
      "Create executive and strategy-session notes",
      "Review the technology-event timeline",
      "Maintain the documented technology stack",
      "Track vendor renewals and annual budgets",
      "Confirm quarterly strategy-session dates",
      "Monitor onboarding status",
      "View and generate quarterly reviews",
      "Review subscription and billing status",
      "Manage the subscription",
    ],
    outcomesLabel: "Capabilities",
    image: {
      src: "/images/vcio/vcio-dashboard3.png",
      width: 1577,
      height: 1193,
      alt: "StackScore executive planning workspace with notes, timeline, and subscription status",
    },
    imagePosition: "right",
  },
];

export const OFFER_FEATURES: OfferFeature[] = [
  {
    icon: ClipboardCheck,
    title: "Technology Maturity Assessment",
    description:
      "A structured evaluation across identity, security, operations, and strategy — not a generic IT checklist.",
  },
  {
    icon: FileText,
    title: "Executive Summary",
    description:
      "Plain-language findings leadership can act on, without wading through technical jargon.",
  },
  {
    icon: Map,
    title: "Technology Roadmap",
    description:
      "Prioritized initiatives sequenced to reduce risk, improve reliability, and support growth.",
  },
  {
    icon: Layers,
    title: "Eight Technology Pillars",
    description:
      "Maturity scoring across the full StackScore framework — from endpoints to technology strategy.",
  },
  {
    icon: Lightbulb,
    title: "Strategic Recommendations",
    description:
      "Actionable guidance tied to business impact, priority, and estimated maturity improvement.",
  },
  {
    icon: FileBarChart,
    title: "Executive Report",
    description:
      "A polished, shareable deliverable ready for leadership meetings and board conversations.",
  },
];

export const OFFER_TIMELINE: OfferTimelineStep[] = [
  {
    title: "Purchase",
    description: "Complete secure checkout in minutes. You'll receive confirmation immediately.",
  },
  {
    title: "Assessment Access",
    description: "Get guided access to your StackScore assessment workspace and instructions.",
  },
  {
    title: "Complete Assessment",
    description: "Work through the structured questionnaire at your pace — typically one session.",
  },
  {
    title: "Report Generation",
    description: "StackScore compiles your maturity score, pillars, and executive-ready outputs.",
  },
  {
    title: "Strategy Review Session",
    description: "Review findings with Bobkat IT and leave with clarity on what to do next.",
  },
];

export const OFFER_WHY_POINTS = [
  {
    title: "Structured methodology",
    description:
      "Built on the StackScore Technology Maturity Framework — consistent, repeatable, and defensible.",
  },
  {
    title: "Executive-ready deliverables",
    description:
      "Outputs designed for owners and leadership teams, not just IT staff.",
  },
  {
    title: "Business-focused recommendations",
    description:
      "Every finding connects to operational risk, productivity, or growth — not theory for its own sake.",
  },
  {
    title: "Actionable roadmap",
    description:
      "Move from assessment to improvement plan with clear priorities and practical sequencing.",
  },
  {
    title: "Designed for growing businesses",
    description:
      "Right-sized for organizations that need enterprise-grade insight without enterprise complexity.",
  },
];
