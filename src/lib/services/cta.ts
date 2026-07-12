export const SERVICES_CTA_DESTINATIONS = {
  snapshot: {
    label: "Start My Free Technology Snapshot",
    href: "/technology-snapshot",
  },
  purchaseAssessment: {
    label: "Purchase Technology Assessment",
    href: "/assessment-offer",
  },
  assessmentLearnMore: {
    label: "Learn More",
    href: "/assessment-offer",
  },
  generalConsultation: {
    label: "Schedule Consultation",
    href: "https://cal.com/robert-fitzgerald-osa9tt/bobkat-it-free-consult",
  },
  managedItConsultation: {
    label: "Schedule Consultation",
    href: "https://cal.com/robert-fitzgerald-osa9tt/managed-it-consultation",
  },
  networkInfrastructureConsultation: {
    label: "Discuss Your Project",
    href: "https://cal.com/robert-fitzgerald-osa9tt/network-infrastructure-consultation",
  },
  backupDisasterRecoveryConsultation: {
    label: "Schedule Consultation",
    href: "https://cal.com/robert-fitzgerald-osa9tt/backup-disaster-recovery-consultation",
  },
  technologyImplementationConsultation: {
    label: "Discuss Your Project",
    href: "https://cal.com/robert-fitzgerald-osa9tt/technology-implementation-consultation",
  },
  residentialSupport: {
    label: "Book Residential Support",
    href: "https://cal.com/robert-fitzgerald-osa9tt/30min",
  },
} as const;

export type ServicesCtaKey = keyof typeof SERVICES_CTA_DESTINATIONS;
