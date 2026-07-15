import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileBarChart,
  FileText,
  Layers,
  Lightbulb,
  ListOrdered,
  Map,
  Play,
  Search,
  TrendingUp,
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
  imagePosition: "left" | "right";
};

export type AssessmentOfferWorkflowStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const OFFER_HERO_SCREENSHOT: OfferShowcaseScreenshot = {
  src: "/images/vcio/technology-maturity-overview.png",
  width: 1837,
  height: 337,
  alt: "StackScore technology maturity overview showing executive technology health at a glance",
};

export const ASSESSMENT_OFFER_SHOWCASE_INTRO = {
  eyebrow: "Platform Walkthrough",
  title: "Technology clarity, built for leadership",
  description:
    "One capability at a time—see how StackScore turns complex technology environments into clear executive decisions.",
} as const;

export const ASSESSMENT_OFFER_SHOWCASE_SECTIONS: AssessmentOfferShowcaseSection[] = [
  {
    id: "executive-visibility",
    eyebrow: "Executive Visibility",
    heading: "Understand Your Technology At A Glance",
    description:
      "The Technology Maturity Assessment transforms technical findings into executive-ready insights. Instantly understand your overall technology health, maturity score, projected improvements, and where your organization should focus first.",
    outcomes: [
      "Technology maturity score",
      "Executive technology profile",
      "Critical business risks",
      "Improvement opportunities",
      "Technology health overview",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/technology-maturity-overview.png",
      width: 1837,
      height: 337,
      alt: "StackScore technology maturity overview with executive technology health insights",
    },
    imagePosition: "left",
  },
  {
    id: "measurable-progress",
    eyebrow: "Measurable Progress",
    heading: "Track Every Technology Improvement",
    description:
      "Every assessment, recommendation, project, report, and quarterly review becomes part of your organization's technology journey. StackScore records measurable progress so leadership can see exactly how technology improves over time.",
    outcomes: [
      "Initial, current, projected, and target scores",
      "Assessment history",
      "Project milestones",
      "Executive reporting timeline",
      "Technology maturity evolution",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/technology-journey.png",
      width: 1971,
      height: 1127,
      alt: "StackScore technology journey showing measurable progress over time",
    },
    imagePosition: "right",
  },
  {
    id: "executive-leadership",
    eyebrow: "Executive Leadership",
    heading: "Lead Technology With Confidence",
    description:
      "Your executive dashboard provides a complete operational snapshot of technology health, roadmap progress, active initiatives, quarterly review readiness, subscription status, budget visibility, and overall organizational readiness.",
    outcomes: [
      "Technology health",
      "Roadmap progress",
      "Executive reporting",
      "Quarterly review readiness",
      "Business technology visibility",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/archive/vcio-dashboard1.png",
      width: 1975,
      height: 937,
      alt: "StackScore executive leadership dashboard with technology health and roadmap progress",
    },
    imagePosition: "left",
  },
  {
    id: "technology-lifecycle",
    eyebrow: "Technology Lifecycle",
    heading: "Plan Technology Investments",
    description:
      "Maintain complete visibility into vendors, hardware, software, budgets, subscriptions, renewals, and lifecycle planning from one centralized workspace.",
    outcomes: [
      "Vendor management",
      "Renewal tracking",
      "Annual technology budgeting",
      "Lifecycle planning",
      "Technology inventory",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/budget-lifecycle-planning.png",
      width: 1734,
      height: 473,
      alt: "StackScore technology lifecycle planning with vendor, budget, and renewal visibility",
    },
    imagePosition: "right",
  },
  {
    id: "continuous-improvement",
    eyebrow: "Continuous Improvement",
    heading: "Turn Technology Into An Ongoing Strategy",
    description:
      "Technology doesn't stop after the assessment. Schedule recurring executive reviews, monitor progress, generate reports, and keep technology aligned with business goals throughout the year.",
    outcomes: [
      "Quarterly strategy sessions",
      "Executive review reports",
      "Continuous improvement",
      "Business alignment",
      "Long-term planning",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/quarterly-reviews.png",
      width: 565,
      height: 384,
      alt: "StackScore quarterly reviews for ongoing technology strategy",
    },
    imagePosition: "left",
  },
];

export const ASSESSMENT_OFFER_WORKFLOW_STEPS: AssessmentOfferWorkflowStep[] = [
  {
    id: "assess",
    title: "Assess",
    description: "Establish your technology baseline with a structured maturity assessment.",
    icon: Search,
  },
  {
    id: "prioritize",
    title: "Prioritize",
    description: "Surface the improvements that reduce risk and create the most business impact.",
    icon: ListOrdered,
  },
  {
    id: "plan",
    title: "Plan",
    description: "Build a roadmap with budgets, milestones, and executive-ready reporting.",
    icon: Map,
  },
  {
    id: "execute",
    title: "Execute",
    description: "Track projects, recommendations, and technology initiatives as they move forward.",
    icon: Play,
  },
  {
    id: "review",
    title: "Review",
    description: "Run quarterly reviews with leadership-ready insights and strategy sessions.",
    icon: FileBarChart,
  },
  {
    id: "improve",
    title: "Improve",
    description: "Measure progress over time and continuously raise your technology maturity.",
    icon: TrendingUp,
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
