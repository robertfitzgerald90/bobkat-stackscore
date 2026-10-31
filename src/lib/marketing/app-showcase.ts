/**
 * SS-WEB-004 — shared StackScore 2.0 application showcase for assessment marketing pages.
 * Screenshots captured from the live public demo (Northstar Manufacturing fictional data).
 */

export type AppShowcaseScreenshot = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type AppShowcaseSection = {
  id: string;
  heading: string;
  description: string;
  image: AppShowcaseScreenshot;
};

/** Intrinsic pixel size of captured @2x assets (1440×900 CSS viewport × 2 DPR). */
const SHOT_W = 2880;
const SHOT_H = 1800;

export const STACKSCORE_APP_SHOWCASE_SECTIONS: AppShowcaseSection[] = [
  {
    id: "understand-technology",
    heading: "Understand Your Technology",
    description:
      "Get a clear view of your organization's technology maturity, identify areas requiring attention, and understand where your technology investments can make the greatest difference.",
    image: {
      src: "/images/marketing/ss-web-004/overview.webp",
      width: SHOT_W,
      height: SHOT_H,
      alt: "StackScore Overview for Northstar Manufacturing showing Official StackScore 60, maturity summary, and eight technology pillars",
    },
  },
  {
    id: "explore-landscape",
    heading: "Explore Your Technology Landscape",
    description:
      "Explore eight technology pillars to understand your organization's strengths, weaknesses, and opportunities for improvement.",
    image: {
      src: "/images/marketing/ss-web-004/explore.webp",
      width: SHOT_W,
      height: SHOT_H,
      alt: "StackScore Explore Technology Intelligence Center showing Identity & Access pillar detail, assessed controls, and improvement opportunities",
    },
  },
  {
    id: "turn-insights-into-action",
    heading: "Turn Insights Into Action",
    description:
      "Translate assessment findings into a structured roadmap with prioritized initiatives and clear next steps.",
    image: {
      src: "/images/marketing/ss-web-004/roadmap.webp",
      width: SHOT_W,
      height: SHOT_H,
      alt: "StackScore Roadmap showing Official StackScore separate from roadmap progress, with Stabilize and Strengthen implementation phases",
    },
  },
];

export const STACKSCORE_APP_SHOWCASE_CAPTION =
  "Screenshots from the StackScore interactive demo — fictional sample data (Northstar Manufacturing). Official StackScore updates only after reassessment; roadmap progress does not automatically change the official score.";
