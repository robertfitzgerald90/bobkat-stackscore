import {
  ClipboardCheck,
  CloudCog,
  Home,
  LucideIcon,
  Network,
  RotateCcw,
  ShieldCheck,
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
  image: {
    src: string;
    alt: string;
  };
  icon: LucideIcon;
};

export const SERVICES_CATALOG: ServiceCatalogItem[] = [
  {
    id: "technology-maturity-assessment",
    title: "Technology Maturity Assessment",
    eyebrow: "Standardized Product",
    price: "$500",
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
    image: {
      src: "/services/technology-maturity-assessment.png",
      alt: "Bobkat IT Technology Maturity Assessment service preview",
    },
    icon: ClipboardCheck,
  },
  {
    id: "managed-it-services",
    title: "Managed IT Services",
    eyebrow: "Ongoing IT Partnership",
    price: "Starting at $500/month",
    description:
      "Proactive IT management that keeps your business secure, reliable, and productive.",
    highlights: [
      "Proactive Monitoring & Maintenance",
      "Cybersecurity & Microsoft 365 Management",
      "Dedicated Strategic IT Partner",
    ],
    primaryCtaLabel: "Schedule Consultation",
    primaryCta: "generalConsultation",
    image: {
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
    primaryCta: "generalConsultation",
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
    primaryCta: "generalConsultation",
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
    primaryCta: "generalConsultation",
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
    image: {
      src: "/services/residential-it-support.png",
      alt: "Bobkat IT Residential IT Support service preview",
    },
    icon: Home,
  },
];
