import type { OfferShowcaseScreenshot } from "@/lib/assessment-offer/content";

export type InvitationScreenshot = OfferShowcaseScreenshot;

export const INVITATION_HERO_SCREENSHOT: InvitationScreenshot = {
  src: "/images/vcio/client-overview.png",
  width: 1976,
  height: 1027,
  alt: "StackScore client overview dashboard showing technology maturity and executive priorities",
};

export const INVITATION_SNAPSHOT_REPORT_SCREENSHOT: InvitationScreenshot = {
  src: "/images/technology-snapshot-report.png",
  width: 611,
  height: 586,
  alt: "StackScore Technology Snapshot report with maturity score and key observations",
};

export const INVITATION_JOURNEY_SCREENSHOT: InvitationScreenshot = {
  src: "/images/technology-journey.png",
  width: 1971,
  height: 1127,
  alt: "StackScore technology journey and improvement roadmap",
};
