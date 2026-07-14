import { BRAND } from "@/lib/branding";

export type SnapshotLeadContactFields = {
  contactName: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
};

export function splitContactName(contactName: string): { firstName: string; lastName: string } {
  const parts = contactName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export function resolveLeadFirstName(lead: SnapshotLeadContactFields): string {
  if (lead.firstName?.trim()) return lead.firstName.trim();
  return splitContactName(lead.contactName).firstName;
}

export function resolveLeadDisplayName(lead: SnapshotLeadContactFields): string {
  const first = lead.firstName?.trim();
  const last = lead.lastName?.trim();
  if (first || last) {
    return `${first ?? ""} ${last ?? ""}`.trim();
  }
  const name = lead.contactName.trim();
  if (name) return name;
  if (lead.email.trim()) return lead.email.trim();
  return "Unnamed Lead";
}

export function buildContactName(firstName: string, lastName?: string | null): string {
  return `${firstName.trim()} ${lastName?.trim() ?? ""}`.trim();
}

export function normalizePhoneForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function buildSnapshotLeadMailtoUrl(lead: SnapshotLeadContactFields): string {
  const firstName = resolveLeadFirstName(lead) || "there";
  const subject = encodeURIComponent("Your Bobkat IT Technology Snapshot");
  const body = encodeURIComponent(
    `Hi ${firstName},

Thank you for completing the Bobkat IT Technology Snapshot. I reviewed your results and would be happy to discuss what they mean for your business and the next steps available.

You can reply to this email or schedule a consultation at your convenience.

Thanks,
${BRAND.companyName}`,
  );
  return `mailto:${lead.email}?subject=${subject}&body=${body}`;
}

export const NOT_PROVIDED_LABEL = "Not provided";
