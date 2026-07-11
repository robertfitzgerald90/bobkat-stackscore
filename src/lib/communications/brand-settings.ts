import type { Prisma } from "@/generated/prisma/client";
import { withCommunicationDbFallback } from "@/lib/communications/db-safe";
import {
  DEFAULT_COMMUNICATION_BRAND,
  normalizeBrandConfig,
  type CommunicationBrandConfig,
  type SharedComponentSettings,
  type SocialLink,
} from "@/lib/communications/brand-types";
import { prisma } from "@/lib/db";

export type BrandSettingsInput = Partial<
  Omit<CommunicationBrandConfig, "socialLinks" | "componentSettings">
> & {
  socialLinks?: SocialLink[];
  componentSettings?: SharedComponentSettings;
};

function mapRecord(record: {
  primaryLogoUrl: string | null;
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
  websiteUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  address: string | null;
  copyrightText: string | null;
  footerTagline: string | null;
  socialLinks: Prisma.JsonValue;
  componentSettings: Prisma.JsonValue;
}): CommunicationBrandConfig {
  return normalizeBrandConfig({
    primaryLogoUrl: record.primaryLogoUrl ?? DEFAULT_COMMUNICATION_BRAND.primaryLogoUrl,
    secondaryLogoUrl: record.secondaryLogoUrl,
    primaryColor: record.primaryColor,
    secondaryColor: record.secondaryColor,
    accentColor: record.accentColor,
    buttonPrimaryBg: record.buttonPrimaryBg,
    buttonPrimaryText: record.buttonPrimaryText,
    buttonSecondaryBg: record.buttonSecondaryBg,
    buttonSecondaryText: record.buttonSecondaryText,
    fontFamilyHeading: record.fontFamilyHeading,
    fontFamilyBody: record.fontFamilyBody,
    companyName: record.companyName,
    productName: record.productName,
    websiteUrl: record.websiteUrl ?? DEFAULT_COMMUNICATION_BRAND.websiteUrl,
    supportEmail: record.supportEmail ?? DEFAULT_COMMUNICATION_BRAND.supportEmail,
    supportPhone: record.supportPhone ?? DEFAULT_COMMUNICATION_BRAND.supportPhone,
    address: record.address ?? "",
    copyrightText: record.copyrightText ?? DEFAULT_COMMUNICATION_BRAND.copyrightText,
    footerTagline: record.footerTagline ?? DEFAULT_COMMUNICATION_BRAND.footerTagline,
    socialLinks: (record.socialLinks as SocialLink[] | null) ?? [],
    componentSettings: (record.componentSettings as SharedComponentSettings | null) ?? {},
  });
}

export async function getCommunicationBrandSettings(): Promise<CommunicationBrandConfig> {
  const record = await withCommunicationDbFallback(
    () => prisma.communicationBrandSettings.findUnique({ where: { id: "default" } }),
    null,
  );
  if (!record) return DEFAULT_COMMUNICATION_BRAND;
  return mapRecord(record);
}

export async function upsertCommunicationBrandSettings(
  input: BrandSettingsInput,
  updatedByUserId: string,
): Promise<CommunicationBrandConfig> {
  const current = await getCommunicationBrandSettings();
  const merged = normalizeBrandConfig({
    ...current,
    ...input,
    socialLinks: input.socialLinks ?? current.socialLinks,
    componentSettings: {
      ...current.componentSettings,
      ...(input.componentSettings ?? {}),
    },
  });

  const record = await prisma.communicationBrandSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...merged,
      socialLinks: merged.socialLinks as Prisma.InputJsonValue,
      componentSettings: merged.componentSettings as Prisma.InputJsonValue,
      updatedByUserId,
    },
    update: {
      ...merged,
      socialLinks: merged.socialLinks as Prisma.InputJsonValue,
      componentSettings: merged.componentSettings as Prisma.InputJsonValue,
      updatedByUserId,
    },
  });

  return mapRecord(record);
}

export async function updateSharedComponentSettings(
  componentKey: keyof SharedComponentSettings,
  settings: SharedComponentSettings[keyof SharedComponentSettings],
  updatedByUserId: string,
): Promise<CommunicationBrandConfig> {
  const current = await getCommunicationBrandSettings();
  return upsertCommunicationBrandSettings(
    {
      componentSettings: {
        ...current.componentSettings,
        [componentKey]: settings,
      },
    },
    updatedByUserId,
  );
}
