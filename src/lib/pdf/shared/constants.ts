import path from "path";

export const PDF_TARGET_SCORE = 80;

/**
 * SS-REL-017-R3 — Paper reports use the approved Bobkat IT emblem on a black
 * plate so the wolf remains visible on white/light PDF backgrounds.
 * Web/email continue to use the transparent master (`bkit-logo.png`).
 */
export const PDF_LOGO_FILE_NAME = "new-bobkat-it-logo.png";
/** Native pixel aspect of `new-bobkat-it-logo.png` (4800×3300). */
export const PDF_LOGO_ASPECT_RATIO = 4800 / 3300;

export function getPdfLogoPath(): string {
  return path.join(process.cwd(), "public", "branding", PDF_LOGO_FILE_NAME);
}

export function getPdfLogoDisplaySize(height: number): { width: number; height: number } {
  return {
    width: Math.round(height * PDF_LOGO_ASPECT_RATIO),
    height,
  };
}
