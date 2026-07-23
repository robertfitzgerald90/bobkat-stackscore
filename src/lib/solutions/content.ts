import { ClipboardCheck, Factory, LifeBuoy, MonitorCheck, Network, ShieldCheck, type LucideIcon } from "lucide-react";
import { publicAssetUrl } from "@/lib/branding/assets";
import { BOBKAT_IT_URLS } from "@/lib/marketing/bobkat-website";

export type SolutionFamily = {
  id: "essentials" | "professional" | "manufacturing";
  title: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  href: string;
  image: {
    src: string;
    alt: string;
  };
  icon: LucideIcon;
};

export type SolutionMethodStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const SOLUTIONS_HERO_IMAGE = {
  src: publicAssetUrl("/solutions/Offerings HERO Image.png"),
  alt: "Bobkat IT standardized solution families overview",
} as const;

export const SOLUTION_FAMILIES: SolutionFamily[] = [
  {
    id: "essentials",
    title: "Bobkat Essentials",
    tagline: "Secure, reliable technology for small businesses.",
    description:
      "Perfect for organizations with approximately 5-20 employees looking for dependable IT, cybersecurity, Microsoft 365, networking, monitoring, and proactive support.",
    ctaLabel: "Explore Essentials",
    href: BOBKAT_IT_URLS.solutionsEssentials,
    image: {
      src: publicAssetUrl("/solutions/Essentials Image.png"),
      alt: "Bobkat Essentials solution preview",
    },
    icon: ShieldCheck,
  },
  {
    id: "professional",
    title: "Bobkat Professional",
    tagline: "Strategic technology for growing organizations.",
    description:
      "Designed for businesses that require advanced security, centralized management, technology planning, and enterprise-inspired IT leadership.",
    ctaLabel: "Explore Professional",
    href: BOBKAT_IT_URLS.solutionsProfessional,
    image: {
      src: publicAssetUrl("/solutions/Professional Image.png"),
      alt: "Bobkat Professional solution preview",
    },
    icon: MonitorCheck,
  },
  {
    id: "manufacturing",
    title: "Bobkat Manufacturing",
    tagline: "Technology built for industrial operations.",
    description:
      "Designed for manufacturers, warehouses, and production environments that require secure infrastructure, operational reliability, and business continuity.",
    ctaLabel: "Explore Manufacturing",
    href: BOBKAT_IT_URLS.solutionsManufacturing,
    image: {
      src: publicAssetUrl("/solutions/Manufacturing Image.png"),
      alt: "Bobkat Manufacturing solution preview",
    },
    icon: Factory,
  },
];

export const SOLUTION_METHOD_STEPS: SolutionMethodStep[] = [
  {
    title: "Understand",
    description: "Every engagement begins with understanding your business and technology.",
    icon: ClipboardCheck,
  },
  {
    title: "Design",
    description: "Recommendations are tailored to your operational goals.",
    icon: Network,
  },
  {
    title: "Deploy",
    description: "Solutions are implemented using documented best practices.",
    icon: ShieldCheck,
  },
  {
    title: "Support",
    description: "We proactively monitor, maintain, and improve your technology over time.",
    icon: LifeBuoy,
  },
];
