import {
  Activity,
  FileBarChart,
  Map,
  Route,
  ShieldAlert,
  Target,
} from "lucide-react";
import type { OfferFeature, OfferTimelineStep } from "@/lib/assessment-offer/content";

/** Reserved for future email-link personalization (inviter, campaign, greeting). */
export type AssessmentInvitationPersonalization = {
  invitedByName?: string;
  invitedByOrganization?: string;
  campaignName?: string;
  recipientFirstName?: string;
};

export type AssessmentInvitationContext = {
  prospectId?: string;
  campaignId?: string;
};

export const INVITATION_DISCOVER_FEATURES: OfferFeature[] = [
  {
    icon: Activity,
    title: "Technology Health",
    description:
      "Understand how your organization performs across the key areas of modern IT.",
  },
  {
    icon: ShieldAlert,
    title: "Risk Identification",
    description: "Identify weaknesses before they become expensive business problems.",
  },
  {
    icon: Target,
    title: "Recommendations",
    description: "Receive practical recommendations prioritized by business impact.",
  },
  {
    icon: Map,
    title: "Roadmap",
    description: "See how improvements can be implemented over time.",
  },
];

export const INVITATION_TIMELINE: OfferTimelineStep[] = [
  {
    title: "Complete the Technology Snapshot",
    description:
      "Answer a short set of questions across key technology areas — free and takes just minutes.",
  },
  {
    title: "Review Your Results",
    description:
      "See a high-level maturity view and understand where deeper improvements may exist.",
  },
  {
    title: "Unlock the Full Technology Assessment",
    description:
      "Continue with the comprehensive assessment when you're ready for executive-ready deliverables.",
  },
  {
    title: "Meet with Bobkat IT",
    description: "Walk through findings with a consultant and align on practical next steps.",
  },
];

export const INVITATION_BENEFITS: OfferFeature[] = [
  {
    icon: Target,
    title: "Business-focused recommendations",
    description:
      "Guidance tied to operational risk, productivity, and growth — not technical theory.",
  },
  {
    icon: FileBarChart,
    title: "Executive-friendly reporting",
    description:
      "Clear outputs designed for owners and leadership teams who need to act, not decode IT jargon.",
  },
  {
    icon: Route,
    title: "Technology roadmap planning",
    description:
      "Prioritized initiatives sequenced to reduce risk, improve reliability, and support growth.",
  },
];

