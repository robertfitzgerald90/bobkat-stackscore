import { z } from "zod";
import { SNAPSHOT_QUESTION_IDS_V2, SNAPSHOT_QUESTIONS_V2 } from "./catalog-v2";
import { SNAPSHOT_QUESTIONS } from "./questions";

const pillarCodes = SNAPSHOT_QUESTIONS.map((question) => question.pillarCode) as [
  string,
  ...string[],
];

const snapshotAnswerSchema = z.enum(["yes", "partially", "no", "unsure"]);

const answersSchemaV1 = z
  .object(
    Object.fromEntries(pillarCodes.map((code) => [code, snapshotAnswerSchema])) as Record<
      string,
      typeof snapshotAnswerSchema
    >,
  )
  .strict();

const answersSchemaV2 = z
  .object(
    Object.fromEntries(
      SNAPSHOT_QUESTION_IDS_V2.map((id) => [id, snapshotAnswerSchema]),
    ) as Record<string, typeof snapshotAnswerSchema>,
  )
  .strict()
  .superRefine((value, ctx) => {
    for (const question of SNAPSHOT_QUESTIONS_V2) {
      if (!value[question.id]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Answer required for ${question.id}`,
          path: [question.id],
        });
      }
    }
  });

const snapshotLeadStatusValues = [
  "new",
  "contacted",
  "follow_up",
  "assessment_interested",
  "assessment_invited",
  "assessment_purchased",
  "not_interested",
  "converted",
  "archived",
] as const;

const itManagementSchema = z.enum([
  "in_house",
  "outsourced",
  "part_time_internal",
  "none",
  "unsure",
]);

/** Legacy snap-1.0 create (kept for compatibility / tests). */
export const createSnapshotLeadSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(80).optional(),
    lastName: z.string().trim().max(80).optional().or(z.literal("")),
    contactName: z.string().trim().max(200).optional(),
    companyName: z.string().trim().min(1, "Company name is required").max(200),
    email: z.string().trim().email("A valid email is required").max(320),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    industry: z.string().trim().min(1, "Industry is required").max(200),
    companySize: z.string().trim().max(100).optional().or(z.literal("")),
    itManagementModel: itManagementSchema,
    answers: answersSchemaV1,
    prospectId: z.string().uuid().optional(),
    contactConsent: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.firstName?.trim() && !value.contactName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "First name is required",
        path: ["firstName"],
      });
    }
  });

/**
 * Snapshot 2.0 optional contact capture after anonymous results.
 * Server recomputes findings from answers — client scores are ignored.
 */
export const createSnapshotLeadV2Schema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(80),
    lastName: z.string().trim().max(80).optional().or(z.literal("")),
    email: z.string().trim().email("A valid email is required").max(320),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    companyName: z.string().trim().max(200).optional().or(z.literal("")),
    industry: z.string().trim().max(200).optional().or(z.literal("")),
    companySize: z.string().trim().max(100).optional().or(z.literal("")),
    itManagementModel: itManagementSchema.optional(),
    answers: answersSchemaV2,
    /** Required affirmative consent to be contacted about results. */
    contactConsent: z.boolean(),
    /** Optional marketing — only stored when true. */
    marketingConsent: z.boolean().optional().default(false),
    prospectId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    sourcePath: z.string().trim().max(200).optional(),
    /** Honeypot — must be empty. */
    website: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.contactConsent !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contact consent is required to save your Snapshot",
        path: ["contactConsent"],
      });
    }
    if (value.website && value.website.trim().length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid submission",
        path: ["website"],
      });
    }
  });

export const updateSnapshotLeadStatusSchema = z.object({
  status: z.enum(snapshotLeadStatusValues),
});

export const createSnapshotLeadNoteSchema = z.object({
  note: z.string().trim().min(1, "Note is required").max(5000),
});

export const sendSnapshotLeadInvitationSchema = z.object({
  forceResend: z.boolean().optional(),
});

export const convertSnapshotLeadSchema = z.object({
  clientId: z.string().uuid().optional().nullable(),
});

export type CreateSnapshotLeadInput = z.infer<typeof createSnapshotLeadSchema>;
export type CreateSnapshotLeadV2Input = z.infer<typeof createSnapshotLeadV2Schema>;
