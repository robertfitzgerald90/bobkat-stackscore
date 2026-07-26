import type { WebsiteLeadSource, WebsiteLeadStatus } from "@/generated/prisma/client";

export const WEBSITE_LEAD_STATUS_LABELS: Record<WebsiteLeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CONSULTATION_BOOKED: "Consultation booked",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const WEBSITE_LEAD_SOURCE_LABELS: Record<WebsiteLeadSource, string> = {
  BOBKAT_WEBSITE_CONTACT: "Bobkat IT website",
  TECHNOLOGY_SNAPSHOT: "Technology Snapshot",
  MANUAL: "Manual",
  OTHER: "Other",
};

export const ALL_WEBSITE_LEAD_STATUSES: WebsiteLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONSULTATION_BOOKED",
  "CONVERTED",
  "CLOSED",
];

export const ALL_WEBSITE_LEAD_SOURCES: WebsiteLeadSource[] = [
  "BOBKAT_WEBSITE_CONTACT",
  "TECHNOLOGY_SNAPSHOT",
  "MANUAL",
  "OTHER",
];

export function formatWebsiteLeadStatus(status: WebsiteLeadStatus): string {
  return WEBSITE_LEAD_STATUS_LABELS[status] ?? status;
}

export function formatWebsiteLeadSource(source: WebsiteLeadSource): string {
  return WEBSITE_LEAD_SOURCE_LABELS[source] ?? source;
}
