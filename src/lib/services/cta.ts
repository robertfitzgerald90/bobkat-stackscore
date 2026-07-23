import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";
import {
  STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
  VCIO_OFFER_PATH,
} from "@/lib/marketing/stackscore-routes";

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
    href: "/assessment-offer",
  },
  solutionsLanding: {
    label: "Learn about solutions",
    href: BOBKAT_IT_URLS.solutions,
  },
  servicesLanding: {
    label: "Learn about services",
    href: BOBKAT_IT_URLS.services,
  },
  assessmentLearnMore: {
    label: "Learn More",
    href: "/assessment-offer",
  },
  vcioOffer: {
    label: "Get Strategic IT Consulting",
    href: STRATEGIC_IT_CONSULTING_CHECKOUT_PATH,
  },
  strategicItConsultingLearnMore: {
    label: "Learn about Strategic IT Consulting",
    href: BOBKAT_IT_URLS.strategicItConsulting,
  },
  digitalPresenceExplore: {
    label: "Explore Digital Presence",
    href: "https://cal.com/bobkat-it/bobkat-it-free-consult",
  },
  generalConsultation: {
    label: "Schedule Consultation",
    href: "https://cal.com/bobkat-it/bobkat-it-free-consult",
  },
  managedItExplore: {
    label: "Explore Managed IT",
    href: "https://cal.com/bobkat-it/managed-it-consultation",
  },
  strategicConsultingExplore: {
    label: "Learn about Strategic IT Consulting",
    href: BOBKAT_IT_URLS.strategicItConsulting,
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
  bobkatHome: {
    label: "Visit Bobkat IT",
    href: BOBKAT_IT_URLS.home,
  },
  legacyVcioOffer: {
    label: "Explore Technology Advisory",
    href: VCIO_OFFER_PATH,
  },
} as const;

export type ServicesCtaKey = keyof typeof SERVICES_CTA_DESTINATIONS;
