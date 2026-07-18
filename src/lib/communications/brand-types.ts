import { BRAND } from "@/lib/branding";
import { EMAIL_BRAND_ASSETS } from "@/emails/assets";

export type SocialLink = {
  platform: string;
  url: string;
  label?: string;
};

export type SharedComponentSettings = {
  header?: {
    showSecondaryLogo?: boolean;
    tagline?: string;
  };
  footer?: {
    teamLabel?: string;
    servicesLine?: string;
  };
  primaryButton?: {
    borderRadius?: string;
  };
  secondaryButton?: {
    borderRadius?: string;
  };
  signature?: {
    name?: string;
    title?: string;
  };
  socialLinks?: {
    enabled?: boolean;
  };
};

export type CommunicationBrandConfig = {
  primaryLogoUrl: string;
  secondaryLogoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
  companyName: string;
  productName: string;
  websiteUrl: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  copyrightText: string;
  footerTagline: string;
  socialLinks: SocialLink[];
  componentSettings: SharedComponentSettings;
};

export const DEFAULT_COMMUNICATION_BRAND: CommunicationBrandConfig = {
  primaryLogoUrl: EMAIL_BRAND_ASSETS.bobkatItLogoNavy,
  secondaryLogoUrl: null,
  primaryColor: BRAND.primaryColor,
  secondaryColor: BRAND.secondaryColor,
  accentColor: "#2563EB",
  buttonPrimaryBg: BRAND.primaryColor,
  buttonPrimaryText: "#FFFFFF",
  buttonSecondaryBg: BRAND.lightBackground,
  buttonSecondaryText: BRAND.primaryColor,
  fontFamilyHeading: "Georgia, 'Times New Roman', serif",
  fontFamilyBody: "Arial, Helvetica, sans-serif",
  companyName: BRAND.companyName,
  productName: BRAND.productName,
  websiteUrl: BRAND.website,
  supportEmail: BRAND.email,
  supportPhone: BRAND.phone,
  address: "",
  copyrightText: `© ${new Date().getFullYear()} ${BRAND.companyName}. All rights reserved.`,
  footerTagline: "OPERATE · PLAN · GROW",
  socialLinks: [],
  componentSettings: {
    footer: {
      servicesLine: "Managed IT Services · Strategic IT Consulting · Digital Presence",
    },
  },
};

export function normalizeBrandConfig(
  input: Partial<CommunicationBrandConfig> | null | undefined,
): CommunicationBrandConfig {
  if (!input) return DEFAULT_COMMUNICATION_BRAND;
  return {
    ...DEFAULT_COMMUNICATION_BRAND,
    ...input,
    socialLinks: input.socialLinks ?? DEFAULT_COMMUNICATION_BRAND.socialLinks,
    componentSettings: {
      ...DEFAULT_COMMUNICATION_BRAND.componentSettings,
      ...(input.componentSettings ?? {}),
    },
  };
}
