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

export const createSnapshotLeadSchema = z.object({
  contactName: z.string().trim().min(1, "Contact name is required").max(200),
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
});

export const updateSnapshotLeadStatusSchema = z.object({
  status: z.enum([
    "new",
    "contacted",
    "assessment_interested",
    "assessment_purchased",
    "not_interested",
    "converted",
  ]),
});

export type CreateSnapshotLeadInput = z.infer<typeof createSnapshotLeadSchema>;
