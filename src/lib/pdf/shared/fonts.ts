import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";
import { REPORT_FONTS } from "@/lib/pdf/shared/tokens";

let registered = false;
let displayFontFamily: string = REPORT_FONTS.display;
let displayBoldFontFamily: string = REPORT_FONTS.displayBold;

function fontsDir(): string {
  return path.join(process.cwd(), "src", "lib", "pdf", "fonts");
}

function fontPath(fileName: string): string {
  return path.join(fontsDir(), fileName);
}

function assertFontFile(fileName: string): string {
  const absolute = fontPath(fileName);
  if (!fs.existsSync(absolute)) {
    throw new Error(`PDF font missing: ${absolute}`);
  }
  return absolute;
}

function firstExisting(...fileNames: string[]): string | null {
  for (const fileName of fileNames) {
    const absolute = fontPath(fileName);
    if (fs.existsSync(absolute) && fs.statSync(absolute).size > 1000) {
      return absolute;
    }
  }
  return null;
}

/**
 * Registers paper-safe brand fonts for @react-pdf/renderer.
 * Space Grotesk (display), Source Sans 3 (body), JetBrains Mono (scores/labels).
 *
 * Prefer static .woff for Space Grotesk — the Google Fonts variable TTF
 * (`SpaceGrotesk[wght].ttf`) is not reliably supported by react-pdf/fontkit.
 */
export function registerPdfFonts(): void {
  if (registered) return;

  Font.registerHyphenationCallback((word) => [word]);

  Font.register({
    family: REPORT_FONTS.body,
    src: assertFontFile("SourceSans3-Regular.ttf"),
  });
  Font.register({
    family: REPORT_FONTS.bodyBold,
    src: assertFontFile("SourceSans3-Bold.ttf"),
  });

  Font.register({
    family: REPORT_FONTS.mono,
    src: assertFontFile("JetBrainsMono-Regular.ttf"),
  });
  Font.register({
    family: REPORT_FONTS.monoBold,
    src: assertFontFile("JetBrainsMono-Bold.ttf"),
  });

  const spaceRegular = firstExisting(
    "SpaceGrotesk-Regular.woff",
    "SpaceGrotesk-Regular.ttf",
  );
  const spaceBold = firstExisting(
    "SpaceGrotesk-Bold.woff",
    "SpaceGrotesk-Bold.ttf",
    "SpaceGrotesk-Regular.woff",
    "SpaceGrotesk-Regular.ttf",
  );

  if (spaceRegular && spaceBold) {
    Font.register({
      family: REPORT_FONTS.display,
      src: spaceRegular,
    });
    Font.register({
      family: REPORT_FONTS.displayBold,
      src: spaceBold,
    });
    displayFontFamily = REPORT_FONTS.display;
    displayBoldFontFamily = REPORT_FONTS.displayBold;
  } else {
    // Explicit fallback — do not silently keep Helvetica.
    displayFontFamily = REPORT_FONTS.body;
    displayBoldFontFamily = REPORT_FONTS.bodyBold;
    console.warn(
      "[pdf/fonts] Space Grotesk files missing; display roles use Source Sans 3.",
    );
  }

  registered = true;
}

export function getPdfDisplayFont(bold = false): string {
  registerPdfFonts();
  return bold ? displayBoldFontFamily : displayFontFamily;
}

export function getPdfBodyFont(bold = false): string {
  registerPdfFonts();
  return bold ? REPORT_FONTS.bodyBold : REPORT_FONTS.body;
}

export function getPdfMonoFont(bold = false): string {
  registerPdfFonts();
  return bold ? REPORT_FONTS.monoBold : REPORT_FONTS.mono;
}
