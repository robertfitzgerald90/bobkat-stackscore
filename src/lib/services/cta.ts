export const SERVICES_CTA_DESTINATIONS = {
  snapshot: {
    label: "Start Free Technology Snapshot",
    href: "/technology-snapshot",
  },
  purchaseAssessment: {
    label: "Purchase Technology Assessment",
    href: "/assessment-offer",
    checkoutEndpoint: "/api/checkout/create-session",
  },
  assessmentLearnMore: {
    label: "Learn More",
    href: "/assessment-offer",
  },
  generalConsultation: {
    label: "Schedule Consultation",
    href: process.env.NEXT_PUBLIC_CAL_GENERAL_CONSULTATION_URL ?? "https://cal.com/bobkatit",
  },
  residentialSupport: {
    label: "Book Residential Support",
    href:
      process.env.NEXT_PUBLIC_CAL_RESIDENTIAL_SUPPORT_URL ??
      process.env.NEXT_PUBLIC_CAL_GENERAL_CONSULTATION_URL ??
      "https://cal.com/bobkatit",
  },
} as const;

export type ServicesCtaKey = keyof typeof SERVICES_CTA_DESTINATIONS;
