import type { Metadata } from "next";
import { EssentialsLanding } from "@/components/solutions/essentials-landing";
import { publicAssetUrl } from "@/lib/branding/assets";

export const metadata: Metadata = {
  title: "Bobkat Essentials | Complete IT for Small Businesses",
  description:
    "Bobkat Essentials provides secure networking, Microsoft 365 management, cybersecurity, monitoring, backups, and proactive IT support for small businesses.",
  alternates: {
    canonical: "/solutions/essentials",
  },
  openGraph: {
    title: "Bobkat Essentials | Complete IT for Small Businesses",
    description:
      "Secure networking, Microsoft 365 management, cybersecurity, monitoring, backups, and proactive IT support for small businesses.",
    url: "/solutions/essentials",
    type: "website",
    images: [
      {
        url: publicAssetUrl("/solutions/essentials/Essentials Banner Image.png"),
        width: 1280,
        height: 640,
        alt: "Bobkat Essentials secure technology solution for small businesses",
      },
    ],
  },
};

export default function EssentialsSolutionPage() {
  return <EssentialsLanding />;
}
