import { z } from "zod";
import { findDuplicateByEmail } from "@/lib/communications/outreach/duplicate-detection";
import { executeQuickInvite } from "@/lib/communications/outreach/quick-invite";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

const csvRowSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  company: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CsvImportRow = z.infer<typeof csvRowSchema>;

export type CsvImportPreviewRow = CsvImportRow & {
  rowNumber: number;
  duplicate: Awaited<ReturnType<typeof findDuplicateByEmail>>;
  valid: boolean;
  error?: string;
};

export function parseCsvContent(content: string): CsvImportRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
  const dataLines = lines.slice(1);

  const indexOf = (names: string[]) =>
    header.findIndex((h) => names.some((n) => h.includes(n)));

  const firstNameIdx = indexOf(["firstname", "first"]);
  const lastNameIdx = indexOf(["lastname", "last"]);
  const companyIdx = indexOf(["company", "organization"]);
  const emailIdx = indexOf(["email"]);
  const phoneIdx = indexOf(["phone"]);
  const industryIdx = indexOf(["industry"]);
  const notesIdx = indexOf(["notes", "note"]);

  if (firstNameIdx < 0 || lastNameIdx < 0 || companyIdx < 0 || emailIdx < 0) {
    throw new Error("CSV must include First Name, Last Name, Company, and Email columns");
  }

  return dataLines.map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    return {
      firstName: cols[firstNameIdx] ?? "",
      lastName: cols[lastNameIdx] ?? "",
      company: cols[companyIdx] ?? "",
      email: cols[emailIdx] ?? "",
      phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
      industry: industryIdx >= 0 ? cols[industryIdx] : undefined,
      notes: notesIdx >= 0 ? cols[notesIdx] : undefined,
    };
  });
}

export async function previewCsvImport(content: string): Promise<CsvImportPreviewRow[]> {
  const rows = parseCsvContent(content);
  const preview: CsvImportPreviewRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2;
    const parsed = csvRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      preview.push({
        ...rows[i],
        rowNumber,
        duplicate: null,
        valid: false,
        error: parsed.error.issues[0]?.message ?? "Invalid row",
      });
      continue;
    }

    const duplicate = await findDuplicateByEmail(normalizePurchaserEmail(parsed.data.email));
    preview.push({
      ...parsed.data,
      rowNumber,
      duplicate,
      valid: true,
    });
  }

  return preview;
}

export async function importCsvRows(input: {
  rows: CsvImportRow[];
  campaignId?: string;
  createdByUserId: string;
  skipDuplicates?: boolean;
}) {
  const results: Array<{
    email: string;
    ok: boolean;
    error?: string;
    prospectId?: string;
  }> = [];

  for (const row of input.rows) {
    try {
      if (input.skipDuplicates) {
        const dup = await findDuplicateByEmail(normalizePurchaserEmail(row.email));
        if (dup) {
          results.push({ email: row.email, ok: false, error: "Duplicate skipped" });
          continue;
        }
      }

      const result = await executeQuickInvite({
        ...row,
        templateKey: "EMAIL-009",
        campaignId: input.campaignId,
        createdByUserId: input.createdByUserId,
        forceResend: false,
        skipDuplicateCheck: input.skipDuplicates,
      });
      results.push({ email: row.email, ok: true, prospectId: result.prospectId });
    } catch (error) {
      results.push({
        email: row.email,
        ok: false,
        error: error instanceof Error ? error.message : "Import failed",
      });
    }
  }

  return results;
}
