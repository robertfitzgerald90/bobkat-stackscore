import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/providers";
import { getGaMeasurementId, isGa4Enabled } from "@/lib/analytics/ga4-config";
import { bobkatLogoSrc } from "@/lib/branding/assets";
import { getBaseUrl } from "@/lib/url/base-url";
import { instrumentFontVariables } from "@/components/design-system/instrument-fonts";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Bobkat StackScore",
  description: "Technology maturity assessments for small and medium businesses",
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
      <body className={`${inter.variable} min-w-0 overflow-x-clip font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
        {analyticsEnabled && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
