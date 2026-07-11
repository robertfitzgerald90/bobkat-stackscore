import type { CommunicationBrandConfig } from "@/lib/communications/brand-types";

export type SharedComponentId =
  | "header"
  | "footer"
  | "primary-button"
  | "secondary-button"
  | "divider"
  | "information-card"
  | "security-notice"
  | "callout"
  | "cta-section"
  | "signature"
  | "social-links";

export type SharedComponentDefinition = {
  id: SharedComponentId;
  name: string;
  description: string;
  editableFields: string[];
};

export const SHARED_COMPONENT_DEFINITIONS: SharedComponentDefinition[] = [
  {
    id: "header",
    name: "Header",
    description: "Logo, product name, and powered-by tagline at the top of every email.",
    editableFields: ["Primary logo", "Product name", "Company name", "Tagline", "Primary color"],
  },
  {
    id: "footer",
    name: "Footer",
    description: "Team signature, company details, support links, and copyright.",
    editableFields: [
      "Company name",
      "Footer tagline",
      "Website",
      "Support email",
      "Phone",
      "Address",
      "Copyright",
    ],
  },
  {
    id: "primary-button",
    name: "Primary Button",
    description: "Main call-to-action button used for activation and key actions.",
    editableFields: ["Background color", "Text color", "Border radius"],
  },
  {
    id: "secondary-button",
    name: "Secondary Button",
    description: "Secondary action button for less prominent actions.",
    editableFields: ["Background color", "Text color", "Border radius"],
  },
  {
    id: "divider",
    name: "Divider",
    description: "Horizontal rule separating email sections.",
    editableFields: ["Border color"],
  },
  {
    id: "information-card",
    name: "Information Card",
    description: "Structured content block for steps, summaries, and details.",
    editableFields: ["Background", "Border color", "Heading color"],
  },
  {
    id: "security-notice",
    name: "Security Notice",
    description: "Highlighted security reminders and expiration warnings.",
    editableFields: ["Accent color", "Background"],
  },
  {
    id: "callout",
    name: "Callout",
    description: "Emphasis panel for important announcements.",
    editableFields: ["Accent color", "Background"],
  },
  {
    id: "cta-section",
    name: "CTA Section",
    description: "Grouped call-to-action area with supporting copy.",
    editableFields: ["Button styles", "Spacing"],
  },
  {
    id: "signature",
    name: "Signature",
    description: "Sender signature block for consultant-authored messages.",
    editableFields: ["Name", "Title", "Company name"],
  },
  {
    id: "social-links",
    name: "Social Links",
    description: "LinkedIn, website, and other social profile links in the footer.",
    editableFields: ["Social links", "Enabled"],
  },
];

export function getSharedComponentDefinition(id: SharedComponentId) {
  return SHARED_COMPONENT_DEFINITIONS.find((component) => component.id === id);
}

export function getSharedComponentPreviewValues(
  brand: CommunicationBrandConfig,
  componentId: SharedComponentId,
): Record<string, string> {
  switch (componentId) {
    case "header":
      return {
        "Primary logo": brand.primaryLogoUrl,
        "Product name": brand.productName,
        "Company name": brand.companyName,
        Tagline: brand.componentSettings.header?.tagline ?? `Powered by ${brand.companyName}`,
        "Primary color": brand.primaryColor,
      };
    case "footer":
      return {
        "Company name": brand.companyName,
        "Footer tagline": brand.footerTagline,
        Website: brand.websiteUrl,
        "Support email": brand.supportEmail,
        Phone: brand.supportPhone || "Not set",
        Address: brand.address || "Not set",
        Copyright: brand.copyrightText,
      };
    case "primary-button":
      return {
        "Background color": brand.buttonPrimaryBg,
        "Text color": brand.buttonPrimaryText,
        "Border radius": brand.componentSettings.primaryButton?.borderRadius ?? "8px",
      };
    case "secondary-button":
      return {
        "Background color": brand.buttonSecondaryBg,
        "Text color": brand.buttonSecondaryText,
        "Border radius": brand.componentSettings.secondaryButton?.borderRadius ?? "8px",
      };
    case "social-links":
      return {
        Enabled: brand.componentSettings.socialLinks?.enabled === false ? "No" : "Yes",
        "Social links":
          brand.socialLinks.length > 0
            ? brand.socialLinks.map((link) => link.platform).join(", ")
            : "None configured",
      };
    case "signature":
      return {
        Name: brand.componentSettings.signature?.name ?? `The ${brand.productName} Team`,
        Title: brand.componentSettings.signature?.title ?? brand.companyName,
        "Company name": brand.companyName,
      };
    default:
      return {
        "Primary color": brand.primaryColor,
        "Secondary color": brand.secondaryColor,
        "Accent color": brand.accentColor,
      };
  }
}
