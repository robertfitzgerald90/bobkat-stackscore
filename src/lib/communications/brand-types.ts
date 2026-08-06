import { BRAND } from "@/lib/branding";
import { EMAIL_BRAND_ASSETS } from "@/emails/assets";
import { emailTokens } from "@/emails/tokens";

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
    /** @deprecated Unused in defaults — triad lives in footerTagline only */
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
  primaryLogoUrl: EMAIL_BRAND_ASSETS.bobkatItLogo,
  secondaryLogoUrl: null,
  primaryColor: emailTokens.forest,
  secondaryColor: emailTokens.inkSecondary,
  accentColor: emailTokens.forest,
  buttonPrimaryBg: emailTokens.forest,
  buttonPrimaryText: emailTokens.textInverse,
  buttonSecondaryBg: emailTokens.paper,
  buttonSecondaryText: emailTokens.forest,
  fontFamilyHeading: emailTokens.fontFamilyHeading,
  fontFamilyBody: emailTokens.fontFamily,
  companyName: BRAND.companyName,
  productName: BRAND.productName,
  websiteUrl: BRAND.website,
  supportEmail: BRAND.email,
  supportPhone: BRAND.phone,
  address: "",
  copyrightText: `© ${new Date().getFullYear()} ${BRAND.companyName}. All rights reserved.`,
  footerTagline: "BUILD · ADVISE · STABILIZE",
  socialLinks: [],
  componentSettings: {
    primaryButton: {
      borderRadius: emailTokens.radius,
    },
    secondaryButton: {
      borderRadius: emailTokens.radius,
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
      footer: {
        ...DEFAULT_COMMUNICATION_BRAND.componentSettings.footer,
        ...(input.componentSettings?.footer ?? {}),
        // Defaults omit servicesLine; do not reintroduce from empty merge
        servicesLine: input.componentSettings?.footer?.servicesLine,
      },
      primaryButton: {
        ...DEFAULT_COMMUNICATION_BRAND.componentSettings.primaryButton,
        ...(input.componentSettings?.primaryButton ?? {}),
      },
      secondaryButton: {
        ...DEFAULT_COMMUNICATION_BRAND.componentSettings.secondaryButton,
        ...(input.componentSettings?.secondaryButton ?? {}),
      },
    },
  };
}
