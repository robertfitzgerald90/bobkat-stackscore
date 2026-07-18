import type { VariableCategory, VariableDefinition } from "@/lib/communications/types";
import { EMAIL_TEMPLATE_REGISTRY } from "@/lib/communications/registry";

const BASE_VARIABLES: VariableDefinition[] = [
  {
    name: "firstName",
    description: "Recipient first name for personalized greeting.",
    example: "Alex",
    category: "Customer",
    required: false,
    source: "User profile",
  },
  {
    name: "organizationName",
    description: "Client company name shown in onboarding and assessment emails.",
    example: "Northwind Professional Services",
    category: "Customer",
    required: false,
    source: "Client record",
  },
  {
    name: "supportEmail",
    description: "Support contact email displayed in footer and closing copy.",
    example: "bobby@bobkatit.com",
    category: "Communications",
    required: false,
    source: "Brand settings",
  },
  {
    name: "websiteUrl",
    description: "Company website URL for footer links.",
    example: "www.bobkatit.com",
    category: "Communications",
    required: false,
    source: "Brand settings",
  },
  {
    name: "activationUrl",
    description: "Secure one-time account activation link.",
    example: "https://stackscore.tech/activate?token=…",
    category: "Authentication",
    required: true,
    source: "Account activation token",
  },
  {
    name: "assessmentName",
    description: "Display name of the purchased assessment product.",
    example: "StackScore Technology Maturity Assessment",
    category: "Assessment",
    required: false,
    source: "Assessment purchase",
  },
  {
    name: "expirationDays",
    description: "Number of days before a secure link expires.",
    example: "7",
    category: "Authentication",
    required: false,
    source: "Token policy",
  },
  {
    name: "resultsUrl",
    description: "Link to completed assessment results.",
    example: "https://stackscore.tech/clients/…/technology-profile",
    category: "Assessment",
    required: true,
    source: "Assessment record",
  },
  {
    name: "roadmapUrl",
    description: "Link to the generated technology roadmap.",
    example: "https://stackscore.tech/clients/…/roadmap",
    category: "Roadmap",
    required: true,
    source: "Roadmap record",
  },
  {
    name: "proposalUrl",
    description: "Link to a technology proposal document.",
    example: "https://stackscore.tech/clients/…/proposals/…",
    category: "Proposal",
    required: true,
    source: "Proposal record",
  },
  {
    name: "resetUrl",
    description: "Secure password reset link.",
    example: "https://stackscore.tech/reset-password?token=…",
    category: "Authentication",
    required: true,
    source: "Password reset token",
  },
  {
    name: "reviewUrl",
    description: "Scheduling link for quarterly technology review.",
    example: "https://stackscore.tech/review/schedule",
    category: "Future",
    required: true,
    source: "Review workflow",
  },
  {
    name: "projectUrl",
    description: "Link to a project workspace.",
    example: "https://stackscore.tech/projects/…",
    category: "Projects",
    required: true,
    source: "Project record",
  },
  {
    name: "projectName",
    description: "Implementation project display name.",
    example: "Microsoft 365 Security Hardening",
    category: "Projects",
    required: false,
    source: "Project record",
  },
  {
    name: "invitationUrl",
    description: "Assessment invitation acceptance link.",
    example: "https://stackscore.tech/assessment/invite/…",
    category: "Assessment",
    required: true,
    source: "Invitation token",
  },
];

export const VARIABLE_CATEGORIES: VariableCategory[] = [
  "Customer",
  "Assessment",
  "Organization",
  "Roadmap",
  "Proposal",
  "Projects",
  "Technology",
  "Communications",
  "Authentication",
  "Future",
];

export function listCommunicationVariables(): VariableDefinition[] {
  const registryVariables = EMAIL_TEMPLATE_REGISTRY.flatMap((template) => [
    ...template.requiredVariables.map((name) => ({ name, required: true, templateKey: template.key })),
    ...template.optionalVariables.map((name) => ({ name, required: false, templateKey: template.key })),
  ]);

  const merged = new Map<string, VariableDefinition>();
  for (const variable of BASE_VARIABLES) {
    merged.set(variable.name, variable);
  }

  for (const entry of registryVariables) {
    if (merged.has(entry.name)) continue;
    merged.set(entry.name, {
      name: entry.name,
      description: `Used by ${entry.templateKey}.`,
      example: "—",
      category: "Future",
      required: entry.required,
      source: "Template registry",
    });
  }

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterCommunicationVariables(options: {
  query?: string;
  category?: VariableCategory | "all";
}): VariableDefinition[] {
  const query = options.query?.trim().toLowerCase() ?? "";
  return listCommunicationVariables().filter((variable) => {
    if (options.category && options.category !== "all" && variable.category !== options.category) {
      return false;
    }
    if (!query) return true;
    return (
      variable.name.toLowerCase().includes(query) ||
      variable.description.toLowerCase().includes(query) ||
      variable.category.toLowerCase().includes(query) ||
      variable.source.toLowerCase().includes(query)
    );
  });
}

export function getVariablesForTemplate(templateKey: string): VariableDefinition[] {
  const template = EMAIL_TEMPLATE_REGISTRY.find((entry) => entry.key === templateKey);
  if (!template) return [];
  const all = listCommunicationVariables();
  const names = new Set([...template.requiredVariables, ...template.optionalVariables]);
  return all.filter((variable) => names.has(variable.name));
}
