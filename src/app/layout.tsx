import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
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
  title: "Bobkat StackScore",
  description: "Technology maturity assessments for small and medium businesses",
  icons: {
    icon: "/branding/bobkat-it-logo-navy.png",
    apple: "/branding/bobkat-it-logo-navy.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-clip">
      <body className={`${inter.variable} min-w-0 overflow-x-hidden font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
