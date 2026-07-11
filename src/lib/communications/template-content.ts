export type TemplateContentBlock = {
  heroTitle?: string;
  heroDescription?: string;
  contentParagraphs?: string[];
  ctaLabel?: string;
  ctaHrefVariable?: string;
  nextSteps?: string[];
  securityItems?: string[];
  closingParagraph?: string;
};

export type TemplateVersionContent = TemplateContentBlock & {
  subject?: string;
  previewText?: string;
};

export const EMAIL_001_SHARED_COMPONENTS = [
  "header",
  "hero",
  "content-section",
  "primary-button",
  "next-steps",
  "security-notice",
  "footer",
] as const;

const EMAIL_001_DEFAULTS: TemplateContentBlock = {
  heroDescription: "You're one step away from a clear picture of your technology environment.",
  contentParagraphs: [
    "Thank you for purchasing your assessment.",
    "You are about to gain a clear understanding of your technology environment, uncover hidden risks, and identify practical opportunities to strengthen your business through technology.",
    "StackScore transforms technical information into clear, measurable insights so you can make technology decisions with confidence.",
  ],
  ctaLabel: "Activate My Assessment",
  ctaHrefVariable: "activationUrl",
  nextSteps: [
    "Activate your account",
    "Complete your guided assessment",
    "Review your technology health scores and recommendations",
    "Build a prioritized roadmap",
    "Meet with Bobkat IT to discuss next steps",
  ],
  securityItems: [
    "The activation link expires in {{expirationDays}} days",
    "The link may only be used once",
    "If you did not request this message, you may safely ignore it",
  ],
  closingParagraph: "Questions? Contact us at {{supportEmail}}. We're here to help you get started.",
};

export function getDefaultTemplateContent(templateKey: string): TemplateContentBlock {
  if (templateKey === "EMAIL-001") {
    return { ...EMAIL_001_DEFAULTS };
  }
  return {};
}

export function getDefaultSharedComponents(templateKey: string): string[] {
  if (templateKey === "EMAIL-001") {
    return [...EMAIL_001_SHARED_COMPONENTS];
  }
  return ["header", "footer"];
}

export function mergeTemplateContent(
  base: TemplateContentBlock,
  overrides: TemplateContentBlock | null | undefined,
): TemplateContentBlock {
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    contentParagraphs: overrides.contentParagraphs ?? base.contentParagraphs,
    nextSteps: overrides.nextSteps ?? base.nextSteps,
    securityItems: overrides.securityItems ?? base.securityItems,
  };
}
