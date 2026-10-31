import fs from "node:fs";
import { getPdfLogoPath } from "@/lib/pdf/shared/constants";

/**
 * Buffer source for react-pdf Image — Node-only (do not import from client modules).
 */
export function getPdfLogoSource(): Buffer {
  const absolute = getPdfLogoPath();
  if (!fs.existsSync(absolute)) {
    throw new Error(`PDF logo missing: ${absolute}`);
  }
  return fs.readFileSync(absolute);
}
