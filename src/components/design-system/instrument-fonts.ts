import { Space_Grotesk, Source_Sans_3, JetBrains_Mono } from "next/font/google";

/**
 * StackScore "Instrument" design system typography trio.
 *
 * Loaded independently of the app-wide Inter font in `src/app/layout.tsx`.
 * These variables are only consumed inside the `.instrument` CSS scope
 * (see `src/styles/instrument-tokens.css`), so nothing outside a page that
 * opts in with the `instrument` class is affected.
 */
export const instrumentDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-instrument-display",
  display: "swap",
});

export const instrumentBody = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-body",
  display: "swap",
});

export const instrumentMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-mono",
  display: "swap",
});

export const instrumentFontVariables = [
  instrumentDisplay.variable,
  instrumentBody.variable,
  instrumentMono.variable,
].join(" ");
