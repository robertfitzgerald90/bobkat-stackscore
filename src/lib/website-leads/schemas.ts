import { z } from "zod";

const trimmedString = (max: number) => z.string().trim().min(1).max(max);

export const WEBSITE_LEAD_SOURCES = [
  "BOBKAT_WEBSITE_CONTACT",
  "TECHNOLOGY_SNAPSHOT",
  "MANUAL",
  "OTHER",
] as const;

export const WEBSITE_LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONSULTATION_BOOKED",
  "CONVERTED",
  "CLOSED",
] as const;

export const createWebsiteLeadIntegrationSchema = z.object({
  name: trimmedString(200),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(320),
  message: trimmedString(5000),
  source: z.enum(WEBSITE_LEAD_SOURCES),
  submissionId: z.string().trim().max(128).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
});

export const updateWebsiteLeadSchema = z.object({
  status: z.enum(WEBSITE_LEAD_STATUSES).optional(),
  internalNotes: z.string().trim().max(10000).optional(),
});

export const convertWebsiteLeadSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("link_existing"),
    clientId: z.string().uuid(),
    assessmentId: z.string().uuid().optional(),
  }),
  z.object({
    mode: z.literal("create_new"),
    companyName: trimmedString(200),
    primaryContactName: trimmedString(200),
    primaryContactEmail: z.string().trim().email().max(320),
    primaryContactPhone: z.string().trim().max(40).optional().or(z.literal("")),
    industry: z.string().trim().max(120).optional().or(z.literal("")),
  }),
]);

export type CreateWebsiteLeadIntegrationInput = z.infer<typeof createWebsiteLeadIntegrationSchema>;
export type UpdateWebsiteLeadInput = z.infer<typeof updateWebsiteLeadSchema>;
export type ConvertWebsiteLeadInput = z.infer<typeof convertWebsiteLeadSchema>;
