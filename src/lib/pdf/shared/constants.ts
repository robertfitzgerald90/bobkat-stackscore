import path from "path";

export const PDF_TARGET_SCORE = 80;

export function getPdfLogoPath(): string {
  return path.join(process.cwd(), "public", "branding", "bobkat-it-logo-navy.png");
}
