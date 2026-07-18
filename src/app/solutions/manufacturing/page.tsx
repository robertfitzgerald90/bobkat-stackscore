import type { Metadata } from "next";
import { ManufacturingLanding } from "@/components/solutions/manufacturing-landing";

export const metadata: Metadata = {
  title: "Bobkat Manufacturing | Industrial IT & Operational Technology Solutions",
  description:
    "Bobkat Manufacturing provides secure industrial networking, IT and OT integration, business continuity, operational monitoring, and resilient technology solutions for manufacturing organizations.",
  alternates: {
    canonical: "/solutions/manufacturing",
  },
  openGraph: {
    title: "Bobkat Manufacturing | Industrial IT & Operational Technology Solutions",
    description:
      "Secure industrial networking, IT and OT integration, business continuity, operational monitoring, and resilient technology solutions for manufacturing organizations.",
    url: "/solutions/manufacturing",
    type: "website",
    images: [
      {
        url: "/solutions/manufacturing/Manufacturing Banner Image.png",
        width: 1280,
        height: 640,
        alt: "Bobkat Manufacturing technology solution for industrial operations",
      },
    ],
  },
};

export default function ManufacturingSolutionPage() {
  return <ManufacturingLanding />;
}
