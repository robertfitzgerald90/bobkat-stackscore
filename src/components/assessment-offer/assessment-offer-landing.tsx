import type { AssessmentOfferAttribution } from "@/lib/assessment-offer/attribution";
import { LearnAboutStackScoreLanding } from "@/components/learn-about-stackscore/learn-about-stackscore-landing";

/**
 * Assessment offer / Learn About StackScore landing.
 * Implemented by the SS-MKT-001 learn page redesign.
 */
export function AssessmentOfferLanding({
  attribution,
}: {
  attribution?: AssessmentOfferAttribution;
}) {
  return <LearnAboutStackScoreLanding attribution={attribution} />;
}
