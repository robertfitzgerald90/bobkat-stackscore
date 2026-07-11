import {
  buildAccountActivationSampleData,
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

  return mergeTemplateData({}, overrides);
}
