import { z } from "zod";
import { SNAPSHOT_QUESTIONS } from "./questions";

const pillarCodes = SNAPSHOT_QUESTIONS.map((question) => question.pillarCode) as [
  string,
  ...string[],
];

const snapshotAnswerSchema = z.enum(["yes", "partially", "no", "unsure"]);

const answersSchema = z
  .object(
    Object.fromEntries(pillarCodes.map((code) => [code, snapshotAnswerSchema])) as Record<
      string,
      typeof snapshotAnswerSchema
    >,
  )
  .strict();

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
    itManagementModel: z.enum([
      "in_house",
      "outsourced",
      "part_time_internal",
      "none",
      "unsure",
    ]),
    answers: answersSchema,
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
