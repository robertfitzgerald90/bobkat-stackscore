import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerPdfFonts(): void {
  if (registered) return;
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
