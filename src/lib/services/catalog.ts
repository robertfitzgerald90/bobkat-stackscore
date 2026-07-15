import {
  BarChart3,
  ClipboardCheck,
  CloudCog,
  Home,
  Network,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { ServicesCtaKey } from "./cta";

export type ServiceCatalogItem = {
  id: string;
  title: string;
  eyebrow: string;
  price: string;
  description: string;
  highlights: string[];
  primaryCtaLabel: string;
  primaryCta: ServicesCtaKey;
  secondaryCta?: ServicesCtaKey;
  imagePosition: "left" | "right";
  image: {
    src: string;
    alt: string;
    fit?: "cover" | "contain";
  };
  icon: LucideIcon;
};

export const SERVICES_CATALOG: ServiceCatalogItem[] = [
  {
    id: "technology-maturity-assessment",
    title: "Technology Maturity Assessment",
    eyebrow: "Standardized Product",
    price: "$1,500 one-time",
    description:
      "Gain a complete understanding of your technology environment with a comprehensive assessment powered by StackScore.",
    highlights: [
      "Comprehensive IT Assessment",
      "Executive Report & Risk Analysis",
      "Strategic Technology Roadmap",
    ],
    primaryCtaLabel: "Purchase Assessment",
    primaryCta: "purchaseAssessment",
    secondaryCta: "assessmentLearnMore",
    imagePosition: "right",
    image: {
      src: "/services/technology-maturity-assessment.png",
      alt: "Bobkat IT Technology Maturity Assessment service preview",
    },
    icon: ClipboardCheck,
  },
  {
    id: "stackscore-vcio",
    title: "StackScore vCIO",
    eyebrow: "Ongoing Technology Advisory",
    price: "$300/month",
    description:
      "Turn your technology assessment into an ongoing strategy. StackScore vCIO gives your business continued access to its technology roadmap, executive reporting, improvement tracking, and a dedicated strategic technology advisor.",
    highlights: [
      "Quarterly Technology Reviews",
      "Technology Roadmap & Budget Planning",
      "Direct Access to a Strategic IT Advisor",
    ],
    primaryCtaLabel: "Start vCIO Service",
    primaryCta: "vcioOffer",
    secondaryCta: "generalConsultation",
    imagePosition: "left",
    image: {
      src: "/services/stackscore-vcio.png",
      alt: "StackScore vCIO strategic technology advisory and client portal",
    },
    icon: BarChart3,
  },
  {
    id: "managed-it-services",
    title: "Managed IT Services",
    eyebrow: "Ongoing IT Partnership",
    price: "Starting at $15/device/month",
    description:
      "Proactive IT management that keeps your devices secure, reliable, monitored, and up to date.",
    highlights: [
      "Endpoint Monitoring & Maintenance",
      "Patch Management & Remote Support",
      "Cybersecurity & Microsoft 365 Management",
    ],
    primaryCtaLabel: "Schedule Consultation",
    primaryCta: "managedItConsultation",
    imagePosition: "right",
    image: {
      // TODO: Replace this static graphic with a $15/device/month version; the current image includes baked-in $500/month pricing.
      src: "/services/managed-it-services.png",
      alt: "Bobkat IT Managed IT Services service preview",
    },
    icon: ShieldCheck,
  },
  {
    id: "network-infrastructure-deployment",
    title: "Network Infrastructure & Deployment",
    eyebrow: "Secure Infrastructure",
    price: "Projects starting at $2,500",
    description:
      "Build a secure, scalable, and high-performance network designed around your business.",
    highlights: [
      "Secure Business Networking",
      "Enterprise Wi-Fi & Firewall Deployment",
      "Scalable Infrastructure Design",
    ],
    primaryCtaLabel: "Discuss Your Project",
    primaryCta: "networkInfrastructureConsultation",
    imagePosition: "left",
    image: {
      src: "/services/network-infrastructure-deployment.png",
      alt: "Bobkat IT Network Infrastructure and Deployment service preview",
    },
    icon: Network,
  },
  {
    id: "backup-disaster-recovery",
    title: "Backup & Disaster Recovery",
    eyebrow: "Business Continuity",
    price: "Starting at $800/month",
    description:
      "Protect your business against data loss, ransomware, and unexpected disasters with managed backup and recovery solutions.",
    highlights: [
      "Automated Backup Protection",
      "Business Continuity Planning",
      "Rapid Disaster Recovery",
    ],
    primaryCtaLabel: "Schedule Consultation",
    primaryCta: "backupDisasterRecoveryConsultation",
    imagePosition: "right",
    image: {
      src: "/services/backup-disaster-recovery.png",
      alt: "Bobkat IT Backup and Disaster Recovery service preview",
    },
    icon: RotateCcw,
  },
  {
    id: "technology-implementation",
    title: "Technology Implementation",
    eyebrow: "Project Delivery",
    price: "Projects starting at $3,000",
    description:
      "Successfully deploy new technology with confidence, from Microsoft 365 migrations to cloud solutions and business software implementations.",
    highlights: [
      "Microsoft 365 & Cloud Migrations",
      "Infrastructure Modernization",
      "Expert Project Management",
    ],
    primaryCtaLabel: "Discuss Your Project",
    primaryCta: "technologyImplementationConsultation",
    imagePosition: "left",
    image: {
      src: "/services/technology-implementation.png",
      alt: "Bobkat IT Technology Implementation service preview",
    },
    icon: CloudCog,
  },
  {
    id: "residential-it-support",
    title: "Residential IT Support",
    eyebrow: "Home Technology Help",
    price: "Starting at $75",
    description:
      "Professional technology support for your home, including computers, Wi-Fi, malware removal, and smart home devices.",
    highlights: [
      "Computer Repair & Optimization",
      "Home Wi-Fi & Network Support",
      "Device Setup & Security",
    ],
    primaryCtaLabel: "Book Residential Support",
    primaryCta: "residentialSupport",
    imagePosition: "right",
    image: {
      src: "/services/residential-it-support.png",
      alt: "Bobkat IT Residential IT Support service preview",
    },
    icon: Home,
  },
];

export type ServicePricingItem = {
  title: string;
  price: string;
  frequency?: string;
  description: string;
  ctaLabel: string;
  cta: ServicesCtaKey;
  badge?: string;
};

export const SERVICES_PRICING: ServicePricingItem[] = [
  {
    title: "Technology Assessment",
    price: "$1,500",
    frequency: "One-time",
    description:
      "Comprehensive assessment, executive report, risk analysis, and strategic roadmap.",
    ctaLabel: "Purchase Assessment",
    cta: "purchaseAssessment",
  },
  {
    title: "StackScore vCIO",
    price: "$300/month",
    description:
      "Ongoing technology strategy, quarterly reviews, roadmap management, and direct advisor access.",
    ctaLabel: "Get Started",
    cta: "vcioOffer",
    badge: "Strategic Partnership",
  },
  {
    title: "Managed IT Services",
    price: "Starting at $15/device/month",
    description: "Monitoring, maintenance, patching, support, and endpoint management.",
    ctaLabel: "Schedule Consultation",
    cta: "managedItConsultation",
  },
  {
    title: "Backup & Disaster Recovery",
    price: "Starting at $800/month",
    description:
      "Managed backups, monitoring, recovery planning, and business continuity support.",
    ctaLabel: "Schedule Consultation",
    cta: "backupDisasterRecoveryConsultation",
  },
];
