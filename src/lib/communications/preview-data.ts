import {
  buildAccountActivationSampleData,
  buildVcioWelcomeSampleData,
  mergeTemplateData,
} from "@/lib/communications/sample-data";

/** Safe sample overrides for preview — never uses production tokens. */
export function buildPreviewTemplateData(
  templateKey: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  if (templateKey === "EMAIL-001") {
    return buildAccountActivationSampleData(
      overrides as Parameters<typeof buildAccountActivationSampleData>[0],
    );
  }

  if (templateKey === "EMAIL-010") {
    return buildVcioWelcomeSampleData(overrides);
  }

  return mergeTemplateData({}, overrides);
}
