import { BRAND } from "@/lib/branding";

export const BOBKAT_FOUNDER_SIGNATURE = {
  name: "Bobby Fitzgerald",
  title: `Founder/Owner, ${BRAND.companyName}`,
} as const;

export const DEFAULT_FOUNDER_CLOSING_MESSAGE = "Take care and be well!";

/** Plain-text lines for the founder closing signature block. */
export function buildBobkatFounderSignatureLines(
  closingMessage: string = DEFAULT_FOUNDER_CLOSING_MESSAGE,
): string[] {
  const lines = [
    closingMessage,
    "",
    BOBKAT_FOUNDER_SIGNATURE.name,
    BOBKAT_FOUNDER_SIGNATURE.title,
    "",
    BRAND.email,
  ];

  if (BRAND.phone?.trim()) {
    lines.push(BRAND.phone.trim());
  }

  return lines;
}

export function formatBobkatFounderSignaturePlainText(
  closingMessage: string = DEFAULT_FOUNDER_CLOSING_MESSAGE,
): string {
  return buildBobkatFounderSignatureLines(closingMessage).join("\n");
}
