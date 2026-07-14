export const SERVICES_CTA_DESTINATIONS = {
  snapshot: {
    label: "Start My Free Technology Snapshot",
    href: "/technology-snapshot",
  },
  assessmentInvitation: {
    label: "Start Technology Assessment",
    href: "/assessment-invitation",
  },
  purchaseAssessment: {
    label: "Purchase Technology Assessment",
    href: "https://cal.com/bobkat-it/technology-maturity-strategy",
  },
  solutionsLanding: {
    label: "Explore All Solutions",
    href: "/solutions",
  },
  assessmentLearnMore: {
    label: "Learn More",
    href: "/assessment-offer",
  },
  vcioOffer: {
    label: "Learn More",
    href: "/vcio-offer",
  },
  generalConsultation: {
    label: "Schedule Consultation",
    href: "https://cal.com/bobkat-it/bobkat-it-free-consult",
  },
  managedItConsultation: {
    label: "Schedule Consultation",
    href: "https://cal.com/bobkat-it/managed-it-consultation",
  },
  networkInfrastructureConsultation: {
    label: "Discuss Your Project",
    href: "https://cal.com/bobkat-it/network-infrastructure-consultation",
  },
  backupDisasterRecoveryConsultation: {
    label: "Schedule Consultation",
    href: "https://cal.com/bobkat-it/backup-disaster-recovery-consultation",
  },
  technologyImplementationConsultation: {
    label: "Discuss Your Project",
    href: "https://cal.com/bobkat-it/technology-implementation-consultation",
  },
  residentialSupport: {
    label: "Book Residential Support",
    href: "https://cal.com/bobkat-it/30min",
  },
} as const;

export type ServicesCtaKey = keyof typeof SERVICES_CTA_DESTINATIONS;
