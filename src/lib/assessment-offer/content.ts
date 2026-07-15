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
  image?: OfferShowcaseScreenshot;
  images?: OfferShowcaseScreenshot[];
  imagePosition: "left" | "right";
  frameTitle: string;
};

export type AssessmentOfferWorkflowStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const ASSESSMENT_OFFER_SHOWCASE_INTRO = {
  eyebrow: "Platform Walkthrough",
  title: "See How StackScore Guides Your Technology Strategy",
  description:
    "From executive visibility to quarterly strategy, StackScore turns complex technology environments into clear business outcomes—so leadership always knows where you stand and what comes next.",
} as const;

export const ASSESSMENT_OFFER_SHOWCASE_SECTIONS: AssessmentOfferShowcaseSection[] = [
  {
    id: "executive-visibility",
    eyebrow: "Executive Visibility",
    heading: "Understand Your Technology at a Glance",
    description:
      "StackScore transforms technical complexity into an executive-friendly dashboard. Instantly understand your organization's technology health, business context, critical risks, maturity score, and recommended improvement path without digging through spreadsheets or reports.",
    outcomes: [
      "Executive technology health overview",
      "Business context and maturity profile",
      "Critical risk visibility",
      "Technology StackScore",
      "Immediate executive insights",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/technology-maturity-overview.png",
      width: 1837,
      height: 337,
      alt: "StackScore executive technology maturity overview dashboard",
    },
    imagePosition: "left",
    frameTitle: "Executive Technology Dashboard",
  },
  {
    id: "measurable-progress",
    eyebrow: "Measurable Progress",
    heading: "Track Technology Improvements Over Time",
    description:
      "Technology management isn't a one-time project. StackScore records every assessment, recommendation, project, quarterly review, and milestone so you always understand how your technology environment has evolved.",
    outcomes: [
      "Initial, current, projected, and target scores",
      "Historical assessments",
      "Project milestones",
      "Executive reporting timeline",
      "Continuous technology improvement",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/tech-journey-card.png",
      width: 533,
      height: 531,
      alt: "StackScore technology journey card showing score progression over time",
    },
    imagePosition: "right",
    frameTitle: "Technology Maturity Platform",
  },
  {
    id: "actionable-priorities",
    eyebrow: "Actionable Priorities",
    heading: "Know Exactly What Comes Next",
    description:
      "Rather than overwhelming you with hundreds of technical tasks, StackScore automatically identifies and prioritizes the improvements that create the greatest business impact.",
    outcomes: [
      "Immediate executive focus",
      "Risk-based prioritization",
      "Critical recommendations",
      "Quarterly planning priorities",
      "Strategic execution roadmap",
    ],
    outcomesLabel: "Key outcomes",
    images: [
      {
        src: "/images/vcio/immediate-focus.png",
        width: 1837,
        height: 586,
        alt: "StackScore immediate executive focus recommendations",
      },
      {
        src: "/images/vcio/current-priorities.png",
        width: 856,
        height: 430,
        alt: "StackScore current quarterly planning priorities",
      },
    ],
    imagePosition: "left",
    frameTitle: "Strategic Priorities",
  },
  {
    id: "ongoing-leadership",
    eyebrow: "Ongoing Technology Leadership",
    heading: "Manage Technology Beyond the Assessment",
    description:
      "The assessment establishes your baseline. The StackScore vCIO dashboard becomes your ongoing technology command center for quarterly reviews, budgeting, executive reporting, project tracking, subscription management, and long-term planning.",
    outcomes: [
      "Technology roadmap progress",
      "Budget visibility",
      "Quarterly review readiness",
      "Active projects",
      "Executive reporting",
      "Subscription management",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/vcio-executive-summary.png",
      width: 1748,
      height: 450,
      alt: "StackScore vCIO executive summary dashboard",
    },
    imagePosition: "right",
    frameTitle: "Executive Technology Dashboard",
  },
  {
    id: "technology-lifecycle",
    eyebrow: "Technology Lifecycle",
    heading: "Manage Vendors, Budgets, and Renewals",
    description:
      "Track hardware, software, vendors, subscriptions, renewal dates, and annual technology budgets from one centralized workspace. Never lose visibility into your technology investments.",
    outcomes: [
      "Vendor management",
      "Renewal tracking",
      "Annual budgeting",
      "Lifecycle planning",
      "Technology inventory",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/budget-lifecycle-planning.png",
      width: 1734,
      height: 473,
      alt: "StackScore budget and technology lifecycle planning workspace",
    },
    imagePosition: "left",
    frameTitle: "Technology Lifecycle",
  },
  {
    id: "quarterly-strategy",
    eyebrow: "Quarterly Strategy",
    heading: "Keep Technology Moving Forward",
    description:
      "Technology strategy doesn't stop after the assessment. Quarterly reviews ensure progress continues through executive reporting, roadmap updates, planning sessions, and measurable business outcomes.",
    outcomes: [
      "Quarterly business reviews",
      "Executive reporting",
      "Strategy sessions",
      "Report generation",
      "Continuous improvement",
    ],
    outcomesLabel: "Key outcomes",
    image: {
      src: "/images/vcio/quarterly-reviews.png",
      width: 565,
      height: 384,
      alt: "StackScore quarterly strategy reviews and executive reporting",
    },
    imagePosition: "right",
    frameTitle: "Quarterly Strategy",
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
