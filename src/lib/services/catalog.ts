import { BarChart3, Compass, Globe, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ServicesCtaKey } from "./cta";

export type ServiceCatalogItem = {
  id: string;
  keyword: string;
  title: string;
  headline: string;
  description: string;
  supportingKeywords: [string, string, string];
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
    id: "managed-it-services",
    keyword: "Operate",
    title: "Managed IT Services",
    headline: "Keep Your Technology Running Smoothly",
    description:
      "Proactive monitoring, maintenance, cybersecurity, Microsoft 365 management, endpoint protection, backups, and ongoing support that keep your business secure, reliable, and productive.",
    supportingKeywords: ["Monitor", "Protect", "Support"],
    primaryCtaLabel: "Schedule Consultation",
    primaryCta: "managedItConsultation",
    imagePosition: "right",
    image: {
      src: "/services/managed-it-services.png",
      alt: "Bobkat IT Managed IT Services service preview",
    },
    icon: ShieldCheck,
  },
  {
    id: "strategic-it-consulting",
    keyword: "Plan",
    title: "Strategic IT Consulting",
    headline: "Align Technology With Business Goals",
    description:
      "Technology strategy, infrastructure planning, cybersecurity guidance, project leadership, budgeting, vendor selection, and executive technology consulting that helps organizations make smarter technology decisions.",
    supportingKeywords: ["Strategy", "Roadmaps", "Leadership"],
    primaryCtaLabel: "Explore Strategic Consulting",
    primaryCta: "assessmentLearnMore",
    secondaryCta: "generalConsultation",
    imagePosition: "left",
    image: {
      src: "/services/strategic-it-consulting.png",
      alt: "Bobkat IT Strategic IT Consulting service preview",
    },
    icon: Compass,
  },
  {
    id: "digital-presence",
    keyword: "Grow",
    title: "Digital Presence",
    headline: "Strengthen Your Digital Presence",
    description:
      "Professional websites, secure client portals, executive dashboards, workflow improvements, and modern digital experiences that strengthen your brand and improve customer engagement.",
    supportingKeywords: ["Websites", "Portals", "Dashboards"],
    primaryCtaLabel: "Explore Digital Presence",
    primaryCta: "digitalPresenceExplore",
    secondaryCta: "generalConsultation",
    imagePosition: "right",
    image: {
      src: "/services/digital-presence.png",
      alt: "Bobkat IT Digital Presence — websites, client portals, and executive dashboards",
    },
    icon: Globe,
  },
  {
    id: "stackscore-technology-advisory",
    keyword: "Optimize",
    title: "StackScore Technology Advisory",
    headline: "Continuous Technology Leadership",
    description:
      "Turn your StackScore assessment into an ongoing technology strategy through quarterly reviews, executive reporting, roadmap management, budgeting guidance, and continuous strategic planning.",
    supportingKeywords: ["Assess", "Improve", "Lead"],
    primaryCtaLabel: "Start Technology Advisory",
    primaryCta: "vcioOffer",
    secondaryCta: "generalConsultation",
    imagePosition: "left",
    image: {
      src: "/services/stackscore-vcio.png",
      alt: "StackScore Technology Advisory strategic planning and client portal",
    },
    icon: BarChart3,
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
    title: "Managed IT Services",
    price: "Starting at $15/device/month",
    description: "Monitoring, maintenance, patching, support, and endpoint management.",
    ctaLabel: "Schedule Consultation",
    cta: "managedItConsultation",
  },
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
    title: "StackScore Technology Advisory",
    price: "$300/month",
    description:
      "Ongoing technology strategy, quarterly reviews, roadmap management, and direct advisor access.",
    ctaLabel: "Get Started",
    cta: "vcioOffer",
    badge: "Strategic Partnership",
  },
  {
    title: "Digital Presence",
    price: "Custom Solutions",
    description:
      "Professional websites, secure client portals, and executive dashboards tailored to your business.",
    ctaLabel: "Explore Digital Presence",
    cta: "digitalPresenceExplore",
  },
];
