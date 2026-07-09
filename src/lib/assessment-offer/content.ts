import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileBarChart,
  FileText,
  Layers,
  Lightbulb,
  Map,
  Video,
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

export type OfferShowcaseHero = {
  title: string;
  description: string;
  image: OfferShowcaseScreenshot;
};

export type OfferShowcaseFeature = {
  id: string;
  title: string;
  description: string;
  image: OfferShowcaseScreenshot;
};

export const OFFER_SHOWCASE_JOURNEY = [
  "Complete Assessment",
  "Review Executive Dashboard",
  "Prioritize Recommendations",
  "Receive Executive Report",
] as const;

export const OFFER_SHOWCASE_HERO: OfferShowcaseHero = {
  title: "Executive Dashboard",
  description:
    "See your StackScore, projected improvement, and top strengths and risks the moment your assessment is complete.",
  image: {
    src: "/images/executive-dashboard.png",
    width: 1287,
    height: 933,
    alt: "StackScore executive dashboard with overall score, strengths, and risks",
  },
};

export const OFFER_SHOWCASE_FEATURES: OfferShowcaseFeature[] = [
  {
    id: "assessment-experience",
    title: "Assessment Experience",
    description:
      "Work through a structured questionnaire at your pace. StackScore translates your answers into a clear maturity score.",
    image: {
      src: "/images/recommendation-summary-report.png",
      width: 807,
      height: 576,
      alt: "StackScore assessment results showing current and projected scores",
    },
  },
  {
    id: "technology-maturity",
    title: "Executive Dashboard",
    description:
      "Drill into pillar-level maturity scores and tiers across your technology environment from one centralized view.",
    image: {
      src: "/images/technology-pillars.png",
      width: 1296,
      height: 439,
      alt: "StackScore technology pillars with maturity scores",
    },
  },
  {
    id: "recommendations",
    title: "Customer Recommendations",
    description:
      "Focus on the highest-impact improvements first — each with priority, business context, and estimated score gains.",
    image: {
      src: "/images/immediate-priorities.png",
      width: 1295,
      height: 874,
      alt: "StackScore immediate priorities and recommendations",
    },
  },
  {
    id: "executive-report",
    title: "Executive Report",
    description:
      "Download a polished, board-ready deliverable you can share with leadership and use to plan next steps.",
    image: {
      src: "/images/report-cover.png",
      width: 809,
      height: 785,
      alt: "StackScore executive report cover page",
    },
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
  {
    icon: Video,
    title: "Review Session",
    description:
      "Walk through results with a Bobkat IT consultant and align on next steps for your business.",
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
