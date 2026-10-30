import localFont from "next/font/local";

/**
 * StackScore "Instrument" design system typography trio.
 *
 * Self-hosted via `next/font/local` (see `src/fonts/`) so Turbopack builds do
 * not hit the intermittent Google Fonts `/l/font?kit=` URL bug
 * (`next/font/google queries have exactly one entry`).
 *
 * These variables are only consumed inside the `.instrument` CSS scope
 * (see `src/styles/instrument-tokens.css`), so nothing outside a page that
 * opts in with the `instrument` class is affected — except that the CSS
 * variables are applied on `<html>` for customer portal theme reuse.
 */
export const instrumentDisplay = localFont({
  src: [
    {
      path: "../../fonts/space-grotesk-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/space-grotesk-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/space-grotesk-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-instrument-display",
  display: "swap",
});

export const instrumentBody = localFont({
  src: [
    {
      path: "../../fonts/source-sans-3-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/source-sans-3-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/source-sans-3-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-instrument-body",
  display: "swap",
});

export const instrumentMono = localFont({
  src: [
    {
      path: "../../fonts/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/jetbrains-mono-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-instrument-mono",
  display: "swap",
});

export const instrumentFontVariables = [
  instrumentDisplay.variable,
  instrumentBody.variable,
  instrumentMono.variable,
].join(" ");
