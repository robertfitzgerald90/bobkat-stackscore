import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { getGaMeasurementId, isGa4Enabled } from "@/lib/analytics/ga4-config";
import { bobkatLogoSrc } from "@/lib/branding/assets";
import { socialOgImage } from "@/lib/branding/social-og";
import { getBaseUrl } from "@/lib/url/base-url";
import { instrumentFontVariables } from "@/components/design-system/instrument-fonts";
import { appSans } from "@/lib/fonts/app-sans";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const defaultOg = socialOgImage("stackscoreDemo");

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "StackScore | Technology Intelligence for Business",
    template: "%s | StackScore",
  },
  description:
    "Understand your technology environment, identify risks, and prioritize improvements with StackScore.",
  openGraph: {
    type: "website",
    siteName: "StackScore",
    images: [defaultOg],
  },
  twitter: {
    card: "summary_large_image",
    images: [defaultOg.url],
  },
  icons: {
    icon: bobkatLogoSrc(),
    apple: bobkatLogoSrc(),
  },
};

const gaId = getGaMeasurementId();
const analyticsEnabled = isGa4Enabled() && Boolean(gaId);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`overflow-x-clip ${instrumentFontVariables}`}
      suppressHydrationWarning
    >
      <body className={`${appSans.variable} min-w-0 overflow-x-clip font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
        {analyticsEnabled && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
