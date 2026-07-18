/** Customer-facing copy for Strategic IT Consulting subscription lifecycle emails. */

export const VCIO_CUSTOMER_EMAIL_COPY = {
  welcome: {
    subject: "Welcome to Bobkat IT Strategic IT Consulting",
    previewText: "Your strategic technology advisory service is now active.",
    heroTitle: "Welcome to Strategic IT Consulting",
    heroDescription:
      "Your strategic technology advisory service is now active. Let's turn your technology roadmap into measurable business progress.",
    paragraphs: [
      "Welcome to Bobkat IT Strategic IT Consulting.",
      "We're excited to partner with you as your trusted technology advisor. Through our Strategic IT Consulting service, you'll receive ongoing technology planning, executive guidance, roadmap management, quarterly reviews, and access to the StackScore platform.",
      "Complete your onboarding so we can prepare your first strategy session with the right context and priorities.",
    ],
    summaryTitle: "What happens next",
    summaryItems: [
      "Complete your onboarding questionnaire",
      "Review your technology roadmap and recommendations",
      "Schedule your first strategy session",
      "Begin tracking progress through your StackScore portal",
    ],
    primaryCta: "Complete Onboarding",
    secondaryCta: "Open StackScore Portal",
  },
  welcomeManagedServices: {
    subject: "Your Strategic IT Consulting Service Is Active",
    heroTitle: "Your Strategic IT Consulting Service Is Active",
    heroDescription:
      "Welcome back. Your Bobkat IT relationship is already connected to your StackScore planning workspace.",
    paragraphs: [
      "Your organization is already configured, so you can move directly into planning.",
      "Review your roadmap, share current priorities, and complete onboarding so your first strategy session starts with the right context.",
    ],
    summaryItems: [
      "Review your roadmap",
      "Begin quarterly planning",
      "Complete onboarding",
    ],
    primaryCta: "Review Roadmap",
    secondaryCta: "Complete Onboarding",
  },
  welcomeAssessmentCustomer: {
    subject: "Welcome Back to Bobkat IT Strategic IT Consulting",
    heroTitle: "Welcome Back to Strategic IT Consulting",
    heroDescription:
      "Your existing assessment is connected and your advisory roadmap is ready.",
    paragraphs: [
      "We connected your technology assessment, recommendations, improvement plan, and active projects.",
      "Complete the quick setup to tell us what has changed since your assessment, then review your roadmap with your Bobkat IT advisor.",
    ],
    summaryItems: [
      "Technology Score: {technologyScore}",
      "Recommendations are available",
      "Your roadmap is ready for review",
    ],
    primaryCta: "Complete Quick Setup",
    secondaryCta: "Open StackScore Portal",
  },
  subscriptionReceived: {
    heroTitle: "Your Strategic IT Consulting Service Is Active",
    previewText: "Your strategic technology advisory service is now active.",
    paragraphs: [
      "Thank you for subscribing to Bobkat IT Strategic IT Consulting.",
      "Your subscription includes ongoing technology planning, executive guidance, roadmap management, quarterly reviews, and access to the StackScore platform.",
    ],
    summaryItems: [
      "Activate or sign in to StackScore",
      "Complete your onboarding questionnaire",
      "Review your roadmap and priorities",
    ],
    primaryCtaActivation: "Activate StackScore",
    primaryCtaOnboarding: "Complete Onboarding",
    secondaryCta: "Open StackScore Portal",
  },
  cancellationScheduled: {
    subject: "Strategic IT Consulting Cancellation Scheduled",
    previewText:
      "You'll continue to receive consulting services until your subscription expires.",
    heroTitle: "Consulting Service Cancellation Scheduled",
    paragraphs: [
      "Your Strategic IT Consulting subscription is scheduled to end at the conclusion of your current billing period.",
      "You'll continue to receive consulting services and retain access to your StackScore workspace until your subscription expires.",
    ],
    primaryCta: "Manage Subscription",
  },
  paymentFailed: {
    subject: "Payment Action Required for Strategic IT Consulting",
    previewText:
      "Update your payment information to avoid interruption to your consulting services.",
    heroTitle: "Payment Action Required",
    paragraphs: [
      "We were unable to process your latest payment for your Strategic IT Consulting subscription.",
      "To avoid any interruption to your consulting services and access to the StackScore platform, please update your payment information.",
    ],
    primaryCta: "Manage Billing",
  },
  subscriptionEnded: {
    subject: "Your Strategic IT Consulting Service Has Ended",
    previewText:
      "Your StackScore workspace and historical assessment data have been safely preserved.",
    heroTitle: "Strategic IT Consulting Ended",
    paragraphs: [
      "Your Strategic IT Consulting subscription has ended.",
      "Your StackScore workspace and historical assessment data have been safely preserved should you choose to continue working with us in the future.",
    ],
    primaryCta: "Reactivate Consulting Service",
  },
  subscriptionReactivated: {
    subject: "Welcome Back to Bobkat IT Strategic IT Consulting",
    previewText: "Your Strategic IT Consulting service is active again.",
    heroTitle: "Your Strategic IT Consulting Service Is Active",
    paragraphs: [
      "Your Bobkat IT Strategic IT Consulting service has been reactivated.",
      "Your StackScore workspace, roadmap, recommendations, reports, and historical records remain available so we can continue moving your technology strategy forward.",
    ],
    primaryCta: "Open StackScore Portal",
  },
} as const;

export function formatAssessmentWelcomeSummaryItems(technologyScore: string | null | undefined) {
  return VCIO_CUSTOMER_EMAIL_COPY.welcomeAssessmentCustomer.summaryItems.map((item) =>
    item.replace("{technologyScore}", technologyScore ?? "Available in your dashboard"),
  );
}
