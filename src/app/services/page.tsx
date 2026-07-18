import type { Metadata } from "next";
import { ServicesLanding } from "@/components/services/services-landing";
import { BRAND } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Bobkat IT Services | ${BRAND.companyName}`,
  description:
    "Bobkat IT helps businesses operate securely, plan technology strategy, strengthen digital presence, and optimize continuously through managed services, consulting, and StackScore Technology Advisory.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: `Bobkat IT Services | ${BRAND.companyName}`,
    description:
      "Strategic technology partnership: operate, plan, grow, and optimize with managed IT, consulting, digital presence, and StackScore Technology Advisory.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesLanding />;
}
