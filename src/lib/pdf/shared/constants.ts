import path from "path";
import { BOBKAT_IT_LOGO } from "@/lib/branding/assets";

export const PDF_TARGET_SCORE = 80;

export function getPdfLogoPath(): string {
  return path.join(process.cwd(), "public", "branding", BOBKAT_IT_LOGO.fileName);
}

export function getPdfLogoDisplaySize(height: number): { width: number; height: number } {
  return {
    width: Math.round(height * BOBKAT_IT_LOGO.aspectRatio),
    height,
  };
}
