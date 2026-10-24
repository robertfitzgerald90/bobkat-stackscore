import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileBarChart,
  Layers,
  Lightbulb,
  ListOrdered,
  Map,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import { SERVICES_CTA_DESTINATIONS } from "@/lib/services/cta";
import { STACKSCORE_PUBLIC_ROUTES } from "@/lib/marketing/stackscore-routes";

export const LEARN_PAGE_HERO = {
  eyebrow: "Technology Maturity Assessment",
  titleLead: "Understand your technology.",
  titleAccent: "Know what to improve.",
  description:
    "StackScore evaluates your technology environment and turns the findings into clear maturity scores, prioritized recommendations, and a practical path forward — so leaders can act with confidence.",
  priceLine: "$1,500 one-time · Executive-ready deliverables included",
} as const;

export type LearnProcessStep = {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const LEARN_PROCESS_STEPS: LearnProcessStep[] = [
  {
    step: 1,
    title: "Assess your technology environment",
    description:
      "Complete a guided Technology Maturity Assessment across the StackScore pillars — identity, security, operations, continuity, and strategy.",
    icon: Search,
  },
  {
    step: 2,
    title: "Understand your technology maturity",
    description:
      "See your overall StackScore and pillar-level results so you know where you stand — and where exposure is highest.",
    icon: Layers,
  },
  {
    step: 3,
    title: "Review findings and recommendations",
    description:
      "Receive prioritized recommendations with business impact, recommended actions, and expected outcomes — not a raw dump of technical tickets.",
    icon: Lightbulb,
  },
  {
    step: 4,
    title: "Prioritize improvements and plan next steps",
    description:
      "Use your results in the client portal to focus leadership attention, sequence improvements, and decide what to tackle first.",
    icon: Map,
  },
];

/** Public-safe sample recommendations — no engine codes, triggers, or customer data. */
export type LearnRecommendationSample = {
  id: string;
  title: string;
  priority: "Critical" | "High" | "Medium";
  businessImpact: string;
  recommendedAction: string;
  expectedOutcome: string;
};

export const LEARN_RECOMMENDATION_SAMPLES: LearnRecommendationSample[] = [
  {
    id: "learn-rec-mfa",
    title: "Strengthen multi-factor authentication coverage",
    priority: "Critical",
    businessImpact:
      "Reduces account-takeover risk for email, collaboration, and administrative access.",
    recommendedAction:
      "Require MFA for all users and privileged accounts, with clear exception handling.",
    expectedOutcome: "Fewer compromised accounts and a stronger identity baseline.",
  },
  {
    id: "learn-rec-endpoint",
    title: "Centralize endpoint protection and monitoring",
    priority: "Critical",
    businessImpact:
      "Limits ransomware and malware dwell time across workstations and servers.",
    recommendedAction:
      "Deploy managed endpoint protection with centralized visibility and alerting.",
    expectedOutcome: "Faster detection and containment when endpoints are targeted.",
  },
  {
    id: "learn-rec-backup",
    title: "Establish immutable backup and recovery testing",
    priority: "High",
    businessImpact:
      "Protects critical systems and data when primary environments are unavailable.",
    recommendedAction:
      "Implement offline/immutable backups and schedule recovery tests for priority systems.",
    expectedOutcome: "Documented recovery confidence and reduced downtime risk.",
  },
];

export type LearnRoadmapPhase = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export const LEARN_ROADMAP_PHASES: LearnRoadmapPhase[] = [
  {
    id: "phase-1",
    label: "Phase 1",
    title: "Stabilize critical exposure",
    description:
      "Address the highest-impact security and continuity gaps that create immediate business risk.",
  },
  {
    id: "phase-2",
    label: "Phase 2",
    title: "Strengthen operations",
    description:
      "Improve monitoring, patch discipline, and day-to-day technology reliability.",
  },
  {
    id: "phase-3",
    label: "Phase 3",
    title: "Plan for growth",
    description:
      "Align technology investments with business goals once foundational risk is under control.",
  },
];

export type LearnDeliverableGroup = {
  id: string;
  title: string;
  description: string;
  items: string[];
  icon: LucideIcon;
};

export const LEARN_DELIVERABLE_GROUPS: LearnDeliverableGroup[] = [
  {
    id: "included",
    title: "Included with the Technology Maturity Assessment",
    description: "What you receive with the one-time $1,500 assessment purchase.",
    icon: ClipboardCheck,
    items: [
      "Guided Technology Maturity Assessment in the StackScore portal",
      "Overall StackScore and pillar maturity results",
      "Prioritized recommendations with business-focused guidance",
      "Executive-ready assessment report (on-screen and PDF)",
      "Technology profile baseline for your organization",
      "Client portal access to review results and next priorities",
    ],
  },
  {
    id: "platform",
    title: "Available in the StackScore platform",
    description: "Capabilities you can use as you work with your assessment results.",
    icon: Target,
    items: [
      "Recommendation workspace with priority and status tracking",
      "Improvement planning views to sequence initiatives over time",
      "Assessment history to compare progress after future reassessments",
      "Shared visibility for leadership and consulting partners",
    ],
  },
  {
    id: "optional",
    title: "Optional advisory & services",
    description:
      "Available through Bobkat IT — not automatically included with assessment purchase.",
    icon: ShieldCheck,
    items: [
      "Strategy review session to walk through findings with a consultant",
      "Strategic IT Consulting (ongoing advisory with StackScore as your planning portal)",
      "Implementation and managed services for approved initiatives",
    ],
  },
];

export const LEARN_CONTINUED_IMPROVEMENT = {
  eyebrow: "Continued improvement",
  title: "Technology maturity is a journey, not a one-time score",
  description:
    "After your baseline assessment, StackScore supports reassessment so you can measure progress, refresh priorities, and keep technology aligned with the business.",
  points: [
    {
      icon: RefreshCw,
      title: "Reassess when it matters",
      description:
        "Run a new assessment after meaningful improvements or on a planned cadence to update your StackScore and recommendations.",
    },
    {
      icon: ListOrdered,
      title: "Keep priorities current",
      description:
        "As risks change, refresh what leadership should focus on next — without starting from a blank spreadsheet.",
    },
    {
      icon: FileBarChart,
      title: "Show measurable progress",
      description:
        "Compare assessment history so executives can see how technology maturity improves over time.",
    },
  ],
} as const;

export const LEARN_CONVERSION_CTAS = {
  snapshot: SERVICES_CTA_DESTINATIONS.snapshot,
  purchase: {
    label: "Purchase Full Technology Assessment — $1,500",
    href: STACKSCORE_PUBLIC_ROUTES.assessmentOffer,
  },
  consultation: SERVICES_CTA_DESTINATIONS.generalConsultation,
  demo: {
    label: "Explore Interactive Demo",
    href: STACKSCORE_PUBLIC_ROUTES.demo,
  },
} as const;
