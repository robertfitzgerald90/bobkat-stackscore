import localFont from "next/font/local";

/**
 * App-wide sans (replaces `next/font/google` Inter).
 * Self-hosted to avoid Turbopack Google Fonts kit-URL failures.
 */
export const appSans = localFont({
  src: [
    {
      path: "../../fonts/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/inter-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});
