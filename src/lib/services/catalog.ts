import { ClipboardCheck, Compass, Globe, Home, ShieldCheck, type LucideIcon } from "lucide-react";
import { publicAssetUrl } from "@/lib/branding/assets";
import type { ServicesCtaKey } from "./cta";

export const SERVICES_JOURNEY_KEYWORDS = ["Operate", "Plan", "Grow"] as const;

export type FeaturedProductItem = {
  id: string;
  title: string;
  price: string;
  description: string;
  highlights: string[];
  primaryCtaLabel: string;
  primaryCta: ServicesCtaKey;
  secondaryCtaLabel: string;
  secondaryCta: ServicesCtaKey;
  image: {
    src: string;
    alt: string;
  };
  icon: LucideIcon;
};

export type ServiceCatalogItem = {
  id: string;
  keyword: string;
  title: string;
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
  };
  icon: LucideIcon;
};

export type ResidentialServiceItem = {
  id: string;
  title: string;
  price: string;
  description: string;
  highlights: string[];
  primaryCtaLabel: string;
  primaryCta: ServicesCtaKey;
  image: {
    src: string;
    alt: string;
  };
  icon: LucideIcon;
};

export const FEATURED_PRODUCT: FeaturedProductItem = {
  id: "technology-maturity-assessment",
  title: "Technology Maturity Assessment",
  price: "$1,500 One-Time",
  description:
    "Understand your technology before deciding where it should go. Our Technology Maturity Assessment uses the StackScore framework to evaluate your organization across the core pillars of technology, identify strengths and opportunities, and provide a prioritized roadmap for future technology investments.",
  highlights: [
    "Comprehensive technology assessment",
    "Executive-level maturity report",
    "Prioritized technology roadmap",
    "Strategic recommendations aligned with business goals",
    "Foundation for future consulting and managed services",
  ],
  primaryCtaLabel: "Purchase Assessment",
  primaryCta: "purchaseAssessment",
  secondaryCtaLabel: "Learn More",
  secondaryCta: "assessmentLearnMore",
  image: {
    src: publicAssetUrl("/services/technology-maturity-assessment.png"),
    alt: "Bobkat IT Technology Maturity Assessment overview",
  },
  icon: ClipboardCheck,
};

export const CORE_SERVICES: ServiceCatalogItem[] = [
  {
    id: "managed-it-services",
    keyword: "Operate",
    title: "Managed IT Services",
    price: "Starting at $15/device/month",
    description:
      "Keep your technology secure, reliable, and running at peak performance through proactive monitoring, maintenance, cybersecurity, and ongoing support.",
    highlights: [
      "24/7 Monitoring & Alerting",
      "Endpoint Protection & Security",
      "Microsoft 365 Administration",
      "Patch Management & Backups",
      "Help Desk & Ongoing Support",
    ],
    primaryCtaLabel: "Explore Managed IT",
    primaryCta: "managedItExplore",
    secondaryCta: "generalConsultation",
    imagePosition: "right",
    image: {
      src: publicAssetUrl("/services/managed-it-services.png"),
      alt: "Bobkat IT Managed IT Services service preview",
    },
    icon: ShieldCheck,
  },
  {
    id: "strategic-it-consulting",
    keyword: "Plan",
    title: "Strategic IT Consulting",
    price: "Starting at $500/month",
    description:
      "Align technology with your business goals through strategic planning, roadmaps, budgeting, and executive technology guidance.",
    highlights: [
      "Technology Strategy & Planning",
      "Executive Living Execution Plans",
      "Budget & Vendor Planning",
      "Cybersecurity Guidance",
      "Quarterly Strategic Reviews",
    ],
    primaryCtaLabel: "Explore Strategic Consulting",
    primaryCta: "strategicConsultingExplore",
    secondaryCta: "generalConsultation",
    imagePosition: "left",
    image: {
      src: publicAssetUrl("/services/strategic-it-consulting.png"),
      alt: "Bobkat IT Strategic IT Consulting service preview",
    },
    icon: Compass,
  },
  {
    id: "digital-presence",
    keyword: "Grow",
    title: "Digital Presence",
    price: "Starting at $2,500",
    description:
      "Strengthen your online presence through modern websites, secure client portals, and executive dashboards that help your business communicate and grow.",
    highlights: [
      "Professional Website Design",
      "Secure Client Portals",
      "Executive Dashboards",
      "Website Modernization",
      "Digital Strategy & Optimization",
    ],
    primaryCtaLabel: "Explore Digital Presence",
    primaryCta: "digitalPresenceExplore",
    secondaryCta: "generalConsultation",
    imagePosition: "right",
    image: {
      src: publicAssetUrl("/services/digital-presence.png"),
      alt: "Bobkat IT Digital Presence — websites, client portals, and executive dashboards",
    },
    icon: Globe,
  },
];

export const RESIDENTIAL_SERVICE: ResidentialServiceItem = {
  id: "residential-it-support",
  title: "Residential IT Support",
  price: "Starting at $150/visit",
  description:
    "Reliable in-home and remote technology support for individuals and families. Whether you need help with computers, Wi-Fi, new device setup, or technology troubleshooting, Bobkat IT provides professional assistance without the frustration.",
  highlights: [
    "Computer Repair & Troubleshooting",
    "Home Wi-Fi & Network Setup",
    "New Device Installation",
    "Virus Removal & Security",
    "Technology Training & Support",
  ],
  primaryCtaLabel: "Schedule Residential Support",
  primaryCta: "residentialSupport",
  image: {
    src: publicAssetUrl("/services/residential-it-support.png"),
    alt: "Bobkat IT Residential IT Support service preview",
  },
  icon: Home,
};

/** @deprecated Use CORE_SERVICES instead. Kept for backwards compatibility. */
export const SERVICES_CATALOG = CORE_SERVICES;

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
    title: "Technology Maturity Assessment",
    price: "$1,500",
    frequency: "One-time",
    description:
      "Comprehensive assessment, executive report, risk analysis, and strategic roadmap.",
    ctaLabel: "Purchase Assessment",
    cta: "purchaseAssessment",
    badge: "Recommended First Step",
  },
  {
    title: "Managed IT Services",
    price: "Starting at $15/device/month",
    description: "Monitoring, maintenance, patching, support, and endpoint management.",
    ctaLabel: "Explore Managed IT",
    cta: "managedItExplore",
  },
  {
    title: "Strategic IT Consulting",
    price: "Starting at $500/month",
    description:
      "Technology strategy, executive roadmaps, budgeting, vendor planning, and quarterly reviews.",
    ctaLabel: "Explore Strategic Consulting",
    cta: "strategicConsultingExplore",
  },
  {
    title: "Digital Presence",
    price: "Starting at $2,500",
    description:
      "Professional websites, secure client portals, and executive dashboards tailored to your business.",
    ctaLabel: "Explore Digital Presence",
    cta: "digitalPresenceExplore",
  },
];
